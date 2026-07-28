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