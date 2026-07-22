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

  const pending = offers.filter((o) => offers.status === "pending");
  const past = offers.filter((o) => o.status !== "pending");

  const statusBadge = (status: string) => {
    if (status === "accepted") return "bg-green-100 text-green-600";
    if (status === "declined") return "bg-red-100 text-red-500";
    return "bg-yellow-100 text-yellow-600";
  };

  
}