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
}