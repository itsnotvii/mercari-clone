"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Clock } from "lucide-react";

type Listing = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  condition: string;
};

export default function RecentlyViewed() {
  const [listings, setListings] = useState<Listing[]>([]);

  function getRecentIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    } catch {
      return [];
    }
  }

  async function fetchListings(ids: number[]) {
    const { data } = await supabase
      .from("listings")
      .select("id, title, price, image_url, condition")
      .in("id", ids)
      .eq("sold", false);

    if (data) {
      // preserve the order they were viewed
      const ordered = ids
        .map((id) => data.find((l) => l.id === id))
        .filter(Boolean) as Listing[];
      setListings(ordered);
    }
  }

  useEffect(() => {
    const ids = getRecentIds();
    if (ids.length === 0) return;
    fetchListings(ids);
  }, []);

  if (listings.length === 0) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-8 pt-6">
      <div className="flex items-center gap-2 mb-3.5">
        <Clock size={15} className="text-[var(--color-muted)]" />
        <h3 className="text-sm font-bold m-0">Recently viewed</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`} className="no-underline shrink-0">
            <div className="w-[130px] rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-transform duration-150 hover:-translate-y-0.5">
              <div className="relative pt-[100%] overflow-hidden">
                <Image
                  src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-2.5 pb-2.5 pt-2">
                <p className="text-[11.5px] font-semibold truncate mb-1">{listing.title}</p>
                <p className="text-[13px] font-extrabold">${listing.price}</p>
              </div>
            </div>
          </Link>
        ))}
        <button
          onClick={() => {
            localStorage.removeItem("recently_viewed");
            setListings([]);
          }}
          className="shrink-0 self-center text-[11.5px] text-[var(--color-muted)] px-2 py-1 rounded-md hover:text-[var(--color-brand)] transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="h-px bg-[var(--color-border)] mt-5" />
    </div>
  );
}
