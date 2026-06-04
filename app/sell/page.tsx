"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"]
const conditions = ["New", "Like New", "Good", "Fair"];

export default function SellPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        title: "",
        price: "",
        category: "",
        condition: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold mb-2">Listing Submitted!</h2>
                    <p className="text-gray-400 text-s mb-6">Your item has been listed for sale.</p>
                    <Link href="/" className="bg-red-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition">
                        Back to listings
                    </Link>
                </div>
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

            <main className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">List an item</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            placeholder="What are you selling?"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400"
                        />
                    </div>

                    
                </form>
            </main>
        </div>
    )
    
}