"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addProductToCart } from "@/lib/cart-actions";
import { useCartDrawer } from "@/components/providers/cart-drawer-provider";

type AddToCartFormProps = {
  productId: string;
  inStock: boolean;
};

export function AddToCartForm({ productId, inStock }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { open } = useCartDrawer();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await addProductToCart(productId, quantity);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Added to cart.");
        open();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-28">
          <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
            Quantity
          </label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={!inStock || isPending}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full sm:h-12 sm:flex-1"
          disabled={!inStock || isPending}
        >
          {inStock ? (isPending ? "Adding..." : "Add to Cart") : "Out of Stock"}
        </Button>
      </div>
      {message && (
        <p className="text-sm text-wood-medium" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
