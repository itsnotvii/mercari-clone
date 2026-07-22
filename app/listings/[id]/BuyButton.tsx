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
  sellerId: string;
}) {
  const [buyLoading, setBuyLoading] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerStatus, setOfferStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleBuy = async () => {
    setBuyLoading(true);
    const res = await fetch("/api/create-checkout", {
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
    <>
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleBuy}
          disabled={buyLoading}
          className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition disabled:opacity-50"
        >
          {buyLoading ? "Loading..." : `Buy Now — $${price}`}
        </button>
        <button
          onClick={() => { setShowOffer(true); setOfferStatus("idle"); setOfferAmount(""); }}
          className="w-full border border-red-500 text-red-500 py-3 rounded-full font-medium hover:bg-red-50 transition"
        >
          Make an Offer
        </button>
      </div>

      {/* Offer modal */}
      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowOffer(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {offerStatus === "success" ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">🎉</p>
                <h3 className="text-lg font-bold mb-1">Offer Sent!</h3>
                <p className="text-sm text-gray-400 mb-5">
                  The seller will review your offer of ${offerAmount}.
                </p>
                <button
                  onClick={() => setShowOffer(false)}
                  className="w-full bg-red-500 text-white py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1">Make an Offer</h3>
                <p className="text-sm text-gray-400 mb-5">
                  Listed at <span className="font-semibold text-gray-700">${price}</span>
                </p>

                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Your offer"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="flex gap-2 mb-4">
                  {[0.9, 0.8, 0.7].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setOfferAmount(String(Math.round(price * pct)))}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition"
                    >
                      ${Math.round(price * pct)}
                    </button>
                  ))}
                </div>

                {errorMsg && <p className="text-red-500 text-xs mb-3">{errorMsg}</p>}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowOffer(false)}
                    className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOffer}
                    disabled={offerLoading || !offerAmount}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {offerLoading ? "Sending..." : "Send Offer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}