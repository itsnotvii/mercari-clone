# Mercari Clone

A full-stack marketplace web application inspired by Mercari, which was built with Next.js 14, TypeScript, Supabase, and the Claude AI API.

**Live demo:** _coming soon_  
**Repo:** [github.com/itsnotvii/mercari-clone](https://github.com/itsnotvii/mercari-clone)

---

## Features

- **AI listing generator** — upload a photo and Claude automatically generates the title, description, category, condition, and suggested price
- **Authentication** — sign up and sign in with email/password via Supabase Auth
- **Real-time/live listings** — create, browse, and search listings stored in a Supabase PostgreSQL database
- **Image upload** — photos stored in Supabase Storage
- **Stripe payments** — buy items with a real checkout flow (test mode)
- **User profiles** — view all listings by any seller
- **Search & filters** — filter by category, price range, condition, and sort order
- **Dark mode** — full dark/light theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
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

alter table listings enable row level security;
alter table profiles enable row level security;

create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Users can insert their own listings" on listings for insert with check (auth.uid() = seller_id);
create policy "Users can update their own listings" on listings for update using (auth.uid() = seller_id);

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
```

Also create a public Storage bucket named `listing-images` in your Supabase dashboard.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the AI Listing Generator Works

1. User uploads a photo on the `/sell` page
2. The image is converted to base64 and sent to `/api/generate-listing`
3. The Claude API analyzes the image and returns a JSON object with `title`, `description`, `category`, `condition`, and `price`
4. The form auto-fills — user can edit anything before submitting

---

## Project Structure

```
app/
├── api/
│   ├── generate-listing/   # Claude AI endpoint
│   └── create-checkout/    # Stripe checkout endpoint
├── auth/                   # Login / sign up page
├── listings/[id]/          # Listing detail + buy button
├── profile/[username]/     # Seller profile page
├── sell/                   # Create listing with AI
└── success/                # Post-purchase success page
lib/
├── supabase.ts             # Supabase client
└── auth.ts                 # Auth helpers
```

---

## Testing Payments

Use Stripe's test card:

- **Card number:** `4242 4242 4242 4242`
- **Expiry:** any future date
- **CVC:** any 3 digits

---

## License

MIT
