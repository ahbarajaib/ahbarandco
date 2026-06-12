import { prisma } from "@/lib/prisma";

export async function getPublishedProducts() {
  return prisma.product.findMany({
    where: { published: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      collection: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { published: true, featured: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      collection: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductsByCollectionSlug(slug: string) {
  return prisma.product.findMany({
    where: {
      published: true,
      collection: { slug, published: true },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      collection: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      collection: true,
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  collectionId: string | null,
  limit = 4
) {
  return prisma.product.findMany({
    where: {
      published: true,
      id: { not: productId },
      ...(collectionId ? { collectionId } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export { formatPrice } from "./utils";
