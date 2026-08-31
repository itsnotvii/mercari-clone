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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
      else setUserId(user.id);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const MAX_PHOTOS = 5;

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - images.length);
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, MAX_PHOTOS));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const primary = images[0];
    if (!primary) return;
    setGenerating(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(primary);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/generate-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType: primary.type }),
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
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${imageUrls.length}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
      const { error: insertError } = await supabase.from("listings").insert({
        title: form.title, price: Number(form.price), category: form.category,
        condition: form.condition, description: form.description,
        image_url: imageUrls[0] || null, images: imageUrls.length > 0 ? imageUrls : null,
        seller_id: userId,
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
            <label className={labelClass}>Photos ({images.length}/{MAX_PHOTOS})</label>
            <div
              className="w-full h-48 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[var(--color-brand)] transition-colors"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              {imagePreviews[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">📷</p>
                  <p className="text-xs text-[var(--color-muted)]">Click to upload up to {MAX_PHOTOS} photos</p>
                </div>
              )}
            </div>
            <input id="image-input" type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((src, i) => (
                  <div key={src} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("image-input")?.click()}
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] text-lg hover:border-[var(--color-brand)] transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            )}
          </div>
          {images.length > 0 && (
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
