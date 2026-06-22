"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const categories = ["Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"];
const conditions = ["New", "Like New", "Good", "Fair"];

export default function SellPage() {
  const router = useRouter;
  const [userId, setUserId] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    condition: "",
    description: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user} }) => {
      if (!user) router.push("/auth");
      else setUserId(user.id);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;

      if (image) {
        const ext = image.name.split(".").pop();
        const path = `${userId}.${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-imaged")
          .upload(path, image);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("listing").insert({
        title: form.title,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        description: form.description,
        image_url: imageUrl,
        seller_id: userId,
      });

      if (insertError) throw insertError;
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message: "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="maw-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari 
          </Link>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">List an item</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <div
              className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">📷</p>
                  <p className="text-xs text-gray-400">Click to upload a photo</p>
                </div>
              )}
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
        </form>
      </main>
    </div>
  )
}