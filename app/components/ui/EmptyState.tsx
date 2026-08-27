import Button from "./Button";

type EmptyStateProps = {
  emoji: string;
  message: string;
  cta?: { label: string; href: string };
};

export default function EmptyState({ emoji, message, cta }: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="text-sm text-[var(--color-muted)] mb-5">{message}</p>
      {cta ? <Button href={cta.href}>{cta.label}</Button> : null}
    </div>
  );
}
