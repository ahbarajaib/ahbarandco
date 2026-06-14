import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, X as XIcon } from "lucide-react";

import { AdBanner } from "@/components/ads/ad-banner";
import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Explore precision wood art and minimalist furniture by Ahbar & Co.",
};

type ShopPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const products = await getPublishedProducts(q);

  return (
    <Section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
            Shop
          </h1>
          <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
            Wood art and furniture engineered with precision, designed for calm and intentional spaces.
          </p>
        </div>

        {/* Premium Search Bar */}
        <form method="GET" action="/shop" className="relative w-full max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search catalog, materials, items..."
            className="h-10 w-full rounded-sm border border-border bg-white pl-10 pr-10 text-sm transition-all placeholder:text-text-secondary/40 outline-none hover:border-wood-medium/20 focus:border-wood-medium focus:ring-2 focus:ring-wood-medium/10"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary/50">
            <SearchIcon className="h-4 w-4 stroke-[1.5]" />
          </div>
          {q && (
            <Link
              href="/shop"
              className="absolute inset-y-0 right-3 flex items-center text-text-secondary/60 hover:text-wood-dark transition-colors"
              title="Clear search"
            >
              <XIcon className="h-4 w-4 stroke-[1.5]" />
            </Link>
          )}
        </form>
      </div>

      <AdBanner slotId="shop-listing-top-ad" />

      {products.length === 0 ? (
        <div className="mt-10 py-10 text-center border border-dashed border-border/80 rounded-sm bg-white p-6 space-y-4">
          <p className="text-text-secondary text-sm">
            {q
              ? `No products found matching "${q}".`
              : "Products coming soon. Please check back later."}
          </p>
          {q && (
            <Link
              href="/shop"
              className="inline-block h-10 px-5 border border-border hover:bg-background-secondary text-text-primary transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer py-2.5"
            >
              Clear Search & View All
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
