"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Listing } from "./types";
import { Search, Moon, Sun, Heart, SlidersHorizontal, ChevronDown, LogOut, Tag, LayoutList, Settings, PackageSearch } from "lucide-react";
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
  const [liked, setLiked] = useState<number[]>([]);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const bg = dark ? "#0a0a0f" : "#f5f5f7";
  const card = dark ? "#1c1c22" : "#ffffff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const text = dark ? "#f5f5f7" : "#1a1a1a";
  const muted = dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const subtle = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif", color: text, transition: "background 0.3s" }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: dark ? "rgba(10,10,15,0.92)" : "rgba(255,255,255,0.92)", borderBottom: `1px solid ${border}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 20 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,59,59,0.3)" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>M</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: text, letterSpacing: "-0.6px" }}>mercari</span>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, position: "relative", maxWidth: 600 }}>
            <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything..."
              style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: `1.5px solid ${border}`, background: subtle, color: text, fontSize: 13.5, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={(e) => e.target.style.borderColor = "#ff3b3b"}
              onBlur={(e) => e.target.style.borderColor = border}
            />
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexShrink: 0 }}>
            <button
              onClick={() => setDark(!dark)}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${border}`, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: muted, transition: "all 0.15s" }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 14, boxShadow: "0 2px 8px rgba(255,59,59,0.3)" }}
                >
                  {user.email?.[0].toUpperCase()}
                </button>
                {showProfileMenu && (
                  <div
                    style={{ position: "absolute", top: 46, right: 0, background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 6, minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.15)", zIndex: 100 }}
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div style={{ padding: "8px 12px 10px", borderBottom: `1px solid ${border}`, marginBottom: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: text }}>{user.email}</p>
                    </div>
                    {[
                      { label: "My Listings", href: "/my-listings", icon: <LayoutList size={14} /> },
                      { label: "Offers", href: "/offers", icon: <Tag size={14} /> },
                      { label: "Settings", href: "/settings", icon: <Settings size={14} /> },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowProfileMenu(false)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, color: text, fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "background 0.1s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = subtle)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ color: muted }}>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: border, margin: "4px 6px" }} />
                    <button
                      onClick={() => { handleSignOut(); setShowProfileMenu(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, color: "#ff3b3b", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "none", border: "none", width: "100%", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,59,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${border}`, background: subtle, color: text, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.15s" }}
              >
                Sign in
              </Link>
            )}

            <Link
              href="/sell"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 12px rgba(255,59,59,0.3)", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + Sell
            </Link>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px 14px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                whiteSpace: "nowrap", padding: "6px 16px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                background: activeCategory === cat ? "linear-gradient(135deg, #ff3b3b, #ff6b35)" : subtle,
                color: activeCategory === cat ? "#fff" : muted,
                border: `1.5px solid ${activeCategory === cat ? "transparent" : border}`,
                boxShadow: activeCategory === cat ? "0 2px 10px rgba(255,59,59,0.25)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Banner */}
      <Banner />

      {/* Filters bar */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
              {activeCategory === "All" ? "All listings" : activeCategory}
            </h2>
            {!loading && (
              <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>{filtered.length} items</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${showLikedOnly ? "#ff3b3b" : border}`, background: showLikedOnly ? "rgba(255,59,59,0.06)" : subtle, color: showLikedOnly ? "#ff3b3b" : muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            >
              <Heart size={13} fill={showLikedOnly ? "#ff3b3b" : "none"} /> Saved
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${showFilters ? "#ff3b3b" : border}`, background: showFilters ? "rgba(255,59,59,0.06)" : subtle, color: showFilters ? "#ff3b3b" : muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            >
              <SlidersHorizontal size={13} /> Filters
              <ChevronDown size={12} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${border}`, background: subtle, color: muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", outline: "none" }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${border}`, background: card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: muted, fontWeight: 600 }}>Price range</span>
            <input
              type="number" placeholder="Min $" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: 88, padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${border}`, background: subtle, color: text, fontSize: 12.5, outline: "none" }}
            />
            <span style={{ color: muted }}>—</span>
            <input
              type="number" placeholder="Max $" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: 88, padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${border}`, background: subtle, color: text, fontSize: 12.5, outline: "none" }}
            />
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                style={{ fontSize: 12.5, color: "#ff3b3b", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 32px 64px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: card, border: `1px solid ${border}` }}>
                <div style={{ paddingTop: "75%", background: subtle }} />
                <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 13, borderRadius: 6, background: subtle, width: "80%" }} />
                  <div style={{ height: 13, borderRadius: 6, background: subtle, width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <PackageSearch size={28} style={{ color: muted }} />
            </div>
            <p style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No listings found</p>
            <p style={{ color: muted, fontSize: 13 }}>Try adjusting your filters or search term</p>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                style={{ marginTop: 16, padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                View all listings
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {filtered.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} style={{ textDecoration: "none" }}>
                <div
                  style={{ borderRadius: 16, overflow: "hidden", background: card, border: `1px solid ${border}`, boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 8px 28px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.05)";
                  }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      style={{ objectFit: "cover", transition: "transform 0.4s" }}
                    />
                    <button
                      onClick={(e) => toggleLike(e, listing.id)}
                      style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <Heart size={14} fill={liked.includes(listing.id) ? "#ff3b3b" : "none"} color={liked.includes(listing.id) ? "#ff3b3b" : "#fff"} />
                    </button>
                    {listing.condition === "New" && (
                      <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.9)", color: "#fff", backdropFilter: "blur(8px)" }}>NEW</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px 14px 14px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, lineHeight: 1.4 }}>{listing.title}</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: text, marginBottom: 8, letterSpacing: "-0.3px" }}>${listing.price}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: muted, background: subtle, padding: "3px 8px", borderRadius: 6, border: `1px solid ${border}` }}>{listing.condition}</span>
                      <span style={{ fontSize: 11, color: muted, fontWeight: 500 }}>@{listing.seller}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}