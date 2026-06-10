import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/oauth-actions";
import { Button } from "@/components/ui/button";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products & Stock" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/journal", label: "Journal Blog" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const adminName = session?.user?.name || "Administrator";

  return (
    <div className="flex min-h-screen flex-col bg-background-primary text-text-primary md:flex-row">
      {/* Mobile Top Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden">
        <Link href="/admin" className="font-heading text-sm font-semibold tracking-wider text-wood-dark">
          AHBAR & CO. <span className="font-sans text-xs font-normal text-text-secondary">/ admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-xs font-medium text-text-secondary hover:text-wood-dark">
            Products
          </Link>
          <Link href="/admin/orders" className="text-xs font-medium text-text-secondary hover:text-wood-dark">
            Orders
          </Link>
          <form action={signOutUser}>
            <button type="submit" className="text-xs font-medium text-destructive">
              Out
            </button>
          </form>
        </div>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-white p-6 md:flex">
        <div className="mb-8">
          <Link href="/" className="font-heading text-sm font-semibold uppercase tracking-widest text-wood-dark hover:opacity-80 transition-opacity">
            Ahbar & Co.
          </Link>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-text-secondary font-medium">
            Store Management
          </div>
        </div>

        <div className="mb-6 rounded-sm bg-background-primary p-3">
          <div className="text-xs font-medium text-text-primary truncate">{adminName}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wider">Admin Role</div>
        </div>

        <nav className="flex-1 space-y-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-sm text-text-secondary hover:bg-background-primary hover:text-wood-dark transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs border-border hover:bg-background-secondary"
            render={<Link href="/" />}
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
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
