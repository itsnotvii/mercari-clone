"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else fetchOffers(user.id);
    });
  }, [router]);

  async function fetchOffers(sellerId: string) {
    const { data, error } = await supabase
      .from("offers")
      .select(`
        *,
        listings(title, price, image_url),
        buyer:profiles!offers_buyer_id_fkey(username)
      `)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (!error && data) setOffers(data as Offer[]);
    setLoading(false);
  }

  async function handleStatus(offerId: number, status: "accepted" | "declined") {
    setUpdating(offerId);
    await supabase.from("offers").update({ status }).eq("id", offerId);
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status } : o))
    );
    setUpdating(null);
  }

  const pending = offers.filter((o) => o.status === "pending");
  const past = offers.filter((o) => o.status !== "pending");

  const statusBadge = (status: string) => {
    if (status === "accepted") return "bg-green-100 text-green-600";
    if (status === "declined") return "bg-red-100 text-red-500";
    return "bg-yellow-100 text-yellow-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-red-400">
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Offers</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-4xl mb-3">📬</p>
            <p className="text-gray-400 text-sm">No offers yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Pending ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                      <img
                        src={offer.listings?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                        alt={offer.listings?.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{offer.listings?.title}</p>
                        <p className="text-xs text-gray-400">
                          from <span className="font-medium text-gray-600">{offer.buyer?.username}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-lg font-black text-gray-900">${offer.amount}</p>
                          <span className="text-xs text-gray-400">
                            vs ${offer.listings?.price} listed
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleStatus(offer.id, "accepted")}
                          disabled={updating === offer.id}
                          className="px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full hover:bg-green-600 transition disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatus(offer.id, "declined")}
                          disabled={updating === offer.id}
                          className="px-4 py-1.5 border border-red-300 text-red-500 text-xs font-semibold rounded-full hover:bg-red-50 transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Past offers
                </h2>
                <div className="space-y-3">
                  {past.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 opacity-70">
                      <img
                        src={offer.listings?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                        alt={offer.listings?.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{offer.listings?.title}</p>
                        <p className="text-xs text-gray-400">
                          from <span className="font-medium text-gray-600">{offer.buyer?.username}</span>
                        </p>
                        <p className="text-lg font-black text-gray-900 mt-1">${offer.amount}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadge(offer.status)}`}>
                        {offer.status}
                      </span>
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