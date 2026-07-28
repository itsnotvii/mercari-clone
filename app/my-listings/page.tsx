"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: number;
  title: string;
  price: number;
  category: string;
  image_url: string | null;
  sold: boolean;
  created_at: string;
  likes: number;
};

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing []>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else fetchListings(user.id);
    });
  }, [router]);

  async function fetchListings(userId: string) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    
    if (!error && data) setListings(data);
    setLoading(false);
  }

  async function toggleSold(id: number, currentSold: boolean) {
    setUpdating(id);
    await supabase.from("listings").update({ sold: !currentSold }).eq("id", id);
    setListings((prev) => 
      prev.map((l) => (l.id === id ? { ...l, sold: !currentSold }: l))
    );
    setUpdating(null);
  }

  async function deleteListing(id: number) {
    if (!confirm("Delete this listing?")) return;
    setUpdating(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setUpdating(null);
  }

  const active = listings.filter((l) => !l.sold);
  const sold = listings.filter((l) => l.sold);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-red-400">
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          
        </div>
      </main>
    </div>
  )
}