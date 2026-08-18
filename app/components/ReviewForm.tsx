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
              fill={(hovered || rating) >= star ? "#f59e0b" : "none"}
              color={(hovered || rating) >= star ? "#f59e0b" : "rgba(0,0,0,0.2)"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: 12, color: muted, alignSelf: "center", marginLeft: 4 }}>
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
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${border}`, background: subtle, fontSize: 13, outline: "none", resize: "none", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", boxSizing: "border-box", marginBottom: 12 }}
        onFocus={(e) => (e.target.style.borderColor = "#ff3b3b")}
        onBlur={(e) => (e.target.style.borderColor = border)}
      />

      {error && <p style={{ fontSize: 12, color: "#ff3b3b", marginBottom: 10 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 2px 10px rgba(255,59,59,0.25)" }}
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}