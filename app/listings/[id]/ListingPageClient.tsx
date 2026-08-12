"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyButton from "./BuyButton";
import { ArrowLeft, Star } from "lucide-react";

type Listing = {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string | null;
  image_url: string | null;
  likes: number;
  created_at: string;
  seller_id: string;
  profiles: { username: string } | null;
};

export default function ListingPageClient({ id }: { id: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("listings")
        .select("*, profiles(username)")
        .eq("id", id)
        .single();
      setListing(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  const border = "rgba(0,0,0,0.07)";
  const muted = "rgba(0,0,0,0.4)";
  const subtle = "rgba(0,0,0,0.04)";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${border}`, height: 64, display: "flex", alignItems: "center", padding: "0 32px", gap: 16 }}>
        <div style={{ width: 50, height: 16, borderRadius: 6, background: subtle }} />
        <div style={{ width: 100, height: 20, borderRadius: 6, background: subtle, margin: "0 auto" }} />
      </nav>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: `1px solid ${border}`, display: "flex" }}>
          <div style={{ width: "50%", minHeight: 450, background: subtle, flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ height: 24, width: 80, borderRadius: 20, background: subtle }} />
              <div style={{ height: 24, width: 80, borderRadius: 20, background: subtle }} />
            </div>
            <div style={{ height: 28, width: "85%", borderRadius: 8, background: subtle }} />
            <div style={{ height: 20, width: "60%", borderRadius: 8, background: subtle }} />
            <div style={{ height: 40, width: "45%", borderRadius: 8, background: subtle }} />
            <div style={{ height: 80, borderRadius: 10, background: subtle }} />
            <div style={{ height: 1, background: subtle }} />
            <div style={{ height: 60, borderRadius: 12, background: subtle }} />
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 44, borderRadius: 10, background: subtle }} />
              <div style={{ height: 44, borderRadius: 10, background: subtle }} />
              <div style={{ height: 44, borderRadius: 10, background: subtle }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>😕</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>Listing not found</p>
        <Link href="/" style={{ fontSize: 13, color: "#ff3b3b", fontWeight: 600, textDecoration: "none" }}>← Back to listings</Link>
      </div>
    </div>
  );

  const seller = listing.profiles?.username || "unknown";
  const image = listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800";

  const conditionColor: Record<string, string> = {
    "New": "#16a34a",
    "Like New": "#0ea5e9",
    "Good": "#f59e0b",
    "Fair": "#ef4444",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${border}`, backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: muted, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <Link href="/" style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a", textDecoration: "none", letterSpacing: "-0.5px" }}>mercari</Link>
          <div style={{ width: 60 }} />
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: `1px solid ${border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex" }}>
          {/* Image */}
          <div style={{ position: "relative", width: "50%", flexShrink: 0, minHeight: 450 }}>
            <Image src={image} alt={listing.title} fill style={{ objectFit: "cover" }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: subtle, color: muted }}>
                  {listing.category}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: `${conditionColor[listing.condition] || muted}18`, color: conditionColor[listing.condition] || muted }}>
                  {listing.condition}
                </span>
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 8, letterSpacing: "-0.5px" }}>
                {listing.title}
              </h1>

              <p style={{ fontSize: 34, fontWeight: 900, color: "#1a1a1a", marginBottom: 16, letterSpacing: "-1px" }}>
                ${listing.price}
              </p>

              {listing.description && (
                <p style={{ fontSize: 13.5, color: "rgba(0,0,0,0.55)", lineHeight: 1.7, marginBottom: 20 }}>
                  {listing.description}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
                {[
                  { label: "Listed", value: new Date(listing.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Likes", value: `${listing.likes} people saved this` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(0,0,0,0.05)` }}>
                    <span style={{ fontSize: 12.5, color: muted, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12.5, color: "#1a1a1a", fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/profile/${seller}`}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: subtle, border: `1px solid ${border}`, textDecoration: "none", marginBottom: 24, transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = subtle)}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{seller[0].toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>@{seller}</p>
                  <p style={{ fontSize: 11.5, color: muted }}>View profile →</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} style={{ color: "#f59e0b" }} fill="#f59e0b" />
                  <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Seller</span>
                </div>
              </Link>
            </div>

            <BuyButton
              listingId={listing.id}
              title={listing.title}
              price={listing.price}
              image={image}
              sellerId={listing.seller_id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}