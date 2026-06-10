import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <Section variant="surface">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">
          Create Account
        </h1>
        <p className="mt-3 text-sm text-text-secondary sm:text-base">
          Join Ahbar & Co. to shop handcrafted furniture and track your orders.
        </p>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </Section>
  );
}
