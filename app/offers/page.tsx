"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Offer = {
  id: number;
  amount: number;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  listing_id: number;
  buyer_id: string;
  listings: { title: string; price: number; image_url: string | null };
  buyer: { username: string };
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user} }) => {
      if (!user) router.push("/auth");
      else fetchOffers(user.id);
    });
  }, [router]);

  async function fetchOffers(sellerId: string) {
    const { data, error } = await supabase
    .from("offers")
    .select(`
      *,
      listings(tutle, price, image_url),
      buyer:profiles!offers_buyer_id_fkey(username)
      `)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (!error && data) setOffers(data as Offer[]);
    setLoading(false);
  }

  async function handleStatus(offerId: number, status: "accepted" | "declined") {
    setUpdating(offerId);
    await supabase.from("offers").update({ status }).eq("id", offerId);
    setOffers((prev) => 
      prev.map((o) => (o.id === offerId ? { ...o, status } : o))
    );
    setUpdating(null);
  }

  const pending = offers.filter((o) => o.status === "pending");
  const past = offers.filter((o) => o.status !== "pending");

  const statusBadge = (status: string) => {
    if (status === "accepted") return "bg-green-100 text-green-600";
    if (status === "declined") return "bg-red-100 text-red-500";
    return "bg-yellow-100 text-yellow-600";
  };

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

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Offers</h1>

        {loading ? (
          <div className="soace-y-3"
        )}
      </main>
    </div>
  )
}