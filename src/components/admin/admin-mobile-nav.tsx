"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutUser } from "@/lib/oauth-actions";

type AdminMobileNavProps = {
  adminName: string;
};

export function AdminMobileNav({ adminName }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  
  // Close the sheet when path changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setOpen(false);
    setPrevPathname(pathname);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors duration-200"
        aria-label="Open navigation menu"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs bg-white text-text-primary flex flex-col p-6 border-l border-border">
        <SheetHeader className="pb-4 border-b border-border mb-6">
          <SheetTitle className="font-heading text-left text-sm uppercase tracking-widest text-wood-dark">
            Ahbar & Co.
          </SheetTitle>
          <div className="text-[10px] text-left uppercase tracking-wider text-text-secondary font-medium mt-1">
            Store Management
          </div>
        </SheetHeader>

        {/* User Card */}
        <div className="mb-6 rounded-sm bg-background-primary p-3">
          <div className="text-xs font-medium text-text-primary truncate">{adminName}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wider">Admin Role</div>
        </div>

        {/* Navigation links wrapper */}
        <div className="flex-1 overflow-y-auto">
          <AdminNav />
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs border-border hover:bg-background-secondary"
            render={<Link href="/" onClick={() => setOpen(false)} />}
          >
            View Live Store
          </Button>
          <form action={signOutUser}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
