export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc?: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  collectionId: string | null;
  material: string | null;
  dimensions: string | null;
  careGuide?: string | null;
  stock?: number;
  images: ProductImage[];
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type JournalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};
