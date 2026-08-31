import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AppNav from "../../components/ui/AppNav";
import EmptyState from "../../components/ui/EmptyState";
import RatingStars from "../../components/ui/RatingStars";
import FollowButton from "./FollowButton";
import { demoListings, getDemoSellerByUsername } from "../../demoListings";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single();

  if (error || !profile) {
    const demoSeller = getDemoSellerByUsername(username);
    if (!demoSeller) notFound();

    const sellerListings = demoListings.filter((l) => l.seller === username);

    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <AppNav />
        <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center text-white font-extrabold text-2xl shadow-[var(--shadow-glow-brand-sm)] shrink-0">
              {demoSeller.username[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{demoSeller.username}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/10 text-[var(--color-muted)]">Demo</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-1">{demoSeller.bio}</p>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--color-muted)]">
                <span>Member since {demoSeller.memberSince}</span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-500" fill="#f59e0b" /> {demoSeller.rating.toFixed(1)} ({demoSeller.reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4">Listings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {sellerListings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="group no-underline">
                <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-all duration-200 group-hover:shadow-[var(--shadow-card-hover)] group-hover:-translate-y-1">
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image src={listing.image} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate">{listing.title}</p>
                    <p className="text-sm font-black mt-1">${listing.price}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium mt-2 inline-block bg-[var(--color-subtle)] text-[var(--color-muted)]">{listing.condition}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <h2 className="text-lg font-bold mb-4">Reviews</h2>
          <div className="space-y-3">
            {demoSeller.reviews.map((review, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold">{review.reviewer}</span>
                  <span className="text-xs text-[var(--color-muted)]">{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} className="text-amber-500" fill={n <= review.rating ? "#f59e0b" : "none"} />
                  ))}
                </div>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const { data: listings } = await supabase.from("listings").select("*").eq("seller_id", profile.id).eq("sold", false).order("created_at", { ascending: false });

  const { data: ratingSummary } = await supabase
    .from("seller_rating_summary")
    .select("avg_rating, review_count")
    .eq("seller_id", profile.id)
    .maybeSingle();

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false });

  let reviews: { id: number; rating: number; comment: string | null; created_at: string; reviewerName: string }[] = [];
  if (reviewRows && reviewRows.length > 0) {
    const reviewerIds = [...new Set(reviewRows.map((r) => r.reviewer_id))];
    const { data: reviewers } = await supabase.from("profiles").select("id, username").in("id", reviewerIds);
    const usernameById = new Map((reviewers || []).map((p) => [p.id, p.username as string]));
    reviews = reviewRows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewerName: usernameById.get(r.reviewer_id) || "unknown",
    }));
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center text-white font-extrabold text-2xl shadow-[var(--shadow-glow-brand-sm)] shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <p className="text-sm text-[var(--color-muted)]">Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-muted)]">
              <span>{listings?.length || 0} active listing{listings?.length !== 1 ? "s" : ""}</span>
              {ratingSummary && (
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-500" fill="#f59e0b" /> {Number(ratingSummary.avg_rating).toFixed(1)} ({ratingSummary.review_count})
                </span>
              )}
            </div>
          </div>
          <FollowButton sellerId={profile.id} />
        </div>
        <h2 className="text-lg font-bold mb-4">Listings</h2>
        {!listings || listings.length === 0 ? (
          <EmptyState emoji="📦" message="No listings yet" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {listings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="group no-underline">
                <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)] transition-all duration-200 group-hover:shadow-[var(--shadow-card-hover)] group-hover:-translate-y-1">
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate">{listing.title}</p>
                    <p className="text-sm font-black mt-1">${listing.price}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium mt-2 inline-block bg-[var(--color-subtle)] text-[var(--color-muted)]">{listing.condition}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState emoji="⭐" message="No reviews yet" />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold">{review.reviewerName}</span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <RatingStars rating={review.rating} size={12} className="mb-2" />
                {review.comment && <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
