import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/ecommerce/add-to-cart-form";
import { ProductCard } from "@/components/ecommerce/product-card";
import { ProductGallery } from "@/components/ecommerce/product-gallery";
import { Section } from "@/components/layout/section";
import {
  formatPrice,
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

  return (
    <>
      <Section variant="surface">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="flex flex-col">
            {product.collection && (
              <Link
                href={`/${product.collection.slug}`}
                className="text-xs font-medium uppercase tracking-widest text-wood-medium hover:underline"
              >
                {product.collection.name}
              </Link>
            )}
            <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-xl text-text-primary sm:text-2xl">
              {formatPrice(product.price, product.currency)}
            </p>
            {product.shortDesc && (
              <p className="mt-6 text-base leading-relaxed text-text-secondary sm:text-lg">
                {product.shortDesc}
              </p>
            )}

            <dl className="mt-8 space-y-4 border-t border-border pt-8 text-sm sm:text-base">
              {product.material && (
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="text-text-secondary">Material</dt>
                  <dd>{product.material}</dd>
                </div>
              )}
              {product.dimensions && (
                <div className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="text-text-secondary">Dimensions</dt>
                  <dd>{product.dimensions}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8">
              <AddToCartForm
                productId={product.id}
                inStock={product.stock > 0}
              />
            </div>
          </div>
        </div>
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
