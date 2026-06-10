import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Sign In",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <Section variant="surface">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">Sign In</h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Sign in to checkout, view orders, and manage your account.
        </p>
        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl ?? "/account"} />
        </div>
      </div>
    </Section>
  );
}
