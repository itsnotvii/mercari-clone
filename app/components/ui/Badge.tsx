import { CSSProperties, ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "danger" | "warning" | "info" | "brand";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-black/5 text-[var(--color-muted)]",
  success: "bg-green-100 text-green-600",
  danger: "bg-red-100 text-red-500",
  warning: "bg-yellow-100 text-yellow-600",
  info: "bg-blue-100 text-blue-600",
  brand:
    "bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: CSSProperties;
};

export default function Badge({ children, variant = "neutral", className = "", style }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
        style ? "" : variantClasses[variant]
      } ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
