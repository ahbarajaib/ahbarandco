"use client";

import Link from "next/link";
import { useActionState } from "react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginUser, type AuthActionState } from "@/lib/auth-actions";

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(loginUser, {});

  return (
    <div className="space-y-6">
      <GoogleSignInButton callbackUrl={callbackUrl} label="Continue with Google" />

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-[11px] uppercase tracking-widest text-text-secondary">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-wood-medium hover:text-wood-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            className="h-11 bg-white"
            placeholder="••••••••"
          />
        </div>

        {/* Error state */}
        {state.error && (
          <div className="flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5" role="alert">
            <span className="mt-0.5 text-destructive">✕</span>
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        )}

        {/* Loading/pending state inline feedback */}
        {isPending && (
          <div className="flex items-center gap-2 rounded-sm border border-wood-medium/20 bg-wood-medium/5 px-3 py-2.5">
            <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-wood-medium border-t-transparent" />
            <p className="text-sm text-wood-medium">Signing you in…</p>
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200"
          disabled={isPending}
        >
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-wood-medium hover:text-wood-dark hover:underline underline-offset-2 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
