import { cookies } from "next/headers";

export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_COOKIE = "ahbar_cart";

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCart(items: CartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function addToCart(productId: string, quantity = 1) {
  const cart = await getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  await setCart(cart);
  return cart;
}

export async function updateCartItem(productId: string, quantity: number) {
  const cart = await getCart();
  const next =
    quantity <= 0
      ? cart.filter((item) => item.productId !== productId)
      : cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );

  await setCart(next);
  return next;
}

export async function clearCart() {
  await setCart([]);
}
