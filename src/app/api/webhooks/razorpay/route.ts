import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const isValid = verifyRazorpayWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const payload = JSON.parse(body) as {
    event: string;
    payload: {
      payment?: {
        entity: {
          id: string;
          order_id: string;
          status: string;
        };
      };
    };
  };

  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment?.entity;
    if (payment?.status === "captured") {
      await prisma.order.updateMany({
        where: { razorpayOrderId: payment.order_id },
        data: {
          status: "PAID",
          razorpayPaymentId: payment.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
