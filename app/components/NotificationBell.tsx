"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications, type Notification } from "./NotificationsProvider";

function describe(n: Notification): { text: string; href: string } {
  const payload = n.payload || {};
  const title = typeof payload.listingTitle === "string" ? payload.listingTitle : "your listing";
  switch (n.type) {
    case "offer_received":
      return { text: `New offer of $${payload.amount} on "${title}"`, href: "/offers" };
    case "offer_accepted":
      return { text: `Your offer on "${title}" was accepted!`, href: `/listings/${payload.listingId}` };
    case "offer_declined":
      return { text: `Your offer on "${title}" was declined`, href: `/listings/${payload.listingId}` };
    case "new_message":
      return { text: `New message from @${payload.senderUsername || "someone"}`, href: `/messages/${payload.conversationId}` };
    case "item_sold":
      return { text: `"${title}" sold!`, href: `/my-listings` };
    case "new_review":
      return { text: `You got a new review`, href: `/profile/${payload.username || ""}` };
    case "new_follower":
      return { text: `@${payload.followerUsername || "Someone"} started following you`, href: "/" };
    default:
      return { text: "New notification", href: "/" };
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-[10px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-subtle)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-brand)] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute top-[46px] right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1.5 w-[300px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] z-[100] max-h-[400px] overflow-y-auto"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-3 pt-2 pb-2.5 border-b border-[var(--color-border)] mb-1">
            <p className="text-xs font-bold">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-[var(--color-brand)] font-semibold">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-[12.5px] text-[var(--color-muted)] text-center py-6">You&apos;re all caught up</p>
          ) : (
            notifications.map((n) => {
              const { text, href } = describe(n);
              return (
                <Link
                  key={n.id}
                  href={href}
                  onClick={() => { markRead(n.id); setOpen(false); }}
                  className={`block px-3 py-2.5 rounded-lg text-[12.5px] no-underline hover:bg-[var(--color-subtle)] transition-colors ${
                    n.read_at ? "text-[var(--color-muted)]" : "text-[var(--color-text)] font-medium"
                  }`}
                >
                  {!n.read_at && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mr-1.5 align-middle" />}
                  {text}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
