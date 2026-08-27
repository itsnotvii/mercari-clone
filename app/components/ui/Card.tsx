import { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] ${
        hover
          ? "transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
          : ""
      } ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
