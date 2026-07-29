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
        </div>
      </Link>
    </div>
  )


}