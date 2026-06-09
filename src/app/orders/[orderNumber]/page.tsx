import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
};

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const { orderNumber } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  return (
    <Section>
      <div className="max-w-3xl">
        {success === "1" && (
          <p className="mb-6 rounded border border-wood-medium/20 bg-background-secondary px-4 py-3 text-sm text-wood-medium">
            Payment successful. Thank you for your order.
          </p>
        )}
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">
          Order {order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Status: {order.status}
        </p>

        <ul className="mt-8 divide-y divide-border border border-border">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-text-secondary">
                  Qty {item.quantity} · {formatPrice(item.unitPrice, order.currency)}
                </p>
              </div>
              <p className="text-sm font-medium sm:text-base">
                {formatPrice(item.unitPrice * item.quantity, order.currency)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 text-sm sm:text-base">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Shipping</span>
            <span>
              {order.shipping === 0
                ? "Free"
                : formatPrice(order.shipping, order.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>

        <Button className="mt-8" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>
    </Section>
  );
}
