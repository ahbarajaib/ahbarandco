import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/products";
import type { Product, ProductImage } from "@/types";

type ProductCardProps = {
  product: Product & {
    images: ProductImage[];
    collection?: { name: string } | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            No image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-wood-dark/0 p-4 transition-colors group-hover:bg-wood-dark/5">
          <span className="text-xs font-medium uppercase tracking-widest text-wood-medium opacity-0 transition-opacity group-hover:opacity-100">
            Quick View
          </span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        {product.collection && (
          <p className="text-xs uppercase tracking-widest text-text-secondary">
            {product.collection.name}
          </p>
        )}
        <h3 className="mt-1 font-heading text-lg font-medium sm:text-xl">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-text-secondary sm:text-base">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
