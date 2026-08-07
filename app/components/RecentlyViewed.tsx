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


}