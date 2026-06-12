import Link from "next/link";

import { auth } from "@/auth";
import { signOutUser } from "@/lib/oauth-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name;
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-wood-dark/80 bg-wood-dark text-background-primary backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileNav isAuthenticated={isAuthenticated} userName={userName} />
          <Link
            href="/"
            className="transition-opacity hover:opacity-80 flex items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={SITE_NAME}
              className="h-11 sm:h-14 w-auto object-contain rounded-sm"
            />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <nav
          className="hidden items-center lg:flex lg:gap-8"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-background-primary/70 transition-colors duration-200 hover:text-background-primary after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-background-primary/60 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: User actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary sm:inline-flex"
            render={<Link href="/shop" />}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary"
            render={<Link href="/cart" />}
          >
            Cart
          </Button>

          {/* Thin vertical separator */}
          <div className="mx-1 hidden h-5 w-px bg-background-primary/20 md:block" aria-hidden="true" />

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              {/* User avatar circle + name */}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors duration-200 hover:bg-background-primary/10"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-wood-medium text-xs font-semibold text-background-primary">
                  {userInitial}
                </span>
                <span className="max-w-[100px] truncate text-sm font-medium text-background-primary/90">
                  {userName || "Account"}
                </span>
              </Link>
              <form action={signOutUser}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-background-primary/50 hover:bg-background-primary/10 hover:text-background-primary"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-background-primary/70 hover:bg-background-primary/10 hover:text-background-primary"
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
