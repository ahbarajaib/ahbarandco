import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://ahbarandco.com";

  let productUrls: MetadataRoute.Sitemap = [];
  let postUrls: MetadataRoute.Sitemap = [];

  try {
    // Fetch published products
    const products = await prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    productUrls = products.map((product) => ({
      url: `${domain}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Sitemap product generation failed:", err);
  }

  try {
    // Fetch published journal posts
    const posts = await prisma.journalPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, createdAt: true },
    });

    postUrls = posts.map((post) => ({
      url: `${domain}/journal/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Sitemap journal generation failed:", err);
  }

  // Static site routes
  const staticRoutes = [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${domain}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${domain}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${domain}/journal`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${domain}/floating-shelves`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${domain}/lounge-chairs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...productUrls, ...postUrls];
}
