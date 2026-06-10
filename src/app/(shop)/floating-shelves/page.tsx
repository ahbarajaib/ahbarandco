import type { Metadata } from "next";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { getProductsByCollectionSlug } from "@/lib/products";

export const metadata: Metadata = {
  title: "Floating Shelves",
  description:
    "Handcrafted floating shelves in warm walnut and oak. Minimalist modern design for intentional spaces.",
};

export default async function FloatingShelvesPage() {
  const products = await getProductsByCollectionSlug("floating-shelves");

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Floating Shelves
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base md:text-lg">
        Wall-mounted shelves crafted from solid walnut with clean lines and
        invisible mounting hardware.
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
