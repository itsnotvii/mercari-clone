import Link from "next/link";
import Image from "next/image";
import { listings } from "./data";

const categories = ["All", "Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-500">mercari</h1>
          <div className="flex-1 mx-8">
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/sell" className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition">
              Sell
            </Link>
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              className="whitespace-nowrap px-4 py-1 rounded-full border border-gray-300 text-sm hover:border-red-400 hover:text-red-500 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Listing Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">{listings.length} items</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {listings.map((listing) => (
            <Link href={`/listings/${listing.id}`} key={listing.id}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="relative w-full aspect-square">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 truncate">{listing.title}</p>
                  <p className="text-sm font-bold mt-1">${listing.price}</p>
                  <p className="text-xs text-gray-400">{listing.condition}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}