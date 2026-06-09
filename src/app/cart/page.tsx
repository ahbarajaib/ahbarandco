import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CartItemControls } from "@/components/ecommerce/cart-item-controls";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { getCartWithProducts } from "@/lib/cart-actions";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const cartItems = await getCartWithProducts();
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="mt-10">
          <p className="text-text-secondary">Your cart is empty.</p>
          <Button className="mt-6" render={<Link href="/shop" />}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
          <ul className="divide-y divide-border">
            {cartItems.map((item) => {
              const image = item.product.images[0];
              return (
                <li
                  key={item.productId}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
                >
                  <div className="relative aspect-square w-full max-w-[120px] overflow-hidden bg-background-secondary">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.alt ?? item.product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-heading text-lg font-medium hover:text-wood-medium"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                    <div className="mt-4">
                      <CartItemControls
                        productId={item.productId}
                        quantity={item.quantity}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium sm:text-base">
                    {formatPrice(
                      item.product.price * item.quantity,
                      item.product.currency
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border border-border bg-surface p-6">
            <h2 className="font-heading text-xl font-medium">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Shipping calculated at checkout.
            </p>
            <Button
              size="lg"
              className="mt-6 h-12 w-full"
              render={<Link href="/checkout" />}
            >
              Proceed to Checkout
            </Button>
          </aside>
        </div>
      )}
    </Section>
  );
}
