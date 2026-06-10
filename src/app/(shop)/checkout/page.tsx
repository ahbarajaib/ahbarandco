import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RazorpayCheckout } from "@/components/ecommerce/razorpay-checkout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { getCartWithProducts } from "@/lib/cart-actions";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cartItems = await getCartWithProducts();
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 500000 ? 0 : 150000;
  const total = subtotal + shipping;

  return (
    <Section variant="surface">
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Checkout
      </h1>
      <p className="mt-3 text-sm text-text-secondary sm:text-base">
        Signed in as {session.user.email}. Complete your purchase securely with
        Razorpay.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div>
          <h2 className="font-heading text-xl font-medium">Items</h2>
          <ul className="mt-4 divide-y divide-border">
            {cartItems.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-4 py-4 text-sm sm:text-base"
              >
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  {formatPrice(
                    item.product.price * item.quantity,
                    item.product.currency
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit border border-border bg-background-primary p-6">
          <h2 className="font-heading text-xl font-medium">Payment</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-6">
            <RazorpayCheckout />
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full"
            render={<Link href="/cart" />}
          >
            Back to Cart
          </Button>
        </aside>
      </div>
    </Section>
  );
}
