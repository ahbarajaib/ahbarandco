import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CancelOrderButton } from "@/components/ecommerce/cancel-order-button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
};

type ShippingAddressSnapshot = {
  title?: string | null;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const metadata: Metadata = {
  title: "Order Details — Ahbar & Co.",
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

  const shippingAddr = order.shippingAddress as ShippingAddressSnapshot | null;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-zinc-50 text-zinc-800 border-zinc-200";
    }
  };

  return (
    <Section variant="surface">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner for payment success redirect */}
        {success === "1" && (
          <div className="rounded border border-emerald-200 bg-emerald-50/50 px-4 py-3.5 text-sm text-emerald-800 animate-reveal">
            ✨ Payment completed successfully! Thank you for purchasing from Ahbar & Co.
          </div>
        )}

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 gap-4">
          <div>
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Placed on {orderDate}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider border rounded-full ${getStatusStyle(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Products & Costs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products Card */}
            <div className="rounded-sm border border-border bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-heading text-xl font-medium border-b border-border/50 pb-2">
                Items Ordered
              </h2>
              <ul className="divide-y divide-border/60">
                {order.items.map((item) => {
                  const image = item.product.images[0];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        {image ? (
                          <img
                            src={image.url}
                            alt={image.alt || item.product.name}
                            className="size-16 object-cover bg-background-secondary border border-border/40"
                          />
                        ) : (
                          <div className="size-16 bg-background-secondary border border-border/40 flex items-center justify-center text-xs text-text-secondary">
                            No Image
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Qty {item.quantity} · {formatPrice(item.unitPrice, order.currency)} each
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.unitPrice * item.quantity, order.currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Totals Table */}
            <div className="rounded-sm border border-border bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-medium border-b border-border/50 pb-2 mb-4">
                Cost Breakdown
              </h2>
              <div className="space-y-3 text-sm">
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
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.total, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Shipping Address & Payments */}
          <div className="space-y-6">
            {/* Shipping Address Card */}
            <div className="rounded-sm border border-border bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-heading text-xl font-medium border-b border-border/50 pb-2">
                Shipping Address
              </h2>
              {shippingAddr ? (
                <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-sm text-foreground mb-1">
                    {shippingAddr.fullName}
                  </p>
                  <p>{shippingAddr.street}</p>
                  {shippingAddr.apartment && <p>{shippingAddr.apartment}</p>}
                  <p>
                    {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postalCode}
                  </p>
                  <p className="font-medium text-wood-dark">Country: {shippingAddr.country}</p>
                  <p className="pt-1 font-medium text-foreground">
                    Phone: +91 {shippingAddr.phone}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-secondary italic">
                  No shipping address snapshot available.
                </p>
              )}
            </div>

            {/* Payment Details Card */}
            <div className="rounded-sm border border-border bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-heading text-xl font-medium border-b border-border/50 pb-2">
                Payment Details
              </h2>
              <div className="text-xs text-text-secondary space-y-2">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-medium text-foreground">Razorpay Checkout</span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between gap-2">
                    <span>Order ID</span>
                    <span className="font-mono text-foreground select-all text-[10px]">
                      {order.razorpayOrderId}
                    </span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="flex justify-between gap-2">
                    <span>Payment ID</span>
                    <span className="font-mono text-foreground select-all text-[10px]">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/40 pt-2">
                  <span>Status</span>
                  <span className="font-semibold text-foreground">
                    {order.status === "PAID" ? "Completed" : order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/60 pt-6">
          <Button render={<Link href="/shop" />} className="h-10 text-xs font-semibold uppercase tracking-wider">
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            render={<Link href="/account" />}
            className="h-10 text-xs font-semibold uppercase tracking-wider"
          >
            My Account
          </Button>
          {order.status === "PENDING" && (
            <CancelOrderButton orderNumber={order.orderNumber} />
          )}
        </div>
      </div>
    </Section>
  );
}
