"use client";

import { createContext, useContext, useState, useEffect, useTransition } from "react";
import { updateProductInCart, removeProductFromCart } from "@/lib/cart-actions";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: Array<{ url: string }>;
};

type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: Array<{ url: string }>;
};

type CartItemWithProduct = {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
};

type CartDrawerContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
};

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart initially when mounted
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        refreshCart();
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, []);

  const open = () => {
    refreshCart(); // Ensure cart data is fresh when opening
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const updateQuantity = async (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      await removeItem(productId, variantId);
      return;
    }

    // Optimistic local state update for fast responsiveness
    const previousItems = [...cartItems];
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );

    startTransition(async () => {
      const res = await updateProductInCart(productId, quantity, variantId);
      if (res.error) {
        setCartItems(previousItems); // Rollback on error
      } else {
        await refreshCart();
      }
    });
  };

  const removeItem = async (productId: string, variantId?: string) => {
    const previousItems = [...cartItems];
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );

    startTransition(async () => {
      const res = await removeProductFromCart(productId, variantId);
      if (res.error) {
        setCartItems(previousItems); // Rollback on error
      } else {
        await refreshCart();
      }
    });
  };

  return (
    <CartDrawerContext.Provider
      value={{
        isOpen,
        open,
        close,
        cartItems,
        isLoading: isLoading || isPending,
        refreshCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (context === undefined) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
}
