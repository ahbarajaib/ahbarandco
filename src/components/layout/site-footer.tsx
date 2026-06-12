import Link from "next/link";

import { FOOTER_LINKS, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="bg-wood-dark text-background-primary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={SITE_NAME}
                className="h-20 w-auto object-contain rounded-sm"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background-primary/70">
              Handcrafted minimalist modern furniture for calm, intentional
              spaces.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-background-primary/50">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background-primary/80 transition-colors hover:text-background-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-background-primary/50">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background-primary/80 transition-colors hover:text-background-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-background-primary/10 pt-6 sm:mt-16 sm:pt-8">
          <p className="text-xs text-background-primary/50">
            &copy; {new Date().getFullYear()} {SITE_NAME} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
