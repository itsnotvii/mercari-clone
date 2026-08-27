import Button from "../components/ui/Button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card-hover)] p-8 text-center max-w-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Purchase Complete!</h2>
        <p className="text-[var(--color-muted)] text-sm mb-6">Your order has been placed successfully.</p>
        <Button href="/" className="px-6 py-3 text-sm">
          Back to listings
        </Button>
      </div>
    </div>
  );
}
