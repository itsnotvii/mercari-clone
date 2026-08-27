import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AppNav from "../../components/ui/AppNav";
import EmptyState from "../../components/ui/EmptyState";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single();
  if (error || !profile) notFound();

  const { data: listings } = await supabase.from("listings").select("*").eq("seller_id", profile.id).eq("sold", false).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center text-white font-extrabold text-2xl shadow-[var(--shadow-glow-brand-sm)]">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <p className="text-sm text-[var(--color-muted)]">Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">{listings?.length || 0} active listing{listings?.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-4">Listings</h2>
        {!listings || listings.length === 0 ? (
          <EmptyState emoji="📦" message="No listings yet" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
      </main>
    </div>
  );
}
