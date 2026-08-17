"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";

export default function ReviewForm({
  sellerId,
  listingId,
  onSubmitted,
}: {
  sellerId: string;
  listingId: number;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating"); return; }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to leave a review");
      if (user.id === sellerId) throw new Error("You can't review yourself");

      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId,
        rating,
        comment,
      });
      if (error) throw error;
      onSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  const border = "rgba(0,0,0,0.07)";
  const muted = "rgba(0,0,0,0.4)";
  const subtle = "rgba(0,0,0,0.04)";
