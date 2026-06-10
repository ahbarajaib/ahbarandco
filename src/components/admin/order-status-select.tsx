"use client";

import React, { startTransition } from "react";
import { OrderStatus } from "@/generated/prisma/client";
import { updateOrderStatus } from "@/lib/admin-actions";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className="text-xs font-semibold rounded-sm border border-input bg-white px-2 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-wood-medium cursor-pointer"
    >
      <option value="PENDING">Pending</option>
      <option value="PAID">Paid</option>
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}
