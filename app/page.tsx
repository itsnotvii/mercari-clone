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
    
  )
}