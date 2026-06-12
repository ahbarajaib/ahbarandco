import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Reset Password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <Section variant="surface">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">Reset Password</h1>
        
        <div className="mt-8">
          {token ? (
            <>
              <p className="mb-6 text-sm text-text-secondary">
                Enter your new password below to reset your account credentials.
              </p>
              <ResetPasswordForm token={token} />
            </>
          ) : (
            <div className="rounded-sm border border-destructive/20 bg-destructive/5 p-4 text-center">
              <p className="text-sm font-medium text-destructive mb-3">Invalid Link</p>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                The password reset token is missing or invalid. Please request a new link.
              </p>
              <div>
                <Link
                  href="/forgot-password"
                  className="inline-block px-5 py-2 bg-wood-dark hover:bg-wood-dark/90 text-white font-medium text-xs tracking-wider uppercase rounded-sm"
                >
                  Request Reset
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
