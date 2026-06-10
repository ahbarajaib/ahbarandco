import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background-primary px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center text-text-secondary text-sm">
          Loading Admin Auth...
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
