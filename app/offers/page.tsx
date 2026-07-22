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
}