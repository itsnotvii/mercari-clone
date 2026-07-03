import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", profile.id)
    .eq("sold", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screent bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-2xl">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <p className="text-sm text-gray-400">
              Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {listings?.length || 0} active listing{listings?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Listings grid */}
        <h2 className="text-lg font-bold mb-4">Listings</h2>
        {!listings || listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400 text-sm">No listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold truncate text-gray-900">{listing.title}</p>
                    <p className="text-sm font-black mt-1">${listing.price}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium mt-2 inline-block bg-gray-100 text-gray-400">
                      {listing.condition}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}