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
    .select("*, profiles(username")
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
        </div>
      </main>
    </div>
  )
}