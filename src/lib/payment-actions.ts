"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { emptyCart, getCartWithProducts } from "@/lib/cart-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AddressSchema } from "@/lib/validations";
import { Prisma } from "@/generated/prisma/client";
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AHB-${timestamp}-${random}`;
}

export async function createCheckoutOrder(shippingAddress: z.infer<typeof AddressSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to checkout." };
  }

  const validation = AddressSchema.safeParse(shippingAddress);
  if (!validation.success) {
    return { error: `Invalid shipping address: ${validation.error.issues[0].message}` };
  }

  const cartItems = await getCartWithProducts();
  if (cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 500000 ? 0 : 150000;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      subtotal,
      shipping,
      total,
      shippingAddress: validation.data as Prisma.InputJsonValue,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      },
    },
  });

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: total,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    customer: {
      name: session.user.name ?? "Customer",
      email: session.user.email ?? "",
    },
  };
}

export async function verifyPayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  const isValid = verifyRazorpayPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    return { error: "Payment verification failed." };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
      razorpayOrderId,
    },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      razorpayPaymentId,
    },
  });

  await emptyCart();
  revalidatePath("/account");
  revalidatePath("/orders");

  return { success: true, orderNumber: order.orderNumber };
}

export async function cancelOrder(orderNumber: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to cancel an order." };
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
    },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "PENDING") {
    return { error: "Only pending orders can be cancelled." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/account");
  revalidatePath(`/orders/${orderNumber}`);

  return { success: true };
}
