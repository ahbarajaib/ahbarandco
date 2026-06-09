"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { emptyCart, getCartWithProducts } from "@/lib/cart-actions";
import { prisma } from "@/lib/prisma";
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AHB-${timestamp}-${random}`;
}

export async function createCheckoutOrder() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to checkout." };
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
