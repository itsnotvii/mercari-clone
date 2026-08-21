# Mercari Clone

A production-grade peer-to-peer marketplace built from scratch with Next.js 16, TypeScript, Supabase, Stripe, and the Anthropic Claude API. Designed to feel like a real product — not a tutorial project.

**Live demo:** [mercari-clone-beige.vercel.app](https://mercari-clone-beige.vercel.app)  
**Repo:** [github.com/itsnotvii/mercari-clone](https://github.com/itsnotvii/mercari-clone)

---

## What makes this different

Most marketplace clones stop at CRUD. This one ships a full buying and selling experience — AI-generated listings, real payments, offer negotiation, seller reviews, and a polished UI that holds up next to production apps.

The standout feature: upload a photo of anything you want to sell, and Claude analyzes the image and writes the entire listing for you — title, description, category, condition, and a suggested price. It's fast, accurate, and genuinely useful.

---

## Features

**Buying**
- Browse listings with search, category filters, price range, and sort
- Live search suggestions as you type
- Save listings with a heart button
- Recently viewed row that persists across sessions
- Make an offer with quick price suggestion buttons (90%, 80%, 70% of asking)
- Buy instantly via Stripe Checkout
- Leave a star rating and written review on a seller

**Selling**
- AI listing generator — upload a photo, Claude fills in everything
- Image upload to Supabase Storage
- Manage listings — mark as sold, relist, or delete
- Review and accept or decline incoming offers

**Profiles**
- Public seller profile with all active listings and star rating summary
- Profile settings — update username, bio, avatar, email, and password
- Profile dropdown in navbar (no cluttered nav links)

**UI/UX**
- Clean minimal design — white space, subtle shadows, sharp typography
- Dark mode toggle with smooth transitions
- Rotating featured banner (top liked listings)
- Skeleton loading states on listing detail
- Share button with clipboard toast
- Lucide icons throughout
- Fully responsive

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Inline styles + Tailwind CSS v4 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Payments | Stripe Checkout |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account
- [Anthropic](https://console.anthropic.com) API key
- [Stripe](https://stripe.com) account

### Installation

```bash
git clone https://github.com/itsnotvii/mercari-clone.git
cd mercari-clone
npm install
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Database Setup

Run in your Supabase SQL editor:

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (id)
);

create table listings (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  condition text not null,
  image_url text,
  seller_id uuid references profiles(id) on delete cascade not null,
  likes integer default 0,
  sold boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

create table offers (
  id bigint generated always as identity primary key,
  listing_id bigint references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc', now())
);

create table reviews (
  id bigint generated always as identity primary key,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  listing_id bigint references listings(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(reviewer_id, listing_id)
);

-- RLS
alter table listings enable row level security;
alter table profiles enable row level security;
alter table offers enable row level security;
alter table reviews enable row level security;

create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Users can insert their own listings" on listings for insert with check (auth.uid() = seller_id);
create policy "Users can update their own listings" on listings for update using (auth.uid() = seller_id);
create policy "Users can delete their own listings" on listings for delete using (auth.uid() = seller_id);

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Buyers can insert offers" on offers for insert with check (auth.uid() = buyer_id);
create policy "Buyers and sellers can view their offers" on offers for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Sellers can update offer status" on offers for update using (auth.uid() = seller_id);

create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Buyers can insert reviews" on reviews for insert with check (auth.uid() = reviewer_id);

create policy "Users can upload listing images" on storage.objects
  for insert with check (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
create policy "Listing images are publicly viewable" on storage.objects
  for select using (bucket_id = 'listing-images');
```

Create a **public** Storage bucket named `listing-images`.

### Run locally

```bash
npm run dev
```

---

## Project Structure

```
app/
├── api/
│   ├── generate-listing/       # Claude vision endpoint
│   └── create-checkout/        # Stripe checkout endpoint
├── auth/                       # Login / sign up
├── components/
│   ├── Banner.tsx              # Rotating featured listings banner
│   ├── RecentlyViewed.tsx      # Recently viewed row
│   ├── ReviewForm.tsx          # Star rating + comment form
│   └── ReviewList.tsx          # Seller review display with avg rating
├── listings/[id]/
│   ├── page.tsx                # Server entry point
│   ├── ListingPageClient.tsx   # Client page with skeleton loading
│   └── BuyButton.tsx           # Buy, offer, and share actions
├── my-listings/                # Seller listing management
├── offers/                     # Incoming offers dashboard
├── profile/[username]/         # Public seller profile + reviews
├── sell/                       # Create listing with AI generation
├── settings/                   # Profile settings
└── success/                    # Post-purchase confirmation
lib/
├── supabase.ts
└── auth.ts
```

---

## Testing Payments

Stripe test card: `4242 4242 4242 4242` · any future expiry · any CVC

---

## License

MIT
