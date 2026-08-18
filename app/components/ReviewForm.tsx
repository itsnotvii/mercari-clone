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

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${border}`, padding: 20, marginTop: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>Leave a review</h3>

      {/* Stars */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.1s" }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Star
              size={24}
              fill={(hovered || rating) >= star ? "f59e0b" : "none"}
              color={(hovered || rating) >= star ? "f59e0b" : "rgba(0,0,0,0.2)"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: 12, color: muted, alignSelf: "center", marginLeft: 4 }}>
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </span>
        )}
      </div>
  )
