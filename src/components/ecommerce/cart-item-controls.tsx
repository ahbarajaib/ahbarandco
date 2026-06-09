"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  removeProductFromCart,
  updateProductInCart,
} from "@/lib/cart-actions";

type CartItemControlsProps = {
  productId: string;
  quantity: number;
};

export function CartItemControls({
  productId,
  quantity,
}: CartItemControlsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || quantity <= 1}
        onClick={() =>
          startTransition(() => {
            void updateProductInCart(productId, quantity - 1);
          })
        }
      >
        −
      </Button>
      <span className="min-w-8 text-center text-sm">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            void updateProductInCart(productId, quantity + 1);
          })
        }
      >
        +
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            void removeProductFromCart(productId);
          })
        }
      >
        Remove
      </Button>
    </div>
  );
}
