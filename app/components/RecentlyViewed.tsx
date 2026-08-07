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

export default function RecentlyViewed({ dark }: { dark: boolean }) {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const ids = getRecentIds();
    if (ids.length === 0) return;
    fetchListings(ids);
  }, []);

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
      const ordered = ids
        .map((id) => data.find((l) => l.id === id))
        .filter(Boolean) as Listing[];
      setListings(ordered);
    }
  }

  if (listings.length === 0) return null;

  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const card = dark ? "#1c1c22" : "#ffffff";
  const text = dark ? "#f5f5f7" : "#1a1a1a";
  const muted = dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const subtle = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Clock size={15} style={{ color: muted }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: text, margin: 0 }}>Recently viewed</h3>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div
              style={{ width: 130, borderRadius: 12, overflow: "hidden", background: card, border: `1px solid ${border}`, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.05)", transition: "transform 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
                <Image
                  src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                  alt={listing.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "8px 10px 10px" }}>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{listing.title}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: text }}>${listing.price}</p>
              </div>
            </div>
          </Link>
        ))}
        <button
          onClick={() => {
            
          }}
      </div>
    </div>
  )

}