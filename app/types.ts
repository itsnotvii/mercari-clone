export interface Listing {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  image: string;
  seller: string;
  likes: number;
  description?: string;
}

export interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}