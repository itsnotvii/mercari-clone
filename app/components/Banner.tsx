"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { demoListings } from "../demoListings";

type ListingSlide = {
  type: "listing";
  key: string;
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  category: string;
  condition: string;
};

type PromoSlide = {
  type: "promo";
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
};

type Slide = ListingSlide | PromoSlide;

const promoSlides: PromoSlide[] = [
  {
    type: "promo",
    key: "promo-sale",
    eyebrow: "🔥 Weekend Sale",
    title: "Up to 40% off select items",
    subtitle: "Deals refresh every weekend — don't miss out",
    cta: "Shop the sale",
    href: "/",
    gradient: "linear-gradient(135deg, #ff3b3b, #ff6b35)",
  },
  {
    type: "promo",
    key: "promo-arrivals",
    eyebrow: "✨ New Arrivals Daily",
    title: "Fresh finds added every day",
    subtitle: "Be the first to grab the newest listings",
    cta: "Browse new arrivals",
    href: "/",
    gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
  },
  {
    type: "promo",
    key: "promo-sell",
    eyebrow: "💰 Turn clutter into cash",
    title: "List your first item in minutes",
    subtitle: "Snap a photo — our AI writes the listing for you",
    cta: "Start selling",
    href: "/sell",
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899)",
  },
];

export default function Banner() {
  const [listings, setListings] = useState<ListingSlide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, image_url, category, condition")
        .eq("sold", false)
        .order("likes", { ascending: false })
        .limit(3);
      if (data && data.length > 0) {
        setListings(data.map((l) => ({ type: "listing" as const, key: `listing-${l.id}`, ...l })));
      } else {
        const topDemo = [...demoListings].sort((a, b) => b.likes - a.likes).slice(0, 3);
        setListings(topDemo.map((l) => ({
          type: "listing" as const,
          key: `demo-${l.id}`,
          id: l.id,
          title: l.title,
          price: l.price,
          image_url: l.image,
          category: l.category,
          condition: l.condition,
        })));
      }
    }
    fetchFeatured();
  }, []);

  const slides: Slide[] = [promoSlides[0], ...listings, promoSlides[1], promoSlides[2]];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  const goTo = (i: number) => setCurrent(((i % slides.length) + slides.length) % slides.length);
  const isDemoListing = slide.type === "listing" && slide.id < 0;

  const slideContent =
    slide.type === "listing" ? (
      <div className="relative w-full h-full">
        <Image
          src={slide.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200"}
          alt={slide.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-10 sm:px-16 max-w-2xl">
          <span className="text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block w-fit bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] text-white shadow-[var(--shadow-glow-brand-sm)]">
            ⭐ {isDemoListing ? "Demo · Featured" : "Featured"}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 leading-tight tracking-tight">
            {slide.title}
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-5">{slide.condition} · {slide.category}</p>
          <p className="text-4xl sm:text-5xl font-black text-white">${slide.price}</p>
        </div>
      </div>
    ) : (
      <div className="relative w-full h-full flex items-center" style={{ background: slide.gradient }}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 0, transparent 45%), radial-gradient(circle at 85% 75%, #fff 0, transparent 40%)" }} />
        <div className="relative px-10 sm:px-16 max-w-2xl">
          <span className="text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block w-fit bg-white/20 text-white backdrop-blur-sm">
            {slide.eyebrow}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
            {slide.title}
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-6">{slide.subtitle}</p>
          <span className="inline-flex items-center gap-2 bg-white text-[#1a1a1a] font-bold text-sm px-6 py-3 rounded-full transition-transform group-hover:scale-105">
            {slide.cta} →
          </span>
        </div>
      </div>
    );

  return (
    <div className="relative w-full h-[52vh] min-h-[400px] max-h-[600px] overflow-hidden group">
      <Link href={slide.type === "listing" ? `/listings/${slide.id}` : slide.href} className="block w-full h-full no-underline">
        {slideContent}
      </Link>

      {/* Dots */}
      <div className="absolute bottom-6 left-10 sm:left-16 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.key}
            onClick={(e) => { e.preventDefault(); goTo(i); }}
            className="h-2 rounded-full transition-all"
            style={{
              background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
              width: i === current ? "24px" : "8px",
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={(e) => { e.preventDefault(); goTo(current - 1); }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-10"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.preventDefault(); goTo(current + 1); }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-10"
      >
        ›
      </button>
    </div>
  );
}
