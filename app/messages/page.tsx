"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppNav from "../components/ui/AppNav";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";

type ConversationRow = {
  id: number;
  listing_id: number | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listing: { title: string; image_url: string | null } | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [otherUsernames, setOtherUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function fetchConversations(uid: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, last_message_at, listing:listings(title, image_url)")
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order("last_message_at", { ascending: false });

    if (!error && data) {
      const rows = data as unknown as ConversationRow[];
      setConversations(rows);
      const otherIds = [...new Set(rows.map((c) => (c.buyer_id === uid ? c.seller_id : c.buyer_id)))];
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", otherIds);
        const map: Record<string, string> = {};
        (profiles || []).forEach((p) => { map[p.id] = p.username; });
        setOtherUsernames(map);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      fetchConversations(user.id);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav backHref="/" />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-extrabold mb-6 tracking-tight">Messages</h1>
        {loading ? (
          <SkeletonList count={3} />
        ) : conversations.length === 0 ? (
          <EmptyState emoji="💬" message="No conversations yet" />
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => {
              const otherId = c.buyer_id === userId ? c.seller_id : c.buyer_id;
              return (
                <Link key={c.id} href={`/messages/${c.id}`} className="no-underline">
                  <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 flex items-center gap-4 hover:shadow-[var(--shadow-card-hover)] transition-all">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[var(--color-subtle)]">
                      {c.listing?.image_url && (
                        <Image src={c.listing.image_url} alt={c.listing.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">@{otherUsernames[otherId] || "..."}</p>
                      {c.listing && <p className="text-xs text-[var(--color-muted)] truncate">{c.listing.title}</p>}
                    </div>
                    <span className="text-xs text-[var(--color-muted)] shrink-0">
                      {new Date(c.last_message_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
