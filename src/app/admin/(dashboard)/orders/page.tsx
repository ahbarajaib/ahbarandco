import { prisma } from "@/lib/prisma";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-medium text-wood-dark">
          Order Management
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Review purchase transactions, check Razorpay details, and update shipping fulfillment.
        </p>
      </div>

      <AdminOrdersList orders={orders} />
    </div>
  );
}
