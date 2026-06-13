"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAdmin, type ActionResponse } from "@/lib/admin-actions";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorParam = searchParams.get("error");

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    loginAdmin,
    {}
  );

  let errorMessage = state.error;
  if (errorParam === "AccessDenied") {
    errorMessage = "Access denied. Only administrators are allowed.";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="font-heading text-xl font-semibold tracking-widest text-wood-dark">
              Ahbar & Co.
            </Link>
          </div>
          <CardTitle className="font-heading text-2xl font-medium text-text-primary">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Sign in to manage your products, collections, and orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            
            <div className="space-y-2">
              <Label htmlFor="email">Administrator Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                defaultValue={state.email ?? ""}
                placeholder="admin@ahbarandco.com"
                className="border-border focus:border-wood-medium focus:ring-wood-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                className="border-border focus:border-wood-medium focus:ring-wood-medium"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="h-11 w-full bg-wood-dark text-background-primary hover:bg-wood-medium transition-colors" disabled={isPending}>
              {isPending ? "Authenticating..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            <Link href="/" className="hover:text-wood-dark hover:underline transition-colors">
              ← Return to public store
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
