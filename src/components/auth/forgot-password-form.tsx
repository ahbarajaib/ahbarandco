"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, type AuthActionState } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(requestPasswordReset, {});

  return (
    <div className="space-y-6">
      {state.success ? (
        <div className="rounded-sm border border-wood-medium/20 bg-wood-medium/5 p-4 text-center">
          <p className="text-sm font-medium text-wood-dark mb-3">Check your inbox</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            {state.message || "We've sent a link to reset your password if your email is registered."}
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-xs font-semibold uppercase tracking-wider text-wood-medium hover:underline"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              defaultValue={state.email ?? ""}
              className="h-11 bg-white"
              placeholder="your@email.com"
            />
          </div>

          {/* Error state */}
          {state.error && (
            <div className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5" role="alert">
              <span className="mt-0.5 text-destructive">✕</span>
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Pending state */}
          {isPending && (
            <div className="flex items-center gap-2 rounded-sm border border-wood-medium/20 bg-wood-medium/5 px-3 py-2.5">
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-wood-medium border-t-transparent" />
              <p className="text-sm text-wood-medium">Sending reset link…</p>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full h-11 bg-wood-dark hover:bg-wood-dark/90 text-white font-medium text-sm">
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-text-secondary hover:text-wood-dark hover:underline"
            >
              Remember your password? Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
