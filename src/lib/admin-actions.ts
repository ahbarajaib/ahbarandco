"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { ProductSchema, CollectionSchema, JournalPostSchema } from "@/lib/validations";
import { uploadImage, deleteImage } from "@/lib/storage";

// Ensure current user is an admin helper
async function ensureAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Access denied. Admin role required.");
  }
}

// Helper to generate a URL slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export type ActionResponse = {
  error?: string;
  success?: boolean;
};

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export async function loginAdmin(
  _prev: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Check user role in database before calling signIn
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "admin") {
    return { error: "Access denied. Only administrators are allowed." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // Let Next.js handle the redirect
  }

  return { success: true };
}

// ─── Products CRUD ───────────────────────────────────────────────────────────

export async function createProduct(formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const shortDesc = String(formData.get("shortDesc") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const material = String(formData.get("material") ?? "").trim() || null;
  const dimensions = String(formData.get("dimensions") ?? "").trim() || null;
  const careGuide = String(formData.get("careGuide") ?? "").trim() || null;
  const collectionId = String(formData.get("collectionId") ?? "") || null;

  const priceFloat = parseFloat(String(formData.get("price") ?? "0"));
  const compareAtPriceVal = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPriceFloat = compareAtPriceVal && !isNaN(parseFloat(compareAtPriceVal)) ? parseFloat(compareAtPriceVal) : null;
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const featured = formData.get("featured") === "true";
  const published = formData.get("published") === "true";

  // Upload new image files
  const files = (formData.getAll("imageFiles") as File[]).filter(f => f.size > 0);
  const uploadedUrls: string[] = [];
  try {
    for (const file of files) {
      const url = await uploadImage(file, "products");
      uploadedUrls.push(url);
    }
  } catch {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    return { error: "Failed to upload product images." };
  }

  // Get existing images (manually added external URLs or kept existing ones)
  const existingImages = formData.getAll("existingImages").map(val => String(val).trim()).filter(Boolean);
  const imageUrls = [...existingImages, ...uploadedUrls];

  const validation = ProductSchema.safeParse({
    name,
    shortDesc,
    description,
    price: priceFloat,
    compareAtPrice: compareAtPriceFloat,
    stock,
    material,
    dimensions,
    careGuide,
    featured,
    published,
    collectionId,
    images: imageUrls,
  });

  if (!validation.success) {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;
  const price = Math.round(validated.price * 100); // convert to paise
  const compareAtPrice = validated.compareAtPrice ? Math.round(validated.compareAtPrice * 100) : null;
  const productData = {
    name: validated.name,
    shortDesc: validated.shortDesc,
    description: validated.description,
    stock: validated.stock,
    material: validated.material,
    dimensions: validated.dimensions,
    careGuide: validated.careGuide,
    featured: validated.featured,
    published: validated.published,
    collectionId: validated.collectionId,
    compareAtPrice,
  };

  let slug = slugify(validated.name);
  // Ensure slug uniqueness
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.product.create({
      data: {
        ...productData,
        price,
        slug,
        images: {
          create: validated.images.map((url, index) => ({
            url,
            alt: `${validated.name} — view ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
    });

    revalidateProductPaths(slug);
    return { success: true };
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    console.error("Create Product Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product.";
    return { error: errorMessage };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const shortDesc = String(formData.get("shortDesc") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const material = String(formData.get("material") ?? "").trim() || null;
  const dimensions = String(formData.get("dimensions") ?? "").trim() || null;
  const careGuide = String(formData.get("careGuide") ?? "").trim() || null;
  const collectionId = String(formData.get("collectionId") ?? "") || null;

  const priceFloat = parseFloat(String(formData.get("price") ?? "0"));
  const compareAtPriceVal = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPriceFloat = compareAtPriceVal && !isNaN(parseFloat(compareAtPriceVal)) ? parseFloat(compareAtPriceVal) : null;
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10);
  const featured = formData.get("featured") === "true";
  const published = formData.get("published") === "true";

  // Upload new image files
  const files = (formData.getAll("imageFiles") as File[]).filter(f => f.size > 0);
  const uploadedUrls: string[] = [];
  try {
    for (const file of files) {
      const url = await uploadImage(file, "products");
      uploadedUrls.push(url);
    }
  } catch {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    return { error: "Failed to upload product images." };
  }

  // Get existing images from form
  const existingImages = formData.getAll("existingImages").map(val => String(val).trim()).filter(Boolean);
  const imageUrls = [...existingImages, ...uploadedUrls];

  const validation = ProductSchema.safeParse({
    name,
    shortDesc,
    description,
    price: priceFloat,
    compareAtPrice: compareAtPriceFloat,
    stock,
    material,
    dimensions,
    careGuide,
    featured,
    published,
    collectionId,
    images: imageUrls,
  });

  if (!validation.success) {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;
  const price = Math.round(validated.price * 100); // convert to paise
  const compareAtPrice = validated.compareAtPrice ? Math.round(validated.compareAtPrice * 100) : null;
  const productData = {
    name: validated.name,
    shortDesc: validated.shortDesc,
    description: validated.description,
    stock: validated.stock,
    material: validated.material,
    dimensions: validated.dimensions,
    careGuide: validated.careGuide,
    featured: validated.featured,
    published: validated.published,
    collectionId: validated.collectionId,
    compareAtPrice,
  };

  try {
    const originalProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!originalProduct) {
      for (const url of uploadedUrls) {
        await deleteImage(url);
      }
      return { error: "Product not found." };
    }

    // Keep original slug if name hasn't changed, otherwise create a new one
    let slug = originalProduct.slug;
    if (originalProduct.name !== validated.name) {
      slug = slugify(validated.name);
      const existing = await prisma.product.findFirst({ where: { slug, id: { not: id } } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Wrap in transaction to delete and recreate images clean
    await prisma.$transaction(async (tx) => {
      // Delete old images relation
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Update product details and create new images
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          price,
          slug,
          images: {
            create: validated.images.map((url, index) => ({
              url,
              alt: `${validated.name} — view ${index + 1}`,
              sortOrder: index,
            })),
          },
        },
      });
    });

    // Clean up physically deleted local images (original URLs not in existingImages)
    const originalUrls = originalProduct.images.map(img => img.url);
    const deletedUrls = originalUrls.filter(url => !existingImages.includes(url));
    for (const url of deletedUrls) {
      await deleteImage(url);
    }

    revalidateProductPaths(slug);
    if (originalProduct.slug !== slug) {
      revalidateProductPaths(originalProduct.slug);
    }

    return { success: true };
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteImage(url);
    }
    console.error("Update Product Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update product.";
    return { error: errorMessage };
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  await ensureAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });
    if (!product) {
      return { error: "Product not found." };
    }

    // Delete physical files
    for (const img of product.images) {
      await deleteImage(img.url);
    }

    await prisma.product.delete({ where: { id } });

    revalidateProductPaths(product.slug);
    return { success: true };
  } catch (error) {
    console.error("Delete Product Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete product.";
    return { error: errorMessage };
  }
}

function revalidateProductPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

// ─── Collections CRUD ────────────────────────────────────────────────────────

export async function createCollection(formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const published = formData.get("published") === "true";

  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const file = formData.get("imageUrl_file") as File | null;
  let uploadedUrl: string | null = null;

  if (file && file.size > 0) {
    try {
      uploadedUrl = await uploadImage(file, "collections");
      imageUrl = uploadedUrl;
    } catch {
      return { error: "Failed to upload collection cover image." };
    }
  }

  const validation = CollectionSchema.safeParse({
    name,
    description,
    imageUrl,
    sortOrder,
    published,
  });

  if (!validation.success) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;

  let slug = slugify(validated.name);
  const existing = await prisma.collection.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.collection.create({
      data: { ...validated, slug },
    });

    revalidateCollectionPaths(slug);
    return { success: true };
  } catch (error) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    console.error("Create Collection Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create collection.";
    return { error: errorMessage };
  }
}

export async function updateCollection(id: string, formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const published = formData.get("published") === "true";

  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  const original = await prisma.collection.findUnique({ where: { id } });
  if (!original) {
    return { error: "Collection not found." };
  }

  const file = formData.get("imageUrl_file") as File | null;
  let uploadedUrl: string | null = null;
  if (file && file.size > 0) {
    try {
      uploadedUrl = await uploadImage(file, "collections");
      imageUrl = uploadedUrl;
    } catch {
      return { error: "Failed to upload collection cover image." };
    }
  }

  const validation = CollectionSchema.safeParse({
    name,
    description,
    imageUrl,
    sortOrder,
    published,
  });

  if (!validation.success) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;

  try {
    let slug = original.slug;
    if (original.name !== validated.name) {
      slug = slugify(validated.name);
      const existing = await prisma.collection.findFirst({ where: { slug, id: { not: id } } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    if (original.imageUrl && original.imageUrl !== validated.imageUrl) {
      await deleteImage(original.imageUrl);
    }

    await prisma.collection.update({
      where: { id },
      data: { ...validated, slug },
    });

    revalidateCollectionPaths(slug);
    if (original.slug !== slug) {
      revalidateCollectionPaths(original.slug);
    }

    return { success: true };
  } catch (error) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    console.error("Update Collection Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update collection.";
    return { error: errorMessage };
  }
}

export async function deleteCollection(id: string): Promise<ActionResponse> {
  await ensureAdmin();

  try {
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      return { error: "Collection not found." };
    }

    if (collection.imageUrl) {
      await deleteImage(collection.imageUrl);
    }

    // Set referencing products collectionId to null first
    await prisma.product.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });

    await prisma.collection.delete({ where: { id } });

    revalidateCollectionPaths(collection.slug);
    return { success: true };
  } catch (error) {
    console.error("Delete Collection Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete collection.";
    return { error: errorMessage };
  }
}

function revalidateCollectionPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath(`/${slug}`); // URL SEO structure maps collections to root Level
  revalidatePath("/admin/collections");
}

// ─── Orders Management ───────────────────────────────────────────────────────

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResponse> {
  await ensureAdmin();

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { error: "Order not found." };
    }

    await prisma.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error("Update Order Status Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update order status.";
    return { error: errorMessage };
  }
}

// ─── Journal / Blog Posts CRUD ───────────────────────────────────────────────

export async function createJournalPost(formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "true";

  let coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim() || null;
  const file = formData.get("coverImageUrl_file") as File | null;
  let uploadedUrl: string | null = null;

  if (file && file.size > 0) {
    try {
      uploadedUrl = await uploadImage(file, "journal");
      coverImageUrl = uploadedUrl;
    } catch {
      return { error: "Failed to upload cover image." };
    }
  }

  const validation = JournalPostSchema.safeParse({
    title,
    excerpt,
    content,
    coverImageUrl,
    published,
  });

  if (!validation.success) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;

  let slug = slugify(validated.title);
  const existing = await prisma.journalPost.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.journalPost.create({
      data: {
        ...validated,
        slug,
        publishedAt: validated.published ? new Date() : null,
      },
    });

    revalidateJournalPaths(slug);
    return { success: true };
  } catch (error) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    console.error("Create Journal Post Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create journal post.";
    return { error: errorMessage };
  }
}

export async function updateJournalPost(id: string, formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "true";

  let coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim() || null;

  const original = await prisma.journalPost.findUnique({ where: { id } });
  if (!original) {
    return { error: "Journal post not found." };
  }

  const file = formData.get("coverImageUrl_file") as File | null;
  let uploadedUrl: string | null = null;
  if (file && file.size > 0) {
    try {
      uploadedUrl = await uploadImage(file, "journal");
      coverImageUrl = uploadedUrl;
    } catch {
      return { error: "Failed to upload cover image." };
    }
  }

  const validation = JournalPostSchema.safeParse({
    title,
    excerpt,
    content,
    coverImageUrl,
    published,
  });

  if (!validation.success) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;

  try {
    let slug = original.slug;
    if (original.title !== validated.title) {
      slug = slugify(validated.title);
      const existing = await prisma.journalPost.findFirst({ where: { slug, id: { not: id } } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const wasPublished = original.published;
    const publishedAt = validated.published ? (wasPublished ? original.publishedAt : new Date()) : null;

    if (original.coverImageUrl && original.coverImageUrl !== validated.coverImageUrl) {
      await deleteImage(original.coverImageUrl);
    }

    await prisma.journalPost.update({
      where: { id },
      data: {
        ...validated,
        slug,
        publishedAt,
      },
    });

    revalidateJournalPaths(slug);
    if (original.slug !== slug) {
      revalidateJournalPaths(original.slug);
    }

    return { success: true };
  } catch (error) {
    if (uploadedUrl) {
      await deleteImage(uploadedUrl);
    }
    console.error("Update Journal Post Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update journal post.";
    return { error: errorMessage };
  }
}

export async function deleteJournalPost(id: string): Promise<ActionResponse> {
  await ensureAdmin();

  try {
    const post = await prisma.journalPost.findUnique({ where: { id } });
    if (!post) {
      return { error: "Journal post not found." };
    }

    if (post.coverImageUrl) {
      await deleteImage(post.coverImageUrl);
    }

    await prisma.journalPost.delete({ where: { id } });

    revalidateJournalPaths(post.slug);
    return { success: true };
  } catch (error) {
    console.error("Delete Journal Post Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete journal post.";
    return { error: errorMessage };
  }
}

function revalidateJournalPaths(slug: string) {
  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);
  revalidatePath("/admin/journal");
}

// ─── Page Assets CMS ─────────────────────────────────────────────────────────

const PAGE_SLOTS: Record<string, string[]> = {
  home: ["hero_bg", "craft_image"],
  about: ["about_hero", "about_craft"],
};

export async function updatePageAssets(page: string, formData: FormData): Promise<ActionResponse> {
  await ensureAdmin();

  const slots = PAGE_SLOTS[page];
  if (!slots) {
    return { error: "Invalid page specified." };
  }

  try {
    for (const slot of slots) {
      const file = formData.get(`${slot}_file`) as File | null;
      let imageUrl = String(formData.get(slot) ?? "").trim();
      const existingAsset = await prisma.pageAsset.findUnique({
        where: { page_slot: { page, slot } },
      });

      if (file && file.size > 0) {
        if (existingAsset?.imageUrl) {
          await deleteImage(existingAsset.imageUrl);
        }
        imageUrl = await uploadImage(file, "pages");
      } else if (existingAsset && existingAsset.imageUrl !== imageUrl) {
        await deleteImage(existingAsset.imageUrl);
      }

      if (imageUrl) {
        await prisma.pageAsset.upsert({
          where: { page_slot: { page, slot } },
          update: { imageUrl },
          create: { page, slot, imageUrl },
        });
      } else if (existingAsset) {
        await prisma.pageAsset.delete({
          where: { page_slot: { page, slot } },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/pages");

    return { success: true };
  } catch (error) {
    console.error("Update Page Assets Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update page assets.";
    return { error: errorMessage };
  }
}
