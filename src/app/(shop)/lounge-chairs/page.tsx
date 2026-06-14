import type { Metadata } from "next";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { getProductsByCollectionSlug } from "@/lib/products";

export const metadata: Metadata = {
  title: "Lounge Chairs",
  description:
    "Premium lounge chairs with solid wood frames, timeless design, and fine materials.",
};

export default async function LoungeChairsPage() {
  const products = await getProductsByCollectionSlug("lounge-chairs");

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Lounge Chairs
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base md:text-lg">
        Comfortable lounge chairs with solid wood frames and natural upholstery
        for modern living spaces.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-text-secondary">Collection coming soon.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
