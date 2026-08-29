"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyButton from "./BuyButton";
import { Star } from "lucide-react";
import AppNav from "../../components/ui/AppNav";
import Badge from "../../components/ui/Badge";
import { getDemoListingById, getDemoSellerByUsername } from "../../demoListings";

type ViewListing = {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string | null;
  images: string[];
  likes: number;
  listedLabel: string | null;
  seller: string;
  sellerId: string | null;
};

// Runtime-keyed by Supabase's freeform `condition` string, so this stays a
// plain object rather than a Tailwind class — Tailwind can't safelist
// dynamically-keyed classes.
const conditionColor: Record<string, string> = {
  "New": "#16a34a",
  "Like New": "#0ea5e9",
  "Good": "#f59e0b",
  "Fair": "#ef4444",
};

export default function ListingPageClient({ id }: { id: string }) {
  const [listing, setListing] = useState<ViewListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  async function fetchListing() {
    const { data } = await supabase
      .from("listings")
      .select("*, profiles(username)")
      .eq("id", id)
      .single();

    if (data) {
      const fallback = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800";
      setListing({
        id: data.id,
        title: data.title,
        price: data.price,
        category: data.category,
        condition: data.condition,
        description: data.description,
        images: [data.image_url || fallback],
        likes: data.likes,
        listedLabel: new Date(data.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        seller: data.profiles?.username || "unknown",
        sellerId: data.seller_id,
      });
    } else {
      setListing(null);
    }
    setLoading(false);
  }

  function loadDemoListing(numericId: number) {
    const demo = getDemoListingById(numericId);
    setListing(
      demo
        ? {
            id: demo.id,
            title: demo.title,
            price: demo.price,
            category: demo.category,
            condition: demo.condition,
            description: demo.description ?? null,
            images: demo.images,
            likes: demo.likes,
            listedLabel: null,
            seller: demo.seller,
            sellerId: null,
          }
        : null
    );
    setLoading(false);
  }

  useEffect(() => {
    setActiveImage(0);
    const numericId = Number(id);
    if (numericId < 0) loadDemoListing(numericId);
    else fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AppNav backHref="/" maxWidthClassName="max-w-[1000px]" />
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="bg-[var(--color-surface)] rounded-[20px] overflow-hidden border border-[var(--color-border)] flex">
          <div className="w-1/2 min-h-[450px] bg-[var(--color-subtle)] shrink-0 animate-pulse" />
          <div className="flex-1 p-8 flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-[var(--color-subtle)] animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-[var(--color-subtle)] animate-pulse" />
            </div>
            <div className="h-7 w-[85%] rounded-lg bg-[var(--color-subtle)] animate-pulse" />
            <div className="h-5 w-3/5 rounded-lg bg-[var(--color-subtle)] animate-pulse" />
            <div className="h-10 w-[45%] rounded-lg bg-[var(--color-subtle)] animate-pulse" />
            <div className="h-20 rounded-[10px] bg-[var(--color-subtle)] animate-pulse" />
            <div className="h-px bg-[var(--color-subtle)]" />
            <div className="h-[60px] rounded-xl bg-[var(--color-subtle)] animate-pulse" />
            <div className="mt-auto flex flex-col gap-2.5">
              <div className="h-11 rounded-[10px] bg-[var(--color-subtle)] animate-pulse" />
              <div className="h-11 rounded-[10px] bg-[var(--color-subtle)] animate-pulse" />
              <div className="h-11 rounded-[10px] bg-[var(--color-subtle)] animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-base font-bold mb-1.5">Listing not found</p>
        <Link href="/" className="text-[13px] text-[var(--color-brand)] font-semibold no-underline">← Back to listings</Link>
      </div>
    </div>
  );

  const isDemo = listing.sellerId === null;
  const demoSeller = isDemo ? getDemoSellerByUsername(listing.seller) : undefined;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav backHref="/" maxWidthClassName="max-w-[1000px]" />

      <main className="max-w-[1000px] mx-auto px-6 py-8 pb-16">
        <div className="bg-[var(--color-surface)] rounded-[20px] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)] flex">
          {/* Image gallery */}
          <div className="w-1/2 shrink-0 flex flex-col">
            <div className="relative flex-1 min-h-[380px]">
              <Image src={listing.images[activeImage]} alt={listing.title} fill style={{ objectFit: "cover" }} />
              {isDemo && (
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-sm">
                  Demo listing
                </span>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                {listing.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-[var(--color-brand)]" : "border-transparent hover:border-[var(--color-border)]"
                    }`}
                  >
                    <Image src={img} alt={`${listing.title} photo ${i + 1}`} fill style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <Badge variant="neutral">{listing.category}</Badge>
                <Badge style={{ background: `${conditionColor[listing.condition] || "rgba(0,0,0,0.4)"}18`, color: conditionColor[listing.condition] || "rgba(0,0,0,0.4)" }}>
                  {listing.condition}
                </Badge>
              </div>

              <h1 className="text-[22px] font-extrabold leading-tight mb-2 tracking-tight">
                {listing.title}
              </h1>

              <p className="text-[34px] font-black mb-4 tracking-tighter">
                ${listing.price}
              </p>

              {listing.description && (
                <p className="text-[13.5px] text-[var(--color-muted)] leading-relaxed mb-5">
                  {listing.description}
                </p>
              )}

              <div className="flex flex-col mb-5">
                {[
                  ...(listing.listedLabel ? [{ label: "Listed", value: listing.listedLabel }] : []),
                  { label: "Likes", value: `${listing.likes} people saved this` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-[var(--color-border)]">
                    <span className="text-[12.5px] text-[var(--color-muted)] font-medium">{label}</span>
                    <span className="text-[12.5px] font-semibold">{value}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/profile/${listing.seller}`}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[var(--color-subtle)] border border-[var(--color-border)] no-underline mb-3 transition-colors hover:bg-black/[0.07]"
              >
                <div className="w-[38px] h-[38px] rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center shrink-0">
                  <span className="text-white font-extrabold text-[15px]">{listing.seller[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold mb-0.5">@{listing.seller}</p>
                  <p className="text-[11.5px] text-[var(--color-muted)]">View profile →</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star size={12} className="text-amber-500" fill="#f59e0b" />
                  <span className="text-xs text-[var(--color-muted)] font-semibold">
                    {demoSeller ? `${demoSeller.rating.toFixed(1)} · Seller` : "Seller"}
                  </span>
                </div>
              </Link>

              {demoSeller && demoSeller.reviews.length > 0 && (
                <div className="mb-6 px-1">
                  <p className="text-[12.5px] text-[var(--color-muted)] leading-relaxed italic">
                    &ldquo;{demoSeller.reviews[0].comment}&rdquo;
                  </p>
                  <p className="text-[11.5px] text-[var(--color-muted)] mt-1">
                    — {demoSeller.reviews[0].reviewer}, <Link href={`/profile/${listing.seller}`} className="text-[var(--color-brand)] no-underline font-semibold">see all reviews</Link>
                  </p>
                </div>
              )}
            </div>

            {listing.sellerId ? (
              <BuyButton
                listingId={listing.id}
                title={listing.title}
                price={listing.price}
                image={listing.images[0]}
                sellerId={listing.sellerId}
              />
            ) : (
              <div className="mt-6 p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-subtle)] text-center">
                <p className="text-sm font-semibold mb-1">This is a demo listing</p>
                <p className="text-xs text-[var(--color-muted)]">Not for sale — list a real item from the Sell page to enable buying and offers.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
