"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else fetchListings(user.id);
    });
  }, [router]);

  async function fetchListings(userId: string) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setListings(data);
    setLoading(false);
  }

  async function toggleSold(id: number, currentSold: boolean) {
    setUpdating(id);
    await supabase.from("listings").update({ sold: !currentSold }).eq("id", id);
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, sold: !currentSold } : l))
    );
    setUpdating(null);
  }

  async function deleteListing(id: number) {
    if (!confirm("Delete this listing?")) return;
    setUpdating(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setUpdating(null);
  }

  const active = listings.filter((l) => !l.sold);
  const sold = listings.filter((l) => l.sold);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-red-400">
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link
            href="/sell"
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #ff3b3b, #ff6b35)" }}
          >
            + New listing
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400 text-sm mb-4">No listings yet</p>
            <Link
              href="/sell"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #ff3b3b, #ff6b35)" }}
            >
              List your first item
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active */}
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Active ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/listings/${listing.id}`}>
                          <p className="text-sm font-semibold truncate hover:text-red-500 transition">
                            {listing.title}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{listing.category} · {listing.condition}</p>
                        <p className="text-base font-black mt-1">${listing.price}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => toggleSold(listing.id, listing.sold)}
                          disabled={updating === listing.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 transition disabled:opacity-50"
                        >
                          Mark sold
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={updating === listing.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sold */}
            {sold.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Sold ({sold.length})
                </h2>
                <div className="space-y-3">
                  {sold.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 opacity-60">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate line-through text-gray-400">
                          {listing.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{listing.category} · {listing.condition}</p>
                        <p className="text-base font-black mt-1 text-gray-400">${listing.price}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => toggleSold(listing.id, listing.sold)}
                          disabled={updating === listing.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition disabled:opacity-50"
                        >
                          Relist
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={updating === listing.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition disabled:opacity-50"
                        >
                          Delete
                        </button>
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