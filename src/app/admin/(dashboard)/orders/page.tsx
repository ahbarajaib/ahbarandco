import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

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

      <div className="overflow-x-auto rounded-sm border border-border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-text-primary">
          <thead className="bg-background-secondary font-medium uppercase tracking-wider text-[10px] text-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4">Order Details</th>
              <th scope="col" className="px-6 py-4">Customer</th>
              <th scope="col" className="px-6 py-4">Line Items</th>
              <th scope="col" className="px-6 py-4">Total</th>
              <th scope="col" className="px-6 py-4">Payment Ref</th>
              <th scope="col" className="px-6 py-4">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-t border-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">
                  No orders have been placed yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-background-primary/30 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="font-semibold text-text-primary text-sm">
                      #{order.orderNumber}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{order.user.name || "Guest User"}</div>
                    <div className="text-xs text-text-secondary">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <ul className="space-y-1 text-xs text-text-secondary">
                      {order.items.map((item) => (
                        <li key={item.id} className="truncate">
                          <span className="font-semibold text-text-primary">{item.quantity}x</span> {item.product.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-semibold text-text-primary">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 text-xs text-text-secondary">
                    {order.razorpayOrderId ? (
                      <div className="font-mono">
                        <div className="text-text-primary">RPID: {order.razorpayOrderId}</div>
                        {order.razorpayPaymentId && (
                          <div className="text-[10px] mt-0.5">PayID: {order.razorpayPaymentId}</div>
                        )}
                      </div>
                    ) : (
                      <span className="italic">Manual / Local</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
