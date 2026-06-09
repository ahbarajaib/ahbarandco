"use server";

import { revalidatePath } from "next/cache";

import { addToCart, clearCart, getCart, updateCartItem } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export async function addProductToCart(productId: string, quantity = 1) {
  const product = await prisma.product.findFirst({
    where: { id: productId, published: true },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  await addToCart(productId, quantity);
  revalidatePath("/cart");
  revalidatePath("/shop");
  return { success: true };
}

export async function updateProductInCart(productId: string, quantity: number) {
  await updateCartItem(productId, quantity);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { success: true };
}

export async function removeProductFromCart(productId: string) {
  await updateCartItem(productId, 0);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { success: true };
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
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    product: (typeof products)[number];
  }>;
}

export async function emptyCart() {
  await clearCart();
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
