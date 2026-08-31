"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppNav from "../components/ui/AppNav";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";

type Offer = {
  id: number;
  amount: number;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  listing_id: number;
  buyer_id: string;
  listings: { title: string; price: number; image_url: string | null };
  buyer: { username: string };
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  async function fetchOffers(sellerId: string) {
    const { data, error } = await supabase
      .from("offers")
      .select(`*, listings(title, price, image_url), buyer:profiles!offers_buyer_id_fkey(username)`)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (!error && data) setOffers(data as Offer[]);
    setLoading(false);
  }

  async function handleStatus(offerId: number, status: "accepted" | "declined") {
    setUpdating(offerId);
    await supabase.from("offers").update({ status }).eq("id", offerId);
    setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status } : o)));

    const offer = offers.find((o) => o.id === offerId);
    if (offer) {
      if (status === "accepted") {
        await supabase.from("listings").update({ sold: true }).eq("id", offer.listing_id);
      }
      await supabase.from("notifications").insert({
        user_id: offer.buyer_id,
        type: status === "accepted" ? "offer_accepted" : "offer_declined",
        payload: { listingId: offer.listing_id, listingTitle: offer.listings?.title },
      });
    }

    setUpdating(null);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else fetchOffers(user.id);
    });
  }, [router]);

  const pending = offers.filter((o) => o.status === "pending");
  const past = offers.filter((o) => o.status !== "pending");

  const statusVariant = (status: string) => {
    if (status === "accepted") return "success" as const;
    if (status === "declined") return "danger" as const;
    return "warning" as const;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav backHref="/" />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-extrabold mb-6 tracking-tight">Offers</h1>
        {loading ? (
          <SkeletonList count={3} />
        ) : offers.length === 0 ? (
          <EmptyState emoji="📬" message="No offers yet" />
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Pending ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map((offer) => (
                    <div key={offer.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={offer.listings?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt={offer.listings?.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{offer.listings?.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">from <span className="font-medium">{offer.buyer?.username}</span></p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-lg font-black">${offer.amount}</p>
                          <span className="text-xs text-[var(--color-muted)]">vs ${offer.listings?.price} listed</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleStatus(offer.id, "accepted")} disabled={updating === offer.id} className="px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full hover:bg-green-600 transition-colors disabled:opacity-50">Accept</button>
                        <button onClick={() => handleStatus(offer.id, "declined")} disabled={updating === offer.id} className="px-4 py-1.5 border border-red-300 text-red-500 text-xs font-semibold rounded-full hover:bg-red-50 transition-colors disabled:opacity-50">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Past offers</h2>
                <div className="space-y-3">
                  {past.map((offer) => (
                    <div key={offer.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 flex items-center gap-4 opacity-70">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={offer.listings?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt={offer.listings?.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{offer.listings?.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">from <span className="font-medium">{offer.buyer?.username}</span></p>
                        <p className="text-lg font-black mt-1">${offer.amount}</p>
                      </div>
                      <Badge variant={statusVariant(offer.status)}>{offer.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
