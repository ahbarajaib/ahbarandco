"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center lg:flex lg:gap-8" aria-label="Main">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:transition-all after:duration-300 ${
              isActive
                ? "text-background-primary after:w-full after:bg-background-primary"
                : "text-background-primary/70 hover:text-background-primary after:w-0 after:bg-background-primary/60 hover:after:w-full"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
