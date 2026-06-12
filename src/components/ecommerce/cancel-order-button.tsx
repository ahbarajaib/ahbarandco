"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/payment-actions";

type CancelOrderButtonProps = {
  orderNumber: string;
};

export function CancelOrderButton({ orderNumber }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(orderNumber);
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={confirm ? "destructive" : "outline"}
          disabled={isPending}
          onClick={handleCancel}
          className="h-10 px-4 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
        >
          {isPending
            ? "Cancelling..."
            : confirm
            ? "Confirm Cancel"
            : "Cancel Order"}
        </Button>

        {confirm && !isPending && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirm(false)}
            className="h-10 px-4 text-xs font-semibold uppercase tracking-wider"
          >
            Keep Order
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
