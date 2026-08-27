"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppNav from "../components/ui/AppNav";
import Button from "../components/ui/Button";

const categories = ["Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"];
const conditions = ["New", "Like New", "Good", "Fair"];

export default function SellPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", price: "", category: "", condition: "", description: "" });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else setUserId(user.id);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setGenerating(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/generate-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType: image.type }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setForm({ title: data.title || "", price: String(data.price || ""), category: data.category || "", condition: data.condition || "", description: data.description || "" });
        setGenerating(false);
      };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
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
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, image);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      const { error: insertError } = await supabase.from("listings").insert({
        title: form.title, price: Number(form.price), category: form.category,
        condition: form.condition, description: form.description, image_url: imageUrl, seller_id: userId,
      });
      if (insertError) throw insertError;
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav />
      <main className="max-w-lg mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-extrabold mb-6 tracking-tight">List an item</h1>
        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 space-y-5">
          <div>
            <label className={labelClass}>Photo</label>
            <div
              className="w-full h-48 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[var(--color-brand)] transition-colors"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">📷</p>
                  <p className="text-xs text-[var(--color-muted)]">Click to upload a photo</p>
                </div>
              )}
            </div>
            <input id="image-input" type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>
          {image && (
            <Button type="button" variant="ai" onClick={handleGenerate} disabled={generating} className="w-full py-3 text-sm">
              {generating ? <><span className="animate-spin">⏳</span> Generating...</> : <>✨ Generate listing with AI</>}
            </Button>
          )}
          <div>
            <label className={labelClass}>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="What are you selling?" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Price ($)</label>
            <input name="price" value={form.price} onChange={handleChange} required type="number" placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select name="condition" value={form.condition} onChange={handleChange} required className={inputClass}>
              <option value="">Select condition</option>
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your item..." rows={4} className={`${inputClass} resize-none`} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full py-3">
            {loading ? "Listing..." : "List item"}
          </Button>
        </form>
      </main>
    </div>
  );
}
