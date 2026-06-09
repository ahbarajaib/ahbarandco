import Link from "next/link";

import { auth } from "@/auth";
import { signOutUser } from "@/lib/oauth-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-wood-dark text-background-primary">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileNav isAuthenticated={isAuthenticated} />
          <Link
            href="/"
            className="font-heading text-xs font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-80 sm:text-sm"
          >
            {SITE_NAME}
          </Link>
        </div>

        <nav
          className="hidden items-center gap-6 lg:flex lg:gap-8"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-background-primary/80 transition-colors hover:text-background-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hidden text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary sm:inline-flex"
            )}
            render={<Link href="/shop" />}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary"
            )}
            render={<Link href="/cart" />}
          >
            Cart
          </Button>
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary md:inline-flex"
                )}
                render={<Link href="/account" />}
              >
                Account
              </Button>
              <form action={signOutUser}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="hidden text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary md:inline-flex"
                >
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-background-primary/80 hover:bg-background-primary/10 hover:text-background-primary"
              )}
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
