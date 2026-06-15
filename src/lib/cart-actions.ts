"use server";

import { revalidatePath } from "next/cache";

import { addToCart, clearCart, getCart, updateCartItem } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export async function addProductToCart(productId: string, quantity = 1, variantId?: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, published: true },
    include: { variants: true },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      return { error: "Product variant not found." };
    }
  }

  await addToCart(productId, quantity, variantId);
  revalidatePath("/cart");
  revalidatePath("/shop");
  return { success: true };
}

export async function updateProductInCart(productId: string, quantity: number, variantId?: string) {
  try {
    await updateCartItem(productId, quantity, variantId);
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("updateProductInCart error:", error);
    return { error: "Failed to update quantity." };
  }
}

export async function removeProductFromCart(productId: string, variantId?: string) {
  try {
    await updateCartItem(productId, 0, variantId);
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("removeProductFromCart error:", error);
    return { error: "Failed to remove item." };
  }
}

export async function getCartWithProducts() {
  const cart = await getCart();
  if (cart.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      id: { in: cart.map((item) => item.productId) },
      published: true,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  return cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null;

      return { ...item, product, variant };
    })
    .filter(Boolean) as Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    product: (typeof products)[number];
    variant: (typeof products)[number]["variants"][number] | null;
  }>;
}

export async function emptyCart() {
  await clearCart();
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
