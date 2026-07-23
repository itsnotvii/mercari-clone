"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Listing } from "./types";

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

  useEffect(() => {
    fetchListings(); // api call reminder in notes
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
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
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

  const s = (light: string, darkVal: string) => (dark ? darkVal : light);

  return (
    <div className={dark ? "dark" : ""}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: dark
            ? "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)"
            : "linear-gradient(135deg, #f8f8fc 0%, #ffffff 50%, #f0f0fa 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Navbar */}
        <nav
          className="sticky top-0 z-20 border-b transition-colors duration-300"
          style={{
            background: dark ? "rgba(10,10,15,0.85)" : "rgba(255,255,255,0.85)",
            borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-5">
            <div className="shrink-0 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                style={{ background: "linear-gradient(135deg, #ff3b3b, #ff6b35)" }}
              >
                M
              </div>
              <span className="text-lg font-black tracking-tight" style={{ color: s("#0a0a0f", "#fff") }}>
                mercari
              </span>
            </div>

            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for anything..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                  color: s("#0a0a0f", "#fff"),
                  border: `1px solid ${s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)")}`,
                }}
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setDark(!dark)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-105"
                style={{ background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.08)") }}
              >
                {dark ? "☀️" : "🌙"}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.5)") }}>
                    {user.email}
                  </span>
                  <Link
                    href="/offers"
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.08)"),
                      color: s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.5)"),
                    }}
                  >
                    Offers
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.08)"),
                      color: s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.5)"),
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.08)"),
                    color: s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.5)"),
                  }}
                >
                  Sign in
                </Link>
              )}

              <Link
                href="/sell"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #ff3b3b, #ff6b35)",
                  boxShadow: "0 4px 15px rgba(255,59,59,0.3)",
                }}
              >
                + Sell
              </Link>
            </div>
          </div>

          {/* Category pills */}
          <div className="max-w-7xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: activeCategory === cat
                    ? "linear-gradient(135deg, #ff3b3b, #ff6b35)"
                    : s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                  color: activeCategory === cat ? "#fff" : s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.6)"),
                  boxShadow: activeCategory === cat ? "0 4px 12px rgba(255,59,59,0.25)" : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* Filters bar */}
        <div
          className="border-b"
          style={{
            background: s("rgba(255,255,255,0.6)", "rgba(10,10,15,0.6)"),
            borderColor: s("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)"),
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none transition-all cursor-pointer"
              style={{
                background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                color: s("#0a0a0f", "#fff"),
                border: `1px solid ${s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)")}`,
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="most-liked">Most Liked</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 text-xs px-3 py-2 rounded-lg focus:outline-none"
                style={{
                  background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                  color: s("#0a0a0f", "#fff"),
                  border: `1px solid ${s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)")}`,
                }}
              />
              <span style={{ color: s("rgba(0,0,0,0.3)", "rgba(255,255,255,0.3)") }} className="text-xs">—</span>
              <input
                type="number"
                placeholder="Max $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 text-xs px-3 py-2 rounded-lg focus:outline-none"
                style={{
                  background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                  color: s("#0a0a0f", "#fff"),
                  border: `1px solid ${s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)")}`,
                }}
              />
            </div>

            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: showLikedOnly
                  ? "linear-gradient(135deg, #ff3b3b, #ff6b35)"
                  : s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"),
                color: showLikedOnly ? "#fff" : s("rgba(0,0,0,0.5)", "rgba(255,255,255,0.6)"),
                border: `1px solid ${showLikedOnly ? "transparent" : s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)")}`,
              }}
            >
              ❤️ Saved {liked.length > 0 && `(${liked.length})`}
            </button>

            {(minPrice || maxPrice || sort !== "default" || showLikedOnly) && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); setSort("default"); setShowLikedOnly(false); }}
                className="text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ color: "#ff3b3b" }}
              >
                Clear filters
              </button>
            )}

            <span
              className="ml-auto text-xs font-medium"
              style={{ color: s("rgba(0,0,0,0.35)", "rgba(255,255,255,0.35)") }}
            >
              {loading ? "Loading..." : `${filtered.length} results`}
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
          <h2 className="text-3xl font-black tracking-tight" style={{ color: s("#0a0a0f", "#fff") }}>
            {activeCategory === "All" ? "All listings" : activeCategory}
          </h2>
        </div>

        {/* Grid */}
        <main className="max-w-7xl mx-auto px-6 pb-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: s("rgba(0,0,0,0.06)", "rgba(255,255,255,0.04)") }}>
                  <div className="aspect-square w-full" style={{ background: s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.06)") }} />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded" style={{ background: s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.06)") }} />
                    <div className="h-3 w-1/2 rounded" style={{ background: s("rgba(0,0,0,0.08)", "rgba(255,255,255,0.06)") }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-sm font-medium" style={{ color: s("rgba(0,0,0,0.3)", "rgba(255,255,255,0.3)") }}>
                No results found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((listing) => (
                <Link href={`/listings/${listing.id}`} key={listing.id}>
                  <div
                    className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    style={{
                      background: s("#fff", "rgba(255,255,255,0.04)"),
                      border: `1px solid ${s("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)")}`,
                      boxShadow: s("0 2px 12px rgba(0,0,0,0.06)", "0 4px 24px rgba(0,0,0,0.4)"),
                    }}
                  >
                    <div className="relative w-full aspect-square overflow-hidden">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }}
                      />
                      <button
                        onClick={(e) => toggleLike(e, listing.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
                        style={{
                          background: liked.includes(listing.id)
                            ? "linear-gradient(135deg, #ff3b3b, #ff6b35)"
                            : "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {liked.includes(listing.id) ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <div className="p-3">
                      <p className="text-xs truncate font-semibold leading-snug" style={{ color: s("#0a0a0f", "rgba(255,255,255,0.9)") }}>
                        {listing.title}
                      </p>
                      <p className="text-sm font-black mt-1" style={{ color: s("#0a0a0f", "#fff") }}>
                        ${listing.price}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md font-medium mt-2 inline-block"
                        style={{
                          background: s("rgba(0,0,0,0.05)", "rgba(255,255,255,0.08)"),
                          color: s("rgba(0,0,0,0.4)", "rgba(255,255,255,0.5)"),
                        }}
                      >
                        {listing.condition}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}