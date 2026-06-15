"use client";

import { MenuIcon, ShoppingBag, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex size-8 items-center justify-center rounded-lg text-background-primary hover:bg-background-primary/10 transition-colors duration-200"
        aria-label="Open menu"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs bg-wood-dark text-background-primary flex flex-col p-6 border-r border-background-primary/10">
        <SheetHeader className="border-b border-background-primary/10 pb-5">
          <SheetTitle className="font-heading text-left text-lg uppercase tracking-[0.15em] text-background-primary">
            {SITE_NAME}
          </SheetTitle>
        </SheetHeader>

        {/* User greeting if signed in */}
        {isAuthenticated && (
          <div className="pt-4 pb-2 border-b border-background-primary/10">
            <p className="font-heading italic text-base text-background-primary/95">
              Welcome, {userName || "Guest"}
            </p>
          </div>
        )}

        <nav className="mt-8 flex flex-col gap-1.5 flex-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2 text-2xl font-heading font-medium tracking-wide transition-all ${
                  isActive
                    ? "text-background-primary border-b border-background-primary/20 w-fit"
                    : "text-background-primary/50 hover:text-background-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Utility / Secondary links group forced to the bottom */}
          <div className="mt-auto pt-6 border-t border-background-primary/10 space-y-3">
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.15em] text-background-primary/60 hover:text-background-primary transition-colors py-2"
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="size-4 stroke-[1.5]" />
                Cart
              </span>
              {cartItemCount !== undefined && cartItemCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-wood-medium text-[9px] font-bold text-white ring-1 ring-wood-dark">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background-primary/60 hover:text-background-primary transition-colors py-2"
            >
              <User className="size-4 stroke-[1.5]" />
              {isAuthenticated ? "My Account" : "Sign In"}
            </Link>
            
            {isAuthenticated && (
              <form action={signOutUser} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 text-left text-xs font-medium uppercase tracking-[0.15em] text-background-primary/60 hover:text-background-primary transition-colors py-2 cursor-pointer"
                >
                  <LogOut className="size-4 stroke-[1.5]" />
                  Sign Out
                </button>
              </form>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
