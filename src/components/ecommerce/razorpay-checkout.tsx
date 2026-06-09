"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createCheckoutOrder,
  verifyPayment,
} from "@/lib/payment-actions";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckout() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setError(null);
    setLoading(true);

    try {
      const checkout = await createCheckoutOrder();
      if (checkout.error || !checkout.success) {
        setError(checkout.error ?? "Unable to start checkout.");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load Razorpay.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "Ahbar & Co.",
        description: `Order ${checkout.orderNumber}`,
        order_id: checkout.razorpayOrderId,
        prefill: checkout.customer,
        theme: { color: "#2D221C" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const result = await verifyPayment({
            orderId: checkout.orderId!,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          window.location.href = `/orders/${result.orderNumber}?success=1`;
        },
      });

      razorpay.open();
    } catch {
      setError("Payment could not be initiated. Check Razorpay configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        size="lg"
        className="h-12 w-full"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Preparing..." : "Pay with Razorpay"}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
