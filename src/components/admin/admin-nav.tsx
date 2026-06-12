"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products & Stock" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/journal", label: "Journal Blog" },
  { href: "/admin/pages", label: "Page Images" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1">
      {ADMIN_LINKS.map((link) => {
        // Strict match for "/admin", prefix match for subroutes
        const isActive = 
          pathname === link.href || 
          (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center pl-2.5 pr-3 py-2 text-sm font-medium rounded-sm border-l-2 transition-all duration-200 ${
              isActive
                ? "bg-background-primary text-wood-dark border-wood-medium font-semibold"
                : "text-text-secondary border-transparent hover:bg-background-primary hover:text-wood-dark"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
