"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Listing } from "./types";
import { Search, Moon, Sun, Heart, SlidersHorizontal, ChevronDown, LogOut, Tag, LayoutList } from "lucide-react";
import Banner from "./components/Banner";

const categories = ["All", "Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"];
type SortOption = "default" | "price-asc" | "price-desc" | "most-liked";

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dark, setDark] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [liked, setLiked] = useState<number []>([]);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchUser();
  }, []);

  async function fetchListings() {
    const { data, error } = await supabase
    .from("listings")
    .select("*, profiles(username)")
    .eq("sold", false)
    .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Listing[] = data.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        category: l.category,
        condition: l.condition,
        image: l.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        seller: l.profiles?.username || "unknown",
        likes: l.likes,
        description: l.description,
      }));
      setListings(mapped);
    }
    setLoading(false);
  }

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser({ id: user.id, email: user.email });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setLiked((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => {
      const matchesSearch = listing.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || listing.category === activeCategory;
      const matchesMin = minPrice === "" || listing.price >= Number(minPrice);
      const matchesMax = maxPrice === "" || listing.price <= Number(maxPrice);
      const matchesLiked = !showLikedOnly || liked.includes(listing.id);
      return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesLiked;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "most-liked") result = [...result].sort((a, b) => b.likes - a.likes);
    return result;
  }, [listings, search, activeCategory, minPrice, maxPrice, sort, showLikedOnly, liked]);

  const bg = dark ? "#0a0a0f" : "#f9f9fb";
  const card = dark ? "#141418" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const text = dark ? "#ffffff" : "#0a0a0f";
  const muted = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const input = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif", color: text, transition: "background 0.3s" }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: dark ? "rgba(10,10,15,0.9)" : "rgba(255,255,255,0.9)", borderBottom: `1px solid ${border}`, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>


          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>M</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: text, letterSpacing: "-0.5px" }}>mercari</span>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, position: "relative", maxWidth: 560 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: muted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1px solid ${border}`, background: input, color: text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`, background: input, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: muted }}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {user ? (
              <>
                <Link href="/offers" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${border}`, background: input, color: muted, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  <Tag size={13} /> Offers
                </Link>
                <Link href="/my-listings" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${border}`, background: input, color: muted, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  <LayoutList size={13} /> Listings
                </Link>
                <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${border}`, background: input, color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <LogOut size={13} /> Sign out
                </button>
              </>
            ) : (
              <Link href="/auth" style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${border}`, background: input, color: muted, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            )}

            <Link href="/sell" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 12px rgba(255,59,59,0.25)" }}>
              + Sell
            </Link>
          </div>
        </div>

        {/* Category pills */}
      </nav>
    </div>
  )
}