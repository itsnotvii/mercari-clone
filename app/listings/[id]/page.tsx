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
}

