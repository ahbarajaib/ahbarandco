import type { Metadata } from "next";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse handcrafted minimalist modern furniture by Ahbar & Co.",
};

export default async function ShopPage() {
  const products = await getPublishedProducts();

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Shop
      </h1>
      <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base md:text-lg">
        Handcrafted furniture designed for calm and intentional spaces.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-text-secondary">
          Products coming soon. Run <code className="text-sm">npm run db:seed</code>{" "}
          after starting the database.
        </p>
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
