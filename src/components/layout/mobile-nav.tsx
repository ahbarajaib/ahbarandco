"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

type MobileNavProps = {
  isAuthenticated: boolean;
};

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden"
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-background-primary hover:bg-background-primary/10"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs bg-wood-dark text-background-primary">
        <SheetHeader>
          <SheetTitle className="font-heading text-left text-sm uppercase tracking-[0.15em] text-background-primary">
            {SITE_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-3 text-base font-medium text-background-primary/90 transition-colors hover:bg-background-primary/10 hover:text-background-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-4 border-t border-background-primary/10" />
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="rounded px-2 py-3 text-base font-medium text-background-primary/90 hover:bg-background-primary/10"
          >
            Cart
          </Link>
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            onClick={() => setOpen(false)}
            className="rounded px-2 py-3 text-base font-medium text-background-primary/90 hover:bg-background-primary/10"
          >
            {isAuthenticated ? "Account" : "Sign In"}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
