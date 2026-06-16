import Link from "next/link";
import { Search } from "lucide-react";

import { DesktopNav } from "@/components/layout/desktop-nav";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/oauth-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { getCart } from "@/lib/cart";
import { CartIconTrigger } from "@/components/layout/cart-icon-trigger";
import { HeaderWrapper } from "@/components/layout/header-wrapper";

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name;
  const firstName = userName?.split(" ")[0];
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  const cart = await getCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <HeaderWrapper>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileNav isAuthenticated={isAuthenticated} userName={userName} cartItemCount={cartItemCount} />
          <Link
            href="/"
            className="transition-opacity hover:opacity-80 flex items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.png?v=3"
              alt={SITE_NAME}
              className="h-10 sm:h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <DesktopNav />

        {/* Right: User actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary rounded-full size-9 flex items-center justify-center"
            render={<Link href="/shop" />}
            title="Search catalog"
          >
            <Search className="h-4 w-4 stroke-[1.5]" />
          </Button>
          <CartIconTrigger initialCount={cartItemCount} />

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:gap-3 md:flex">
              {/* User avatar circle + name */}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors duration-200 hover:bg-background-primary/10"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-wood-medium text-xs font-semibold text-background-primary">
                  {userInitial}
                </span>
                <span className="max-w-[100px] truncate text-xs font-semibold uppercase tracking-wider text-background-primary/90">
                  {firstName || "Account"}
                </span>
              </Link>
              <form action={signOutUser}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-background-primary/50 hover:bg-background-primary/10 hover:text-background-primary text-xs font-semibold uppercase tracking-wider"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary text-xs font-semibold uppercase tracking-wider"
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </HeaderWrapper>
  );
}
