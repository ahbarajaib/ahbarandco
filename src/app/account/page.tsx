import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
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

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <Section>
      <div className="max-w-3xl">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
          Account
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Signed in as {session.user.email}
        </p>

        <div className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-medium">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-text-secondary">You haven&apos;t placed any orders yet.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-text-secondary">
                      {order.status} · {formatPrice(order.total, order.currency)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/orders/${order.orderNumber}`} />}
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}
