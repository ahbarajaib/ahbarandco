"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  activeVariantId?: string | null;
};

export function ProductGallery({ images, productName, activeVariantId }: ProductGalleryProps) {
  // Filter images dynamically: show base images and images matching activeVariantId if set
  const filteredImages = activeVariantId
    ? images.filter((img) => !img.variantId || img.variantId === activeVariantId)
    : images;

  const [prevVariantId, setPrevVariantId] = useState(activeVariantId);
  const [activeIndex, setActiveIndex] = useState(0);

  if (activeVariantId !== prevVariantId) {
    setPrevVariantId(activeVariantId);
    setActiveIndex(0);
  }

  // Safe check to ensure we don't index out of bounds
  const currentIndex = activeIndex >= filteredImages.length ? 0 : activeIndex;
  const activeImage = filteredImages[currentIndex];

  if (!activeImage) {
    return (
      <div className="aspect-[4/5] w-full bg-background-secondary sm:aspect-square" />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-background-secondary sm:aspect-square">
        <Image
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.alt ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
        />
      </div>

      {filteredImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
          {filteredImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden bg-background-secondary ring-1 ring-transparent transition-all",
                currentIndex === index
                  ? "ring-wood-medium"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${productName} view ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
