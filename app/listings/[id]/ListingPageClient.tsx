"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyButton from "./BuyButton";
import { ArrowLeft, Tag, Star } from "lucide-react";

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
      <nav style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${border}`, height: 64, display: "flex", alignItems: "center", padding: "0 32px" }}>
        <div style={{ width: 60, height: 20, borderRadius: 6, background: subtle }} />
      </nav>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ width: 80, height: 16, borderRadius: 6, background: subtle, marginBottom: 24 }} />
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", display: "flex", gap: 0 }}>
          <div style={{ width: "50%", paddingTop: "50%", background: subtle, flexShrink: 0 }} />
          <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ height: 14, width: "30%", borderRadius: 6, background: subtle }} />
            <div style={{ height: 28, width: "80%", borderRadius: 8, background: subtle }} />
            <div style={{ height: 36, width: "40%", borderRadius: 8, background: subtle }} />
            <div style={{ height: 60, borderRadius: 8, background: subtle }} />
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 44, borderRadius: 10, background: subtle }} />
              <div style={{ height: 44, borderRadius: 10, background: subtle }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  
}