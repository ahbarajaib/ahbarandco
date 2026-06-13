"use client";

import { useState } from "react";
import { OrderStatus } from "@/generated/prisma/client";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice } from "@/lib/utils";

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

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    name: string;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shippingAddress: unknown;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
  items: OrderItem[];
};

type AdminOrdersListProps = {
  orders: Order[];
};

export function AdminOrdersList({ orders }: AdminOrdersListProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  function toggleExpand(orderId: string) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-text-primary">
        <thead className="bg-background-secondary font-medium uppercase tracking-wider text-[10px] text-text-secondary select-none">
          <tr>
            <th scope="col" className="w-10 px-4 py-4"></th>
            <th scope="col" className="px-6 py-4">Order Details</th>
            <th scope="col" className="px-6 py-4">Customer</th>
            <th scope="col" className="px-6 py-4 text-center">Items Qty</th>
            <th scope="col" className="px-6 py-4">Total</th>
            <th scope="col" className="px-6 py-4">Fulfillment Status</th>
            <th scope="col" className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-text-secondary">
                No orders have been placed yet.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const shippingAddr = order.shippingAddress as ShippingAddressSnapshot | null;

              return (
                <React.Fragment key={order.id}>
                  {/* Master Row */}
                  <tr
                    className={`transition-colors hover:bg-background-primary/30 cursor-pointer ${
                      isExpanded ? "bg-background-primary/20" : ""
                    }`}
                    onClick={() => toggleExpand(order.id)}
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="text-text-secondary text-xs">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </td>
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
                    <td className="px-6 py-4 text-center font-medium">
                      {totalItemsCount} {totalItemsCount === 1 ? "unit" : "units"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-wood-medium hover:underline hover:text-wood-dark"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(order.id);
                        }}
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Detail Panel Row */}
                  {isExpanded && (
                    <tr className="bg-background-secondary/10 border-b border-border/80">
                      <td colSpan={7} className="p-6">
                        <div className="grid gap-6 md:grid-cols-3 text-xs text-text-secondary leading-relaxed">
                          
                          {/* Shipping Details */}
                          <div className="bg-white border border-border/60 p-4 rounded shadow-xs space-y-3">
                            <h4 className="font-heading text-sm font-semibold text-wood-dark border-b border-border pb-1.5 uppercase tracking-wider">
                              Fulfillment & Shipping
                            </h4>
                            {shippingAddr ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground text-sm mb-1">{shippingAddr.fullName}</p>
                                <p>{shippingAddr.street}</p>
                                {shippingAddr.apartment && <p>{shippingAddr.apartment}</p>}
                                <p>{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postalCode}</p>
                                <p className="font-medium text-wood-dark">Country: {shippingAddr.country}</p>
                                <p className="font-semibold text-foreground pt-1.5">Phone: +91 {shippingAddr.phone}</p>
                              </div>
                            ) : (
                              <p className="italic text-text-secondary">No shipping address recorded.</p>
                            )}
                          </div>

                          {/* Order Items List */}
                          <div className="bg-white border border-border/60 p-4 rounded shadow-xs space-y-3 md:col-span-2">
                            <h4 className="font-heading text-sm font-semibold text-wood-dark border-b border-border pb-1.5 uppercase tracking-wider">
                              Line Items Breakdown
                            </h4>
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-border/40 text-text-secondary font-medium">
                                  <th className="py-1">Product Name</th>
                                  <th className="py-1 text-center">Qty</th>
                                  <th className="py-1 text-right">Unit Price</th>
                                  <th className="py-1 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20">
                                {order.items.map((item) => (
                                  <tr key={item.id} className="text-text-primary">
                                    <td className="py-2">{item.product.name}</td>
                                    <td className="py-2 text-center font-medium">{item.quantity}</td>
                                    <td className="py-2 text-right">{formatPrice(item.unitPrice, order.currency)}</td>
                                    <td className="py-2 text-right font-semibold">{formatPrice(item.unitPrice * item.quantity, order.currency)}</td>
                                  </tr>
                                ))}
                                <tr className="font-medium border-t border-border/40 text-text-secondary">
                                  <td colSpan={3} className="pt-2">Subtotal</td>
                                  <td className="pt-2 text-right text-text-primary">{formatPrice(order.subtotal, order.currency)}</td>
                                </tr>
                                <tr className="font-medium text-text-secondary">
                                  <td colSpan={3} className="py-1">Shipping Cost</td>
                                  <td className="py-1 text-right text-text-primary">
                                    {order.shipping === 0 ? "Free" : formatPrice(order.shipping, order.currency)}
                                  </td>
                                </tr>
                                <tr className="font-semibold border-t border-border text-foreground text-sm">
                                  <td colSpan={3} className="pt-2">Grand Total</td>
                                  <td className="pt-2 text-right text-wood-dark">{formatPrice(order.total, order.currency)}</td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Payment References */}
                            <div className="border-t border-border/40 pt-4 mt-4 grid grid-cols-2 gap-4 text-[11px]">
                              <div>
                                <span className="font-medium block text-text-secondary">Razorpay Order ID:</span>
                                <span className="font-mono text-foreground select-all bg-background-secondary/40 px-1 py-0.5 rounded">{order.razorpayOrderId || "N/A"}</span>
                              </div>
                              <div>
                                <span className="font-medium block text-text-secondary">Razorpay Payment ID:</span>
                                <span className="font-mono text-foreground select-all bg-background-secondary/40 px-1 py-0.5 rounded">{order.razorpayPaymentId || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

import React from "react";
