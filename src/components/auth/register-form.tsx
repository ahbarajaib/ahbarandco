"use client";

import Link from "next/link";
import { useActionState } from "react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerUser, type AuthActionState } from "@/lib/auth-actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(registerUser, {});

  return (
    <div className="space-y-6">
      <GoogleSignInButton callbackUrl="/" label="Sign up with Google" />

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-[11px] uppercase tracking-widest text-text-secondary">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            disabled={isPending}
            className="h-11 bg-white"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="h-11 bg-white"
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={isPending}
            className="h-11 bg-white"
            placeholder="At least 8 characters"
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
            <p className="text-sm text-wood-medium">Creating your account…</p>
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200"
          disabled={isPending}
        >
          {isPending ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-wood-medium hover:text-wood-dark hover:underline underline-offset-2 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
