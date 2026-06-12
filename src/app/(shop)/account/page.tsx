import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { AddressManager } from "@/components/ecommerce/address-manager";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <Section>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
          Account
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Signed in as {session.user.email}
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          {/* Orders Section */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading text-2xl font-medium">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-text-secondary text-sm">You haven&apos;t placed any orders yet.</p>
            ) : (
              <ul className="divide-y divide-border border border-border">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base">{order.orderNumber}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Status: <span className="font-medium text-foreground">{order.status}</span> · Total: {formatPrice(order.total, order.currency)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/orders/${order.orderNumber}`} />}
                    >
                      View Receipt
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Saved Addresses Section */}
          <div className="lg:col-span-1 border-t border-border pt-8 lg:border-t-0 lg:pt-0">
            <AddressManager addresses={addresses} />
          </div>
        </div>
      </div>
    </Section>
  );
}
