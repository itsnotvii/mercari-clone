import Image from "next/image";
import Link from "next/link";
import { listings } from "../../data";

export default async function ListingPage({
    params,
} : {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; 
    const listing = listings.find((l) => l.id === Number(id));

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Listing not found.</p>
            </div>
        );
    }

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

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/" className="text-sm text-gray-400 hover:text-red-400 mb-6 inline-block">
                    ← Back to listings
                </Link>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:flex">
                {/* Image */}
                <div className="relative 2-full md:w-1/2 aspect-square">
                    <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object.cover"
                    />
                </div>

                
            </main>

            
        </div>
    )
}

