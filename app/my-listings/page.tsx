"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppNav from "../components/ui/AppNav";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";

type Listing = {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  image_url: string | null;
  sold: boolean;
  created_at: string;
  likes: number;
};

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  async function fetchListings(userId: string) {
    const { data, error } = await supabase.from("listings").select("*").eq("seller_id", userId).order("created_at", { ascending: false });
    if (!error && data) setListings(data);
    setLoading(false);
  }

  async function toggleSold(id: number, currentSold: boolean) {
    setUpdating(id);
    await supabase.from("listings").update({ sold: !currentSold }).eq("id", id);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, sold: !currentSold } : l)));
    setUpdating(null);
  }

  async function deleteListing(id: number) {
    if (!confirm("Delete this listing?")) return;
    setUpdating(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setUpdating(null);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else fetchListings(user.id);
    });
  }, [router]);

  const active = listings.filter((l) => !l.sold);
  const sold = listings.filter((l) => l.sold);

  const actionButtonClass = "px-3 py-1.5 text-xs font-semibold rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition-colors disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav backHref="/" />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">My Listings</h1>
          <Button href="/sell" className="text-sm px-4 py-2">+ New listing</Button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : listings.length === 0 ? (
          <EmptyState emoji="📦" message="No listings yet" cta={{ label: "List your first item", href: "/sell" }} />
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Active ({active.length})</h2>
                <div className="space-y-3">
                  {active.map((listing) => (
                    <div key={listing.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt={listing.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/listings/${listing.id}`} className="no-underline">
                          <p className="text-sm font-semibold truncate hover:text-[var(--color-brand)] transition-colors">{listing.title}</p>
                        </Link>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{listing.category} · {listing.condition}</p>
                        <p className="text-base font-black mt-1">${listing.price}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => toggleSold(listing.id, listing.sold)} disabled={updating === listing.id} className={`${actionButtonClass} hover:border-green-300 hover:text-green-600`}>Mark sold</button>
                        <button onClick={() => deleteListing(listing.id)} disabled={updating === listing.id} className={`${actionButtonClass} hover:border-red-300 hover:text-red-500`}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sold.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Sold ({sold.length})</h2>
                <div className="space-y-3">
                  {sold.map((listing) => (
                    <div key={listing.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 flex items-center gap-4 opacity-60">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt={listing.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate line-through text-[var(--color-muted)]">{listing.title}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{listing.category} · {listing.condition}</p>
                        <p className="text-base font-black mt-1 text-[var(--color-muted)]">${listing.price}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => toggleSold(listing.id, listing.sold)} disabled={updating === listing.id} className={`${actionButtonClass} hover:border-blue-300 hover:text-blue-500`}>Relist</button>
                        <button onClick={() => deleteListing(listing.id)} disabled={updating === listing.id} className={`${actionButtonClass} hover:border-red-300 hover:text-red-500`}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
