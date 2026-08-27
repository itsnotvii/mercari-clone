"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";
import Button from "./ui/Button";

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

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 mt-4">
      <h3 className="text-sm font-bold mb-3.5">Leave a review</h3>

      {/* Stars */}
      <div className="flex gap-1 mb-3.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="bg-transparent border-none cursor-pointer p-0.5 transition-transform active:scale-90"
          >
            <Star
              size={24}
              fill={(hovered || rating) >= star ? "#f59e0b" : "none"}
              color={(hovered || rating) >= star ? "#f59e0b" : "rgba(0,0,0,0.2)"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-[var(--color-muted)] self-center ml-1">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this seller... (optional)"
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] text-[var(--color-text)] text-[13px] outline-none resize-none box-border mb-3 focus:border-[var(--color-brand)] transition-colors"
      />

      {error && <p className="text-xs text-red-500 mb-2.5">{error}</p>}

      <Button onClick={handleSubmit} disabled={loading} className="text-[13px] py-2.5 px-5">
        {loading ? "Submitting..." : "Submit review"}
      </Button>
    </div>
  );
}
