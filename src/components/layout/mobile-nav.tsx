"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { signOutUser } from "@/lib/oauth-actions";

type MobileNavProps = {
  isAuthenticated: boolean;
  userName?: string | null;
  cartItemCount?: number;
};

export function MobileNav({ isAuthenticated, userName, cartItemCount }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex size-8 items-center justify-center rounded-lg text-background-primary hover:bg-background-primary/10 transition-colors duration-200"
        aria-label="Open menu"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs bg-wood-dark text-background-primary flex flex-col">
        <SheetHeader className="border-b border-background-primary/10 pb-4">
          <SheetTitle className="font-heading text-left text-sm uppercase tracking-[0.2em] text-background-primary">
            {SITE_NAME}
          </SheetTitle>
        </SheetHeader>

        {/* User greeting if signed in */}
        {isAuthenticated && (
          <div className="mt-4 flex items-center gap-3 rounded-sm bg-background-primary/10 px-3 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wood-medium text-sm font-semibold text-background-primary">
              {userInitial}
            </span>
            <div>
              <p className="text-sm font-medium text-background-primary leading-tight truncate max-w-[160px]">
                {userName || "My Account"}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-background-primary/50 mt-0.5">Signed in</p>
            </div>
          </div>
        )}

        <nav className="mt-6 flex flex-col gap-0.5 flex-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-sm px-3 py-3 text-base font-medium text-background-primary/80 transition-colors hover:bg-background-primary/10 hover:text-background-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-3 border-t border-background-primary/10" />
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-sm px-3 py-3 text-base font-medium text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary"
          >
            <span>Cart</span>
            {cartItemCount !== undefined && cartItemCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-wood-medium text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            onClick={() => setOpen(false)}
            className="rounded-sm px-3 py-3 text-base font-medium text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary"
          >
            {isAuthenticated ? "My Orders & Account" : "Sign In"}
          </Link>
          {isAuthenticated && (
            <form action={signOutUser} className="w-full">
              <button
                type="submit"
                className="w-full text-left rounded-sm px-3 py-3 text-base font-medium text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
