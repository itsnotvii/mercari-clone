"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BuyButton({
  listingId,
  title,
  price,
  image,
  sellerId,
}: {
  listingId: number;
  title: string;
  price: number;
  image: string;
  sellerId: string,
}) {
  const [buyLoading, setBuyLoading] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerStatus, setOfferStatus] = useState<"idle" | "success" | "error">("idle");

  const handleBuy = async () => {
    setBuyLoading(true);
    const res = await fetch("/api'create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, title, price, image }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setBuyLoading(false);
  };

  const handleOffer = async () => {
    if (!offerAmount || Number(offerAmount) <= 0) return;
    setOfferLoading(true);
    setErrorMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to make an offer");
      if (user.id === sellerId) throw new Error("You can't make an offer on your own listing");

      const { error } = await supabase.from("offers").insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        amount: Number(offerAmount),
      });

      if (error) throw error;
      setOfferStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setOfferStatus("error");
    } finally {
      setOfferLoading(false);
    }
  };

  return (
    
  )
}