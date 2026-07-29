"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FeaturedListing = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  category: string;
  condition: string;
};

export default function Banner() {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, image_url, category, condition")
        .eq("sold", false)
        .order("likes", { ascending: false })
        .limit(3);
      if (data && data.length > 0) setListings(data);
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (listings.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % listings.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [listings]);

  if (listings.length === 0) return null;

  const listing = listings[current];

  return ( 
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <Link href={`/listings/${listing.id}`}>
        <div
          className="relative w-full overflow-hidden rounded-2xl cursor-pointer group"
          style={{ height: "280px" }}
        >
          <Image
            src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div 
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify0center px-8">
            <span
              className="text-xs font-bold px-4 py-1 rounded-full mb-3 inline-block w-fit"
              style={{ background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", color: "#fff" }}
            >
              ⭐ Featured
            </span>
            <h2 className="text-2xl font-black text-white mb-1 max-w-xs leading-tight">
              {listing.title}
            </h2>
            <p className="text-white/70 text-sm mb-4">{listing.condition} · {listing.category}</p>
            <p className="text-3xl font-black text-white">${listing.price}</p>
          </div>
          <div className="absolite bottom-4 left-8 flex gap-2">
            {listings.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                className="h-2 rounded-full transition-all"
                style={{
                  background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                  width: i === current ? "20px" : "8px",
                }}
              />
            ))}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setCurrent((current - 1 + listings.length) % listings.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px" }}
          >
            ‹
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); setCurrent((current + 1) % listings.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.4", backdropFilter: "blur(8px)" }}
          >
            ›
          </button>
        </div>
      </Link>
    </div>
  );
}