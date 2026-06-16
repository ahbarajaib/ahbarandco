import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { prisma } from "@/lib/prisma";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findFirst({
    where: { slug, published: true },
  });

  if (!collection) {
    return {};
  }

  return {
    title: collection.name,
    description: collection.description || `Explore ${collection.name} by Ahbar & Co.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const collection = await prisma.collection.findFirst({
    where: { slug, published: true },
    include: {
      products: {
        where: { published: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          collection: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        {collection.name}
      </h1>
      {collection.description && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base md:text-lg">
          {collection.description}
        </p>
      )}

      {collection.products.length === 0 ? (
        <p className="mt-10 text-text-secondary">Products coming soon. Please check back later.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
