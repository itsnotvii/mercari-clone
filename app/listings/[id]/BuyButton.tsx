"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Share2, Check } from "lucide-react";
import Button from "../../components/ui/Button";

export default function BuyButton({ listingId, title, price, image, sellerId }: { listingId: number; title: string; price: number; image: string; sellerId: string; }) {
  const [buyLoading, setBuyLoading] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerStatus, setOfferStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const key = "recently_viewed";
      const existing: number[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [listingId, ...existing.filter((id) => id !== listingId)].slice(0, 6);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }, [listingId]);

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
      const { error } = await supabase.from("offers").insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId, amount: Number(offerAmount) });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: sellerId,
        type: "offer_received",
        payload: { listingId, listingTitle: title, amount: Number(offerAmount) },
      });
      setOfferStatus("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setOfferStatus("error");
    } finally {
      setOfferLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleShare}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] w-full border-[1.5px] text-[13px] font-semibold transition-all ${
            copied
              ? "bg-green-500/10 border-green-500/20 text-green-600"
              : "bg-black/[0.03] border-black/10 text-[var(--color-muted)]"
          }`}
        >
          {copied ? <><Check size={14} /> Copied to clipboard!</> : <><Share2 size={14} /> Share listing</>}
        </button>
        <Button onClick={handleBuy} disabled={buyLoading} className="w-full py-3">
          {buyLoading ? "Loading..." : `Buy Now — $${price}`}
        </Button>
        <Button
          variant="secondary"
          onClick={() => { setShowOffer(true); setOfferStatus("idle"); setOfferAmount(""); }}
          className="w-full py-3 border-[var(--color-brand)] text-[var(--color-brand)] bg-transparent hover:bg-red-500/5"
        >
          Make an Offer
        </Button>
      </div>
      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowOffer(false)}>
          <div className="bg-[var(--color-surface)] rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            {offerStatus === "success" ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">🎉</p>
                <h3 className="text-lg font-bold mb-1">Offer Sent!</h3>
                <p className="text-sm text-[var(--color-muted)] mb-5">The seller will review your offer of ${offerAmount}.</p>
                <Button onClick={() => setShowOffer(false)} className="w-full py-2.5 text-sm">Done</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1">Make an Offer</h3>
                <p className="text-sm text-[var(--color-muted)] mb-5">Listed at <span className="font-semibold text-[var(--color-text)]">${price}</span></p>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] font-medium">$</span>
                  <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="Your offer" className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]" />
                </div>
                <div className="flex gap-2 mb-4">
                  {[0.9, 0.8, 0.7].map((pct) => (
                    <button key={pct} onClick={() => setOfferAmount(String(Math.round(price * pct)))} className="flex-1 text-xs py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors">${Math.round(price * pct)}</button>
                  ))}
                </div>
                {errorMsg && <p className="text-red-500 text-xs mb-3">{errorMsg}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setShowOffer(false)} className="flex-1 border border-[var(--color-border)] text-[var(--color-muted)] py-2.5 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors">Cancel</button>
                  <Button onClick={handleOffer} disabled={offerLoading || !offerAmount} className="flex-1 py-2.5 text-sm">{offerLoading ? "Sending..." : "Send Offer"}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
