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
    orderBy: { sortOrder: "asc" },
  });

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Collections
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-2">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/${collection.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-background-secondary rounded-sm border border-border/10">
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-full w-full bg-background-secondary" />
              )}
            </div>
            <h2 className="mt-3 font-heading text-xl font-medium sm:mt-4 sm:text-2xl text-wood-dark group-hover:text-wood-medium transition-colors">
              {collection.name}
            </h2>
          </Link>
        ))}
      </div>
    </Section>
  );
}
