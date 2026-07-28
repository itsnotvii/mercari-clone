# Mercari Clone

A full-stack peer-to-peer marketplace app inspired by Mercari. Built with Next.js 16, TypeScript, Supabase, Stripe, and the Anthropic Claude API.

**Repo:** [github.com/itsnotvii/mercari-clone](https://github.com/itsnotvii/mercari-clone)

---

## Features

- **AI listing generator** — upload a photo and Claude automatically writes the title, description, category, condition, and suggested price
- **Authentication** — email/password sign up and login via Supabase Auth
- **Listings** — create, browse, search, and filter by category, price range, and condition
- **Image upload** — photos stored in Supabase Storage
- **Stripe payments** — full checkout flow powered by Stripe
- **Make an Offer** — buyers send offers with quick price suggestions; sellers accept or decline
- **Offers dashboard** — sellers manage all incoming offers in one place
- **My Listings** — sellers view, manage, mark as sold, relist, or delete their listings
- **User profiles** — public seller pages showing all active listings
- **Dark mode** — full light/dark theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
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
- A [Supabase](https://supabase.com) account
- An [Anthropic](https://console.anthropic.com) API key
- A [Stripe](https://stripe.com) account

### Installation

```bash
git clone https://github.com/itsnotvii/mercari-clone.git
cd mercari-clone
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Database Setup

Run the following in your Supabase SQL editor:

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
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

-- RLS policies
alter table listings enable row level security;
alter table profiles enable row level security;
alter table offers enable row level security;

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
```

Also create a **public** Storage bucket named `listing-images` in your Supabase dashboard under Storage → New bucket.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the AI Listing Generator Works

1. Seller uploads a photo on the `/sell` page
2. The image is base64-encoded and sent to `/api/generate-listing`
3. Claude analyzes the image and returns a JSON object with `title`, `description`, `category`, `condition`, and `price`
4. The form auto-fills instantly — everything is editable before submitting

---

## Project Structure

```
app/
├── api/
│   ├── generate-listing/     # Claude AI vision endpoint
│   └── create-checkout/      # Stripe checkout session endpoint
├── auth/                     # Login / sign up
├── listings/[id]/            # Listing detail page + buy/offer buttons
├── my-listings/              # Seller's listing management dashboard
├── offers/                   # Seller's incoming offers dashboard
├── profile/[username]/       # Public seller profile page
├── sell/                     # Create listing with AI generation
└── success/                  # Post-purchase confirmation page
lib/
├── supabase.ts               # Supabase client
└── auth.ts                   # Auth helpers
```

---

## Testing Payments

Use Stripe's test card in checkout:

- **Card number:** `4242 4242 4242 4242`
- **Expiry:** any future date
- **CVC:** any 3 digits

---

## License

MIT
