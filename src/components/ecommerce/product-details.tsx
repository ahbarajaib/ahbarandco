"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductGallery } from "@/components/ecommerce/product-gallery";
import { AddToCartForm } from "@/components/ecommerce/add-to-cart-form";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Set default variant if variants exist
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants && product.variants ? product.variants[0] : null
  );

  // Dynamic values based on variant selection or base product fallback
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeCompareAtPrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : (product.stock ?? 0) > 0;
  const activeVariantId = selectedVariant ? selectedVariant.id : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      {/* Left Column: Swappable Image Gallery */}
      <ProductGallery
        images={product.images}
        productName={product.name}
        activeVariantId={activeVariantId}
      />

      {/* Right Column: Info & Actions */}
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

        {/* Pricing & Shipping Section */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-xl font-medium text-text-primary sm:text-2xl">
              {formatPrice(activePrice, product.currency)}
            </span>
            {activeCompareAtPrice && activeCompareAtPrice > activePrice && (
              <>
                <span className="text-sm line-through text-text-secondary sm:text-base">
                  {formatPrice(activeCompareAtPrice, product.currency)}
                </span>
                <span className="inline-flex items-center rounded-sm bg-wood-medium/10 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-wood-medium uppercase">
                  Save {Math.round(((activeCompareAtPrice - activePrice) / activeCompareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Shipping Cost Indicator */}
          <div>
            {!product.deliveryCost || product.deliveryCost === 0 ? (
              <span className="text-wood-medium text-[11px] font-semibold tracking-widest uppercase flex items-center gap-1.5 mt-1">
                COMPLIMENTARY SHIPPING
              </span>
            ) : (
              <span className="text-text-secondary text-xs font-medium tracking-wide">
                Shipping: {formatPrice(product.deliveryCost, product.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Variant Selector (e.g. Acacia vs Teak) */}
        {hasVariants && product.variants && (
          <div className="mt-6 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold block">
              Select Option
            </span>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`h-10 min-w-[90px] px-4 rounded-xs border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-wood-medium bg-background-secondary text-text-primary"
                        : "border-border text-text-secondary hover:border-wood-medium/40 hover:text-text-primary"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
            inStock={inStock}
            variantId={selectedVariant?.id}
          />
        </div>
      </div>
    </div>
  );
}
