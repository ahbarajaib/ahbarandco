"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/components/providers/cart-drawer-provider";

type CartIconTriggerProps = {
  initialCount: number;
};

export function CartIconTrigger({ initialCount }: CartIconTriggerProps) {
  const { open, cartItems } = useCartDrawer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Calculate total count from client-side state
  const clientCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Use the client-side count once mounted, otherwise fallback to server initialCount
  const displayCount = mounted ? clientCount : initialCount;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    open();
  };

  return (
    <Link
      href="/cart"
      onClick={handleClick}
      className="relative flex items-center justify-center rounded-full p-2 text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary transition-all duration-200 cursor-pointer"
      aria-label={`Cart with ${displayCount} items`}
    >
      <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
      {displayCount > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-wood-medium px-1 text-[9px] font-bold text-white ring-2 ring-wood-dark">
          {displayCount}
        </span>
      )}
    </Link>
  );
}
