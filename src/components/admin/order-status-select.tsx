"use client";

import React, { startTransition, useState } from "react";
import { OrderStatus } from "@/generated/prisma/client";
import { updateOrderStatus } from "@/lib/admin-actions";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-stone-50 text-stone-500 border-stone-200/40 focus:ring-stone-200/20",
  PAID: "bg-stone-100 text-stone-800 border-stone-200 focus:ring-stone-200/30",
  PROCESSING: "bg-wood-medium/10 text-wood-medium border-wood-medium/20 focus:ring-wood-medium/20",
  SHIPPED: "bg-stone-100/50 text-stone-700 border-stone-200/60 focus:ring-stone-200/30",
  DELIVERED: "bg-stone-100 text-stone-800 border-stone-200 focus:ring-stone-200/30",
  CANCELLED: "bg-red-50 text-red-700 border-red-200/50 focus:ring-red-200/20",
};

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (result?.error) {
        alert(result.error);
      } else {
        setStatus(nextStatus);
      }
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      className={`text-[9px] font-semibold uppercase tracking-wider rounded-sm border px-2.5 py-1 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-0 transition-all cursor-pointer ${STATUS_STYLES[status]}`}
    >
      <option value="PENDING" className="bg-white text-stone-700">Pending</option>
      <option value="PAID" className="bg-white text-stone-700">Paid</option>
      <option value="PROCESSING" className="bg-white text-wood-medium">Processing</option>
      <option value="SHIPPED" className="bg-white text-stone-700">Shipped</option>
      <option value="DELIVERED" className="bg-white text-stone-700">Delivered</option>
      <option value="CANCELLED" className="bg-white text-red-700">Cancelled</option>
    </select>
  );
}
