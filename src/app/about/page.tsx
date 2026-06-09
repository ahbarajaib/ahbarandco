import type { Metadata } from "next";

import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ahbar & Co. — handcrafted minimalist modern furniture made with intention.",
};

export default function AboutPage() {
  return (
    <>
      <Section>
        <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
          About
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
          Ahbar & Co. creates handcrafted minimalist modern furniture that blends
          timeless craftsmanship with contemporary living.
        </p>
      </Section>

      <Section variant="secondary" id="craft">
        <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
          Our Craft
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
          Every piece is carefully built using durable materials, thoughtful
          design, and traditional craftsmanship.
        </p>
      </Section>
    </>
  );
}
