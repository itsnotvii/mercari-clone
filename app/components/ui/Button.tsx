import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ai";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm px-5 py-2.5 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 whitespace-nowrap";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white shadow-[var(--shadow-glow-brand-sm)] hover:shadow-[var(--shadow-glow-brand)] hover:-translate-y-0.5",
  secondary:
    "bg-black/5 border border-black/10 text-[var(--color-text)] hover:bg-black/10",
  danger: "bg-transparent border border-red-300 text-red-500 hover:bg-red-50",
  ai: "bg-[linear-gradient(135deg,var(--color-accent-ai-start),var(--color-accent-ai-end))] text-white shadow-[0_4px_14px_-2px_rgba(99,102,241,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.45)] hover:-translate-y-0.5",
};

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export default function Button({
  variant = "primary",
  children,
  className = "",
  href,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
