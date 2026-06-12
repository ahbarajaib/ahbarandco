import { prisma } from "@/lib/prisma";

const FALLBACK_ASSETS: Record<string, Record<string, string>> = {
  home: {
    hero_bg: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2400&q=80",
    craft_image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
  },
  about: {
    about_hero: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80",
    about_craft: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  },
};

/**
 * Gets all PageAsset records as a key-value mapping of slot -> imageUrl for a given page.
 */
export async function getPageAssets(page: string): Promise<Record<string, string>> {
  const mapping: Record<string, string> = { ...(FALLBACK_ASSETS[page] || {}) };

  // Safety check for Next.js dev server hot-reload cache lag on schema generation
  if (!prisma.pageAsset) {
    console.warn(`Prisma model 'pageAsset' is not available yet. Falling back to default visuals.`);
    return mapping;
  }

  try {
    const assets = await prisma.pageAsset.findMany({
      where: { page },
    });

    for (const asset of assets) {
      mapping[asset.slot] = asset.imageUrl;
    }
  } catch (err) {
    console.error(`Failed to fetch page assets for page: ${page}:`, err);
  }

  return mapping;
}

/**
 * Gets a single asset URL for a given page and slot, defaulting to fallback if not found.
 */
export async function getPageAsset(page: string, slot: string): Promise<string> {
  const fallback = FALLBACK_ASSETS[page]?.[slot] || "";

  if (!prisma.pageAsset) {
    return fallback;
  }

  try {
    const asset = await prisma.pageAsset.findUnique({
      where: { page_slot: { page, slot } },
    });

    return asset?.imageUrl || fallback;
  } catch (err) {
    console.error(`Failed to fetch page asset for slot ${page}/${slot}:`, err);
    return fallback;
  }
}
