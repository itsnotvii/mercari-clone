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
                        </div>

                        {/* Seller */}
                        <div className="mt-6 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-sm">
                                {listing.seller[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{listing.seller}</p>
                                <p className="text-xs text-gray-400">Seller</p>
                            </div>
                        </div>
                </div>


            </main>

            
        </div>
    )
}

