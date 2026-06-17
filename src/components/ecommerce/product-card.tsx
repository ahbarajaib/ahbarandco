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
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary rounded-sm border border-border/10 shadow-2xs transition-shadow duration-300 group-hover:shadow-xs">
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center rounded-xs bg-wood-dark px-2 py-0.5 text-[9px] font-bold tracking-widest text-background-primary uppercase shadow-sm">
              Sale
            </span>
          </div>
        )}

        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-secondary/70 bg-stone-50 font-medium">
            No image
          </div>
        )}
        
        {/* Premium Overlay indicator */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-wood-dark/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-center pointer-events-none">
          <span className="text-[9px] font-bold uppercase tracking-widest text-background-primary bg-wood-dark/85 backdrop-blur-xs py-1.5 px-3 rounded-xs shadow-xs">
            Explore Product
          </span>
        </div>
      </div>
      
      <div className="mt-3.5 space-y-1">
        {product.collection ? (
          <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary/80 font-semibold">
            {product.collection.name}
          </p>
        ) : (
          <p className="text-[10px] uppercase tracking-[0.15em] text-transparent select-none font-semibold">
            Collection
          </p>
        )}
        
        <h3 className="font-heading text-base font-medium text-wood-dark group-hover:text-wood-medium transition-colors duration-300 leading-snug line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 pt-0.5">
          <span className="font-heading text-sm font-medium text-wood-medium">
            {formatPrice(product.price, product.currency)}
          </span>
          {isOnSale && (
            <span className="text-[11px] line-through text-text-secondary/70">
              {formatPrice(product.compareAtPrice!, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
