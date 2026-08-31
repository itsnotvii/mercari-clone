"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppNav from "../../components/ui/AppNav";
import Button from "../../components/ui/Button";
import { Send } from "lucide-react";

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

type Conversation = {
  id: number;
  listing_id: number | null;
  buyer_id: string;
  seller_id: string;
  listing: { title: string } | null;
};

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversationId = Number(params.conversationId);

  const [userId, setUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUsername, setOtherUsername] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversation(uid: string) {
    const { data: conv, error } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, listing:listings(title)")
      .eq("id", conversationId)
      .single();

    if (error || !conv) { setLoading(false); return; }

    const c = conv as unknown as Conversation;
    setConversation(c);

    const otherId = c.buyer_id === uid ? c.seller_id : c.buyer_id;
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", otherId).single();
    if (profile) setOtherUsername(profile.username);

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (msgs) setMessages(msgs);

    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", uid)
      .is("read_at", null);

    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      loadConversation(user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, router]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !userId || !conversation) return;
    setSending(true);
    const text = body.trim();
    setBody("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: text,
    });

    if (!error) {
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
      const otherId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
      await supabase.from("notifications").insert({
        user_id: otherId,
        type: "new_message",
        payload: { conversationId },
      });
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-muted)] text-sm">Loading...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-3">😕</p>
          <p className="text-base font-bold mb-1.5">Conversation not found</p>
          <Link href="/messages" className="text-[13px] text-[var(--color-brand)] font-semibold no-underline">← Back to messages</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <AppNav backHref="/messages" rightSlot={<span className="font-bold text-sm">@{otherUsername}</span>} />
      <main className="max-w-2xl mx-auto px-4 py-6 flex-1 flex flex-col w-full">
        {conversation.listing && (
          <Link href={`/listings/${conversation.listing_id}`} className="text-xs text-[var(--color-muted)] no-underline mb-4 block">
            Re: <span className="font-semibold text-[var(--color-text)]">{conversation.listing.title}</span>
          </Link>
        )}
        <div className="flex-1 flex flex-col gap-2.5 mb-4">
          {messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] ${
                    mine
                      ? "bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white rounded-br-sm"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-bl-sm"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 sticky bottom-4">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Write a message..."
            className="flex-1 px-4 py-2.5 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-brand)] transition-colors"
          />
          <Button onClick={handleSend} disabled={sending || !body.trim()} className="px-4 py-2.5">
            <Send size={15} />
          </Button>
        </div>
      </main>
    </div>
  );
}
