"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartDrawer } from "@/components/providers/cart-drawer-provider";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, close, cartItems, isLoading, updateQuantity, removeItem } = useCartDrawer();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full max-w-md bg-wood-dark text-background-primary flex flex-col p-0 border-l border-background-primary/10 shadow-2xl">
        {/* Header */}
        <SheetHeader className="border-b border-background-primary/10 p-5 flex flex-row items-center justify-between">
          <SheetTitle className="font-heading text-lg font-medium text-background-primary flex items-center gap-2">
            <ShoppingBag className="size-5 stroke-[1.5]" />
            Your Cart {totalItemCount > 0 && `(${totalItemCount})`}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Cart Items */}
        <div className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
          {isLoading && cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div className="size-6 animate-spin rounded-full border-2 border-background-primary/30 border-t-background-primary"></div>
              <p className="text-xs text-background-primary/60 font-medium">Loading your selection...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="rounded-full bg-background-primary/5 p-4 text-background-primary/55">
                <ShoppingBag className="size-8 stroke-[1.2]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-background-primary">Your cart is empty</p>
                <p className="text-xs text-background-primary/60 max-w-[240px]">
                  Explore precision minimalist wood art and add items to your collection.
                </p>
              </div>
              <SheetClose 
                render={
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-background-primary/20 hover:bg-background-primary/10 text-background-primary"
                  >
                    Continue Shopping
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-background-primary/10">
              {cartItems.map((item) => {
                const firstImage = item.product.images?.[0]?.url;
                return (
                  <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    {/* Thumbnail */}
                    <div className="relative size-20 shrink-0 bg-background-primary/5 border border-background-primary/10 rounded-xs overflow-hidden">
                      {firstImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={firstImage} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[9px] text-background-primary/40 uppercase font-mono">No image</div>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium text-background-primary line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-semibold text-background-primary/80">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-background-primary/20 rounded-xs bg-background-primary/5 h-7">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 h-full flex items-center justify-center hover:bg-background-primary/10 text-background-primary/70 hover:text-background-primary transition cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-background-primary">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 h-full flex items-center justify-center hover:bg-background-primary/10 text-background-primary/70 hover:text-background-primary transition cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-background-primary/40 hover:text-red-400 transition cursor-pointer p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cartItems.length > 0 && (
          <div className="border-t border-background-primary/10 bg-background-primary/5 p-5 space-y-4 shrink-0">
            <div className="flex justify-between items-center text-sm">
              <span className="text-background-primary/70 font-medium">Subtotal</span>
              <span className="text-base font-semibold text-background-primary">{formatPrice(subtotal)}</span>
            </div>
            
            <p className="text-[10px] text-background-primary/50 text-center leading-normal">
              Shipping, taxes, and discounts calculated during checkout.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <SheetClose
                render={
                  <Link
                    href="/checkout"
                    className="flex h-11 items-center justify-center rounded-xs bg-background-primary text-wood-dark hover:bg-background-primary/95 text-xs font-bold uppercase tracking-widest transition shadow-xs text-center cursor-pointer"
                  >
                    Proceed to Checkout
                  </Link>
                }
              />
              
              <SheetClose
                render={
                  <Link
                    href="/cart"
                    className="flex h-10 items-center justify-center rounded-xs border border-background-primary/20 bg-transparent text-background-primary hover:bg-background-primary/10 text-[10px] font-bold uppercase tracking-widest transition text-center cursor-pointer"
                  >
                    View Details & Cart
                  </Link>
                }
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
