import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  size?: number;
  className?: string;
};

export default function RatingStars({ rating, size = 12, className = "" }: RatingStarsProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className="text-amber-500"
          fill={n <= Math.round(rating) ? "#f59e0b" : "none"}
        />
      ))}
    </div>
  );
}
