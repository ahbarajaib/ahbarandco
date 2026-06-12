import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/oauth-actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

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
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Ahbar & Co. Logo"
            className="h-9 w-auto object-contain rounded-sm"
          />
          <span className="font-sans text-xs font-normal text-text-secondary">/ admin</span>
        </Link>
        <AdminMobileNav adminName={adminName} />
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-white p-6 md:flex">
        <div className="mb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ahbar & Co. Logo"
              className="h-24 w-auto object-contain"
            />
          </Link>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-text-secondary font-medium">
            Store Management
          </div>
        </div>

        <div className="mb-6 rounded-sm bg-background-primary p-3">
          <div className="text-xs font-medium text-text-primary truncate">{adminName}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wider">Admin Role</div>
        </div>

        <AdminNav />

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
