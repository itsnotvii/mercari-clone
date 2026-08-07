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
  })
}