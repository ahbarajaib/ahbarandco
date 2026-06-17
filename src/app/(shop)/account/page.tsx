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
        <div className="border-b border-border pb-8 mb-12">
          <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl text-wood-dark tracking-wide">
            Account
          </h1>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Signed in as <span className="text-text-primary font-medium">{session.user.email}</span>
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Orders Section */}
          <div className="lg:col-span-3 space-y-5">
            <h2 className="font-heading text-xl sm:text-2xl font-medium text-wood-dark">Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border p-8 text-center bg-wood-medium/[0.02]">
                <p className="text-text-secondary text-sm">You haven&apos;t placed any orders yet.</p>
              </div>
            ) : (
              <div className="rounded-sm border border-border bg-white shadow-sm overflow-hidden">
                <ul className="divide-y divide-border">
                  {orders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-background-primary/20 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-wood-dark tracking-wide">
                          {order.orderNumber}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-text-secondary">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-border/60">•</span>
                          <span>
                            Total: <span className="font-medium text-text-primary">{formatPrice(order.total, order.currency)}</span>
                          </span>
                          <span className="text-border/60">•</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase border ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : order.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-background-secondary text-text-secondary border-border"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/orders/${order.orderNumber}`} />}
                        className="text-[10px] uppercase tracking-wider font-semibold hover:bg-wood-medium hover:text-white transition-all w-full sm:w-auto text-center"
                      >
                        View Receipt
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Saved Addresses Section */}
          <div className="lg:col-span-2 border-t border-border pt-8 lg:border-t-0 lg:pt-0">
            <AddressManager addresses={addresses} />
          </div>
        </div>
      </div>
    </Section>
  );
}
