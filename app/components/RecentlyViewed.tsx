"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Clock } from "lucide-react";

type Listing = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  condition: string;
};

export default function RecentlyViewed({ dark }: { dark: boolean }) {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const ids = getRecentIds();
    if (ids.length === 0) return;
    fetchListings(ids);
  }, []);

  function getRecentIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    } catch {
      return [];
    }
  }

  async function fetchListings(ids: number[]) {
    const { data } = await supabase
    .from("listings")
    .select("id, title, price, image_url, condition")
    .in("id", ids)
    .eq("sold", false);

    if (data) {
      const ordered = ids
        .map((id) => data.find((l) => l.id === id))
        .filter(Boolean) as Listing[];
      setListings(ordered);
    }
  }

}