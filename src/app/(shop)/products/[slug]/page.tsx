import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/ecommerce/product-card";
import { ProductDetails } from "@/components/ecommerce/product-details";
import { Section } from "@/components/layout/section";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDesc ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(
    product.id,
    product.collectionId,
    4
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img) => img.url),
    "description": product.description || product.shortDesc || undefined,
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://ahbarandco.com"}/products/${product.slug}`,
      "priceCurrency": product.currency,
      "price": (product.price / 100).toFixed(2),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.material ? { "material": product.material } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section variant="surface">
        <ProductDetails product={product} />
      </Section>

      {(product.description || product.careGuide) && (
        <Section>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {product.description && (
              <div>
                <h2 className="font-heading text-2xl font-medium sm:text-3xl">
                  Description
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-text-secondary">
                  {product.description}
                </p>
              </div>
            )}
            {product.careGuide && (
              <div>
                <h2 className="font-heading text-2xl font-medium sm:text-3xl">
                  Care Guide
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-text-secondary">
                  {product.careGuide}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section variant="secondary">
          <h2 className="font-heading text-2xl font-medium sm:text-3xl">
            Related Products
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
