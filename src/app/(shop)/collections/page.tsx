import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Section } from "@/components/layout/section";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore Ahbar & Co. furniture collections.",
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { published: true },
    include: {
      products: {
        where: { published: true },
        select: { id: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Collections
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-10 sm:mt-12 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-16">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/${collection.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-background-secondary rounded-sm border border-border/10 shadow-2xs transition-shadow duration-300 group-hover:shadow-xs">
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-full w-full bg-background-secondary" />
              )}
            </div>
            
            <div className="mt-4 sm:mt-5">
              <h2 className="font-heading text-xl font-medium sm:text-2xl text-wood-dark group-hover:text-wood-medium transition-colors duration-300 leading-snug">
                {collection.name}
              </h2>
              <div className="mt-2.5 flex items-center justify-between border-t border-border/20 pt-2.5 text-[10px] font-bold tracking-widest text-text-secondary/70 uppercase">
                <span>
                  {collection.products.length} {collection.products.length === 1 ? "Product" : "Products"}
                </span>
                <span className="text-wood-medium/75 group-hover:text-wood-medium transition-colors duration-300">
                  Explore Collection &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
