"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { executePasswordReset, type AuthActionState } from "@/lib/auth-actions";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(async (prevState, formData) => {
    setLocalError("");
    const password = String(formData.get("password") ?? "");
    
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return prevState;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return prevState;
    }

    return executePasswordReset(prevState, formData);
  }, {});

  return (
    <div className="space-y-6">
      {state.success ? (
        <div className="rounded-sm border border-wood-medium/20 bg-wood-medium/5 p-4 text-center">
          <p className="text-sm font-medium text-wood-dark mb-3">Success</p>
          <p className="text-xs text-text-secondary leading-relaxed mb-6">
            {state.message || "Your password has been reset successfully!"}
          </p>
          <div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-wood-dark hover:bg-wood-dark/90 text-white font-medium text-xs tracking-wider uppercase rounded-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {/* Pass token hidden */}
          <input type="hidden" name="token" value={token} />

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isPending}
              className="h-11 bg-white"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              disabled={isPending}
              className="h-11 bg-white"
              placeholder="••••••••"
            />
          </div>

          {/* Client-side error state */}
          {localError && (
            <div className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5" role="alert">
              <span className="mt-0.5 text-destructive">✕</span>
              <p className="text-sm text-destructive">{localError}</p>
            </div>
          )}

          {/* Server-side error state */}
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
              <p className="text-sm text-wood-medium">Resetting password…</p>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full h-11 bg-wood-dark hover:bg-wood-dark/90 text-white font-medium text-sm">
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
}
