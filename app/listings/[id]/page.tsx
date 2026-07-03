import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  const seller = listing.profiles?.username || "unknown";
  const image = listing.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-red-400 mb-6 inline-block">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex">
          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-square">
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between md:w-1/2">
            <div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {listing.category}
              </span>
              <h1 className="text-xl font-bold mt-3 text-gray-900">
                {listing.title}
              </h1>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${listing.price}
              </p>

              {listing.description && (
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                  {listing.description}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Condition</span>
                  <span className="font-medium">{listing.condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium">{listing.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Likes</span>
                  <span className="font-medium">{listing.likes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Listed</span>
                  <span className="font-medium">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Seller */}
              <Link href={`/profile/${seller}`} className="mt-6 flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-sm">
                  {seller[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{seller}</p>
                  <p className="text-xs text-gray-400">View profile →</p>
                </div>
              </Link>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition">
                Buy Now — ${listing.price}
              </button>
              <button className="w-full border border-red-500 text-red-500 py-3 rounded-full font-medium hover:bg-red-50 transition">
                Make an Offer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}