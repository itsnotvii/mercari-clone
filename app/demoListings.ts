import { Listing } from "./types";

// Shown on the home feed and hero banner only when the real `listings` table
// has no rows yet (fresh Supabase project, no sellers signed up), so the
// storefront never looks empty. Negative ids mark these as placeholders.
// They ARE clickable — the listing detail page and seller profile page both
// recognize negative ids / demo usernames and render from this file instead
// of querying Supabase, so purchase/offer flows never touch real money or
// real data for a listing that doesn't actually exist.

export type DemoReview = {
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
};

export type DemoSeller = {
  username: string;
  bio: string;
  memberSince: string;
  rating: number;
  reviews: DemoReview[];
};

export type DemoListing = Listing & {
  images: string[];
};

export const demoListings: DemoListing[] = [
  {
    id: -1, title: "Nike Air Force 1", price: 85, category: "Sneakers", condition: "Like New",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800",
    ],
    seller: "jordan23", likes: 24,
    description: "Classic white-on-white Air Force 1s, worn a handful of times. No box.",
  },
  {
    id: -2, title: "Sony WH-1000XM4 Headphones", price: 180, category: "Electronics", condition: "Good",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    ],
    seller: "techseller", likes: 41,
    description: "Industry-leading noise cancelling, comes with case and cable.",
  },
  {
    id: -3, title: "Vintage Levi's Jacket", price: 65, category: "Clothing", condition: "Good",
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800",
    ],
    seller: "vintagevibe", likes: 18,
    description: "90s wash denim trucker jacket, men's medium.",
  },
  {
    id: -4, title: "iPad Pro 11-inch", price: 550, category: "Electronics", condition: "Like New",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800",
    ],
    seller: "appleguy", likes: 63,
    description: "M2 chip, 256GB, includes Apple Pencil (2nd gen).",
  },
  {
    id: -5, title: "Canon EOS R50 Camera", price: 420, category: "Electronics", condition: "Like New",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    ],
    seller: "photopro", likes: 37,
    description: "Mirrorless body with 18-45mm kit lens, low shutter count.",
  },
  {
    id: -6, title: "Adidas Ultraboost 22", price: 95, category: "Sneakers", condition: "Good",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800",
    ],
    seller: "sneakerhead", likes: 29,
    description: "Size 10, great cushioning left, minor sole wear.",
  },
  {
    id: -7, title: "MacBook Air M2", price: 899, category: "Electronics", condition: "Like New",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
    ],
    seller: "applestore", likes: 88,
    description: "Midnight, 16GB/512GB, AppleCare+ until next year.",
  },
  {
    id: -8, title: "Polaroid Now Camera", price: 75, category: "Electronics", condition: "New",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
      "https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?w=800",
    ],
    seller: "retroshop", likes: 15,
    description: "Sealed box, never opened. Comes with one film pack.",
  },
  {
    id: -9, title: "Supreme Box Logo Hoodie", price: 220, category: "Clothing", condition: "Good",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
    ],
    seller: "streetwear", likes: 52,
    description: "Size L, a couple seasons old, still holds shape well.",
  },
  {
    id: -10, title: "Dyson V11 Vacuum", price: 280, category: "Home", condition: "Good",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800",
    ],
    seller: "homegood", likes: 11,
    description: "Cordless stick vacuum, comes with two extra head attachments.",
  },
  {
    id: -11, title: "Nintendo Switch OLED", price: 290, category: "Gaming", condition: "Like New",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600",
    images: [
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    ],
    seller: "gamer99", likes: 74,
    description: "White model, dock and both Joy-Cons included.",
  },
  {
    id: -12, title: "Fjallraven Kanken Backpack", price: 55, category: "Bags", condition: "Good",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
    ],
    seller: "outdoorsy", likes: 33,
    description: "Classic 16L in navy, straps and zippers all intact.",
  },
];

export const demoSellers: Record<string, DemoSeller> = {
  jordan23: {
    username: "jordan23", bio: "Sneakerhead selling from my personal collection. Everything authenticated.",
    memberSince: "March 2023", rating: 4.9,
    reviews: [
      { reviewer: "casey_m", rating: 5, comment: "Shoes were exactly as described, fast shipping!", date: "2 weeks ago" },
      { reviewer: "denim_dan", rating: 5, comment: "Great seller, would buy again.", date: "1 month ago" },
    ],
  },
  techseller: {
    username: "techseller", bio: "Refurbished electronics at fair prices. 5 years on the platform.",
    memberSince: "January 2021", rating: 4.8,
    reviews: [
      { reviewer: "audiofan22", rating: 5, comment: "Headphones work perfectly, well packaged.", date: "3 days ago" },
      { reviewer: "marcus_t", rating: 4, comment: "Good condition, a little more wear than expected but happy overall.", date: "2 weeks ago" },
    ],
  },
  vintagevibe: {
    username: "vintagevibe", bio: "Curating vintage denim and outerwear since 2019.",
    memberSince: "September 2019", rating: 4.7,
    reviews: [
      { reviewer: "retro_rae", rating: 5, comment: "Beautiful jacket, smells freshly cleaned.", date: "1 week ago" },
      { reviewer: "j_wilson", rating: 4, comment: "Runs a little small but great quality.", date: "1 month ago" },
    ],
  },
  appleguy: {
    username: "appleguy", bio: "Apple products only — always tested before shipping.",
    memberSince: "June 2022", rating: 5.0,
    reviews: [
      { reviewer: "studentlife", rating: 5, comment: "iPad looked brand new, super fast shipping.", date: "4 days ago" },
      { reviewer: "designer_dee", rating: 5, comment: "Perfect transaction, highly recommend.", date: "3 weeks ago" },
    ],
  },
  photopro: {
    username: "photopro", bio: "Professional photographer selling gear I've upgraded from.",
    memberSince: "November 2020", rating: 4.9,
    reviews: [
      { reviewer: "shutterbug", rating: 5, comment: "Camera in fantastic shape, seller was very responsive.", date: "5 days ago" },
      { reviewer: "newbie_photog", rating: 5, comment: "Answered all my questions before I bought, great experience.", date: "2 months ago" },
    ],
  },
  sneakerhead: {
    username: "sneakerhead", bio: "Rotating my sneaker collection every season.",
    memberSince: "February 2022", rating: 4.6,
    reviews: [
      { reviewer: "runnerup", rating: 4, comment: "Shoes as pictured, shipping took a bit longer than expected.", date: "1 week ago" },
      { reviewer: "trackstar", rating: 5, comment: "Great price, would buy from again.", date: "1 month ago" },
    ],
  },
  applestore: {
    username: "applestore", bio: "Selling lightly used Apple devices with original accessories.",
    memberSince: "August 2021", rating: 4.8,
    reviews: [
      { reviewer: "codewitherin", rating: 5, comment: "MacBook runs like new, battery health was accurate.", date: "6 days ago" },
      { reviewer: "petra_l", rating: 4, comment: "Good laptop, minor scuff not mentioned in listing.", date: "3 weeks ago" },
    ],
  },
  retroshop: {
    username: "retroshop", bio: "Retro tech and cameras, all tested before listing.",
    memberSince: "May 2023", rating: 4.9,
    reviews: [
      { reviewer: "filmisnotdead", rating: 5, comment: "Works perfectly, exactly as advertised.", date: "2 weeks ago" },
      { reviewer: "grain_and_light", rating: 5, comment: "Fun little camera, seller shipped same day.", date: "1 month ago" },
    ],
  },
  streetwear: {
    username: "streetwear", bio: "Authenticated streetwear, no fakes ever.",
    memberSince: "January 2020", rating: 4.7,
    reviews: [
      { reviewer: "hypebeast22", rating: 5, comment: "Legit and in great shape, thank you!", date: "3 days ago" },
      { reviewer: "fitcheck", rating: 4, comment: "Good hoodie, sizing runs slightly large.", date: "1 month ago" },
    ],
  },
  homegood: {
    username: "homegood", bio: "Selling gently used home appliances that still have life left.",
    memberSince: "October 2022", rating: 4.5,
    reviews: [
      { reviewer: "cleanfreak", rating: 4, comment: "Works great, a bit more wear on the body than photos showed.", date: "1 week ago" },
      { reviewer: "apt_life", rating: 5, comment: "Suction is still strong, happy with the purchase.", date: "2 months ago" },
    ],
  },
  gamer99: {
    username: "gamer99", bio: "Selling consoles and games I've finished playing.",
    memberSince: "March 2021", rating: 4.8,
    reviews: [
      { reviewer: "pixelqueen", rating: 5, comment: "Console works perfectly, screen has no scratches.", date: "4 days ago" },
      { reviewer: "speedrunr", rating: 5, comment: "Fast responses and fair price.", date: "1 month ago" },
    ],
  },
  outdoorsy: {
    username: "outdoorsy", bio: "Downsizing my bag collection — all in great shape.",
    memberSince: "July 2022", rating: 4.6,
    reviews: [
      { reviewer: "trailmix", rating: 4, comment: "Bag is in good shape, one zipper is a little stiff.", date: "2 weeks ago" },
      { reviewer: "citywalker", rating: 5, comment: "Exactly as described, great everyday bag.", date: "1 month ago" },
    ],
  },
};

export function getDemoListingById(id: number): DemoListing | undefined {
  return demoListings.find((l) => l.id === id);
}

export function getDemoSellerByUsername(username: string): DemoSeller | undefined {
  return demoSellers[username];
}
