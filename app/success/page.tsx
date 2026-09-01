"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "../components/ui/Button";

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing");

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12] pointer-events-none"
        style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))", filter: "blur(80px)" }}
      />
      <div className="relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card-hover)] p-10 text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl shadow-[var(--shadow-glow-brand-sm)]"
          style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}
        >
          🎉
        </div>
        <h2 className="text-2xl font-extrabold mb-2 tracking-tight">Purchase complete!</h2>
        <p className="text-[var(--color-muted)] text-sm mb-7">Your order has been placed successfully. The seller has been notified and will ship it your way soon.</p>
        <div className="flex flex-col gap-2.5">
          <Button href="/" className="w-full py-3 text-sm">
            Back to listings
          </Button>
          {listingId && (
            <Button href={`/listings/${listingId}`} variant="secondary" className="w-full py-3 text-sm">
              View listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
