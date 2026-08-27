import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type AppNavProps = {
  backHref?: string;
  backLabel?: string;
  maxWidthClassName?: string;
  rightSlot?: ReactNode;
};

export default function AppNav({
  backHref,
  backLabel = "Back",
  maxWidthClassName = "max-w-6xl",
  rightSlot,
}: AppNavProps) {
  return (
    <nav className="sticky top-0 z-10 bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
      <div className={`${maxWidthClassName} mx-auto px-4 py-3 flex items-center gap-4`}>
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors no-underline"
          >
            <ArrowLeft size={15} /> {backLabel}
          </Link>
        ) : null}
        <Link
          href="/"
          className="font-extrabold text-2xl tracking-tight text-[var(--color-brand)] no-underline"
        >
          mercari
        </Link>
        {rightSlot ? (
          <div className="ml-auto flex items-center gap-3">{rightSlot}</div>
        ) : backHref ? (
          <div className="w-16" />
        ) : null}
      </div>
    </nav>
  );
}
