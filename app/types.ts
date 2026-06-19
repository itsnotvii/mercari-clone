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