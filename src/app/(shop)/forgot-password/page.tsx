import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <Section variant="surface">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">Forgot Password</h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </Section>
  );
}
