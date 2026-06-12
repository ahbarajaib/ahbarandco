import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CheckoutForm } from "@/components/ecommerce/checkout-form";
import { Section } from "@/components/layout/section";
import { getCartWithProducts } from "@/lib/cart-actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const [cartItems, addresses] = await Promise.all([
    getCartWithProducts(),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

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
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Signed in as {session.user.email}. Complete your details and payment below.
        </p>

        <CheckoutForm
          cartItems={cartItems}
          addresses={addresses}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
        />
      </div>
    </Section>
  );
}
