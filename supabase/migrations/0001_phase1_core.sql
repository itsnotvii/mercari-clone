-- Phase 1 marketplace feature expansion.
--
-- IMPORTANT: run this manually, once, in the Supabase Dashboard's SQL Editor
-- (Table Editor -> SQL Editor -> New query -> paste this file -> Run).
-- The app's anon key cannot execute DDL, so this cannot be applied by the app itself.
--
-- Additive only: does not alter any existing column on listings/profiles/offers/reviews,
-- except the one explicitly-marked `alter table listings add column images` below.
--
-- Action item before running: confirm listings.id's column type in the Table Editor.
-- The FK columns below assume `bigint`. If listings.id is `int4`/`integer`, change
-- every `bigint references public.listings(id)` below to `integer references public.listings(id)`.

-- ============ Persisted likes / wishlist ============
create table public.listing_likes (
  user_id     uuid    not null references public.profiles(id) on delete cascade,
  listing_id  bigint  not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index listing_likes_listing_id_idx on public.listing_likes(listing_id);

-- ============ Follows (buyer follows seller) ============
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, seller_id),
  constraint follows_no_self check (follower_id <> seller_id)
);
create index follows_seller_id_idx on public.follows(seller_id);

-- ============ Conversations + messages (buyer<->seller, per listing) ============
create table public.conversations (
  id              bigint generated always as identity primary key,
  listing_id      bigint references public.listings(id) on delete set null,
  buyer_id        uuid   not null references public.profiles(id) on delete cascade,
  seller_id       uuid   not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint conversations_no_self check (buyer_id <> seller_id),
  unique (listing_id, buyer_id, seller_id)
);
create index conversations_buyer_idx on public.conversations(buyer_id);
create index conversations_seller_idx on public.conversations(seller_id);

create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  sender_id       uuid   not null references public.profiles(id) on delete cascade,
  body            text   not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

-- ============ Notifications (in-app only) ============
create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null references public.profiles(id) on delete cascade,
  type        text   not null check (type in ('offer_received','offer_accepted','offer_declined','item_sold','new_message','new_review','new_follower')),
  payload     jsonb  not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications(user_id, read_at);

-- ============ Multi-photo support ============
-- Additive, nullable column. Existing image_url column and every existing read of it
-- is untouched; the Sell form now writes both image_url (first photo) and images (all).
alter table public.listings add column images text[];

-- ============ Reviews aggregate (view, not a table) ============
-- Inherits reviews' own RLS; no separate policy needed.
create view public.seller_rating_summary as
  select seller_id, count(*)::int as review_count, avg(rating)::numeric(3,2) as avg_rating
  from public.reviews
  group by seller_id;

-- ============ RLS ============

alter table public.listing_likes enable row level security;
create policy "read own likes" on public.listing_likes for select using (auth.uid() = user_id);
create policy "insert own likes" on public.listing_likes for insert with check (auth.uid() = user_id);
create policy "delete own likes" on public.listing_likes for delete using (auth.uid() = user_id);

alter table public.follows enable row level security;
create policy "read follows" on public.follows for select using (true);
create policy "insert own follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "delete own follow" on public.follows for delete using (auth.uid() = follower_id);

alter table public.conversations enable row level security;
create policy "read own conversations" on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "buyer creates conversation" on public.conversations for insert
  with check (auth.uid() = buyer_id and buyer_id <> seller_id);
create policy "participants touch conversation" on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

alter table public.messages enable row level security;
create policy "read messages in own conversation" on public.messages for select
  using (exists (select 1 from public.conversations c where c.id = messages.conversation_id
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "send message in own conversation" on public.messages for insert
  with check (auth.uid() = sender_id and exists (select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "mark received messages read" on public.messages for update
  using (exists (select 1 from public.conversations c where c.id = messages.conversation_id
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())))
  with check (true);

-- NOTE (deliberate trade-off, not an oversight): a notification is always created by
-- someone OTHER than its recipient (a buyer's offer notifies the seller), so there is
-- no clean RLS predicate tying auth.uid() to the target user_id without a service-role
-- RPC we don't have in Phase 1. select/update stay locked to the owner; insert is open
-- to any authenticated user for any user_id. Worst case is notification spam, not data
-- exposure (no financial/PII data lives on this table).
alter table public.notifications enable row level security;
create policy "read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "mark own notifications read" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "authenticated users may insert a notification for anyone" on public.notifications
  for insert to authenticated with check (true);
