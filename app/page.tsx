"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Listing } from "./types";
import { demoListings } from "./demoListings";
import {
  Search, Moon, Sun, Heart, SlidersHorizontal, ChevronDown, LogOut, Tag, LayoutList, Settings, PackageSearch,
  Smartphone, Footprints, Shirt, Gamepad2, Home as HomeIcon, ShoppingBag, ShieldCheck, Sparkles,
  User, LogIn, UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Banner from "./components/Banner";
import RecentlyViewed from "./components/RecentlyViewed";
import Button from "./components/ui/Button";
import NotificationBell from "./components/NotificationBell";
import { useTheme } from "./components/ThemeProvider";

const categories = ["All", "Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"];
type SortOption = "default" | "price-asc" | "price-desc" | "most-liked";

const categoryInfo: Record<string, { icon: LucideIcon; gradient: string; image: string }> = {
  Electronics: { icon: Smartphone, gradient: "linear-gradient(135deg, #3b82f6, #6366f1)", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200" },
  Sneakers: { icon: Footprints, gradient: "linear-gradient(135deg, #f59e0b, #ec4899)", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200" },
  Clothing: { icon: Shirt, gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=1200" },
  Gaming: { icon: Gamepad2, gradient: "linear-gradient(135deg, #10b981, #06b6d4)", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=1200" },
  Home: { icon: HomeIcon, gradient: "linear-gradient(135deg, #14b8a6, #3b82f6)", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200" },
  Bags: { icon: ShoppingBag, gradient: "linear-gradient(135deg, #f43f5e, #f97316)", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200" },
};
const categoryList = categories.filter((c) => c !== "All");

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [liked, setLiked] = useState<number[]>([]);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<Listing[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      setListings(mapped.length > 0 ? mapped : demoListings);
    } else {
      setListings(demoListings);
    }
    setLoading(false);
  }

  async function fetchLikes(userId: string) {
    const { data, error } = await supabase.from("listing_likes").select("listing_id").eq("user_id", userId);
    if (!error && data) setLiked(data.map((r) => r.listing_id));
  }

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser({ id: user.id, email: user.email });
      fetchLikes(user.id);
    }
  }

  useEffect(() => {
    fetchListings();
    fetchUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const toggleLike = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    const wasLiked = liked.includes(id);
    setLiked((prev) => (wasLiked ? prev.filter((l) => l !== id) : [...prev, id]));

    // Signed-out users and demo (negative-id) listings keep the toggle local-only —
    // there's no account to persist to, and demo ids don't exist in the real listings table.
    if (!user || id < 0) return;

    if (wasLiked) {
      await supabase.from("listing_likes").delete().eq("user_id", user.id).eq("listing_id", id);
    } else {
      await supabase.from("listing_likes").insert({ user_id: user.id, listing_id: id });
    }
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

  const trending = useMemo(() => [...listings].sort((a, b) => b.likes - a.likes).slice(0, 8), [listings]);

  const [catIndex, setCatIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCatIndex((prev) => (prev + 1) % categoryList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-8 h-8 rounded-[10px] bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] shadow-[0_2px_8px_rgba(255,59,59,0.3)] flex items-center justify-center">
              <span className="text-white text-sm font-black">M</span>
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[var(--color-text)]">mercari</span>
          </Link>

          {/* Search */}
          <div className="flex-1 relative max-w-[600px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none z-[1]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.length > 1) {
                  const matches = listings
                    .filter((l) => l.title.toLowerCase().includes(e.target.value.toLowerCase()))
                    .slice(0, 6);
                  setSuggestions(matches);
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (search.length > 1) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search for anything..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-text)] text-[13.5px] outline-none focus:border-[var(--color-brand)] transition-colors"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50">
                {suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/listings/${s.id}`}
                    onClick={() => { setSearch(s.title); setShowSuggestions(false); }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg no-underline hover:bg-[var(--color-subtle)] transition-colors"
                  >
                    <Search size={12} className="text-[var(--color-muted)] shrink-0" />
                    <span className="text-[13px] font-medium truncate">{s.title}</span>
                    <span className="ml-auto text-xs font-bold text-[var(--color-muted)] shrink-0">${s.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-[10px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user && <NotificationBell />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_2px_8px_rgba(255,59,59,0.3)]"
                >
                  {user.email?.[0].toUpperCase()}
                </button>
                {showProfileMenu && (
                  <div
                    className="absolute top-[46px] right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1.5 min-w-[200px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] z-[100]"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-3 pt-2 pb-2.5 border-b border-[var(--color-border)] mb-1">
                      <p className="text-xs font-bold truncate">{user.email}</p>
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
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium no-underline hover:bg-[var(--color-subtle)] transition-colors"
                      >
                        <span className="text-[var(--color-muted)]">{item.icon}</span> {item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-[var(--color-border)] my-1 mx-1.5" />
                    <button
                      onClick={() => { handleSignOut(); setShowProfileMenu(false); }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--color-brand)] w-full hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors"
                >
                  <User size={16} />
                </button>
                {showProfileMenu && (
                  <div
                    className="absolute top-[46px] right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1.5 min-w-[220px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] z-[100]"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-3 pt-2 pb-2.5 mb-1">
                      <p className="text-[13px] font-bold">Welcome</p>
                      <p className="text-[11.5px] text-[var(--color-muted)]">Sign in to buy, sell, and save items</p>
                    </div>
                    <Link
                      href="/auth"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold no-underline text-white mb-1 bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] shadow-[var(--shadow-glow-brand-sm)] hover:opacity-95 transition-opacity"
                    >
                      <LogIn size={14} /> Sign in
                    </Link>
                    <Link
                      href="/auth?mode=signup"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium no-underline hover:bg-[var(--color-subtle)] transition-colors"
                    >
                      <UserPlus size={14} /> Create account
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Button href="/sell" className="text-[13.5px]">+ Sell</Button>
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-[1400px] mx-auto px-8 pb-3.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all border-[1.5px] ${
                  active
                    ? "bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white border-transparent shadow-[var(--shadow-glow-brand-sm)]"
                    : "bg-[var(--color-subtle)] text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-brand)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Trust strip */}
      <div className="max-w-[1400px] mx-auto px-8 pt-5 flex flex-wrap items-center gap-x-7 gap-y-2 text-[12px] text-[var(--color-muted)] font-medium">
        <span className="flex items-center gap-1.5"><PackageSearch size={13} /> {listings.length}+ items listed</span>
        <span className="flex items-center gap-1.5"><Tag size={13} /> {categories.length - 1} categories</span>
        <span className="flex items-center gap-1.5"><Sparkles size={13} /> AI-assisted listings</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Secure checkout via Stripe</span>
      </div>

      {/* Banner */}
      <Banner />

      {/* Shop by category — rotating showcase */}
      <div className="max-w-[1400px] mx-auto px-8 pt-8">
        <h2 className="text-[13px] font-bold text-[var(--color-muted)] uppercase tracking-wide mb-4">Shop by category</h2>
        <div className="relative rounded-2xl overflow-hidden h-[200px] shadow-[var(--shadow-card)]">
          {categoryList.map((cat, i) => {
            const info = categoryInfo[cat];
            const Icon = info.icon;
            const count = listings.filter((l) => l.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`absolute inset-0 w-full h-full text-left transition-opacity duration-700 ${
                  i === catIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image src={info.image} alt={cat} fill priority={i === 0} className="object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }}
                />
                <div className="absolute inset-0 flex items-center px-8 gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ background: info.gradient }}
                  >
                    <Icon size={26} />
                  </div>
                  <div>
                    <p className="text-white text-2xl font-black tracking-tight">{cat}</p>
                    <p className="text-white/70 text-sm">{count} items available</p>
                  </div>
                </div>
              </button>
            );
          })}
          <div className="absolute bottom-4 left-8 flex gap-2 z-20">
            {categoryList.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setCatIndex(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  background: i === catIndex ? "#fff" : "rgba(255,255,255,0.4)",
                  width: i === catIndex ? "20px" : "8px",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recently viewed */}
      <RecentlyViewed />

      {/* Trending now */}
      {trending.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-8 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h2 className="text-[13px] font-bold text-[var(--color-muted)] uppercase tracking-wide">Trending now</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {trending.map((listing, i) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="group no-underline shrink-0 w-[170px]">
                <div className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-all duration-200 group-hover:shadow-[var(--shadow-card-hover)] group-hover:-translate-y-1">
                  <div className="relative pt-[100%] overflow-hidden">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 text-[11px] font-black w-6 h-6 rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white flex items-center justify-center shadow-[var(--shadow-glow-brand-sm)]">
                      {i + 1}
                    </span>
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <p className="text-[12.5px] font-semibold truncate mb-1">{listing.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-extrabold">${listing.price}</span>
                      <span className="flex items-center gap-1 text-[11px] text-[var(--color-muted)] font-semibold">
                        <Heart size={11} fill="#ff3b3b" color="#ff3b3b" /> {listing.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="max-w-[1400px] mx-auto px-8 pt-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-[22px] font-extrabold tracking-tight m-0">
              {activeCategory === "All" ? "All listings" : activeCategory}
            </h2>
            {!loading && (
              <span className="text-[13px] text-[var(--color-muted)] font-medium">{filtered.length} items</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-[1.5px] text-[12.5px] font-semibold transition-all ${
                showLikedOnly
                  ? "border-[var(--color-brand)] bg-red-500/10 text-[var(--color-brand)]"
                  : "border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-muted)]"
              }`}
            >
              <Heart size={13} fill={showLikedOnly ? "#ff3b3b" : "none"} /> Saved
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-[1.5px] text-[12.5px] font-semibold transition-all ${
                showFilters
                  ? "border-[var(--color-brand)] bg-red-500/10 text-[var(--color-brand)]"
                  : "border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-muted)]"
              }`}
            >
              <SlidersHorizontal size={13} /> Filters
              <ChevronDown size={12} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3.5 py-2 rounded-[10px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-muted)] text-[12.5px] font-semibold outline-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3.5 px-4.5 py-3.5 rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3 flex-wrap">
            <span className="text-[12.5px] text-[var(--color-muted)] font-semibold">Price range</span>
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-[88px] px-3 py-1.5 rounded-lg border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-text)] text-[12.5px] outline-none"
            />
            <span className="text-[var(--color-muted)]">—</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-[88px] px-3 py-1.5 rounded-lg border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-text)] text-[12.5px] outline-none"
            />
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[12.5px] text-[var(--color-brand)] font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <main className="max-w-[1400px] mx-auto px-8 pt-5 pb-16">
        {loading ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="pt-[75%] bg-[var(--color-subtle)] animate-pulse" />
                <div className="px-3.5 pb-3.5 pt-3 flex flex-col gap-2">
                  <div className="h-[13px] rounded-md bg-[var(--color-subtle)] w-4/5 animate-pulse" />
                  <div className="h-[13px] rounded-md bg-[var(--color-subtle)] w-2/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-[20px] bg-[var(--color-subtle)] flex items-center justify-center mx-auto mb-4">
              <PackageSearch size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-base font-bold mb-1.5">No listings found</p>
            <p className="text-[13px] text-[var(--color-muted)]">Try adjusting your filters or search term</p>
            {activeCategory !== "All" && (
              <Button onClick={() => setActiveCategory("All")} className="mt-4 text-[13px]">
                View all listings
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {filtered.map((listing) => {
              const isDemo = listing.id < 0;
              return (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="group no-underline">
                <div className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-all duration-200 group-hover:shadow-[var(--shadow-card-hover)] group-hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative pt-[75%] overflow-hidden">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => toggleLike(e, listing.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Heart size={14} fill={liked.includes(listing.id) ? "#ff3b3b" : "none"} color={liked.includes(listing.id) ? "#ff3b3b" : "#fff"} />
                    </button>
                    {listing.condition === "New" && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-[3px] rounded-md bg-[var(--color-success)]/90 text-white backdrop-blur-sm">
                        NEW
                      </span>
                    )}
                    {isDemo && (
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-[3px] rounded-md bg-black/40 text-white backdrop-blur-sm">
                        Demo
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-3.5 pb-3.5 pt-3">
                    <p className="text-[13px] font-semibold truncate mb-1 leading-snug">{listing.title}</p>
                    <p className="text-[17px] font-extrabold mb-2 tracking-tight">${listing.price}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--color-muted)] bg-[var(--color-subtle)] px-2 py-[3px] rounded-md border border-[var(--color-border)]">
                        {listing.condition}
                      </span>
                      <span className="flex items-center gap-2 text-[11px] text-[var(--color-muted)] font-medium">
                        <span className="flex items-center gap-0.5"><Heart size={10} className="text-[var(--color-brand)]" fill="currentColor" /> {listing.likes}</span>
                        @{listing.seller}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-8">
        <div className="max-w-[1400px] mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight">mercari</span>
          </div>
          <div className="flex items-center gap-6 text-[12.5px] text-[var(--color-muted)] font-medium">
            <Link href="/sell" className="hover:text-[var(--color-brand)] transition-colors no-underline">Sell</Link>
            <Link href="/auth" className="hover:text-[var(--color-brand)] transition-colors no-underline">Sign in</Link>
            <span>© {new Date().getFullYear()} mercari clone</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
