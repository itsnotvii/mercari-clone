type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`bg-[var(--color-surface)] rounded-2xl animate-pulse ${className}`} />;
}

export function SkeletonList({
  count = 3,
  itemClassName = "h-24",
}: {
  count?: number;
  itemClassName?: string;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`p-4 ${itemClassName}`} />
      ))}
    </div>
  );
}
