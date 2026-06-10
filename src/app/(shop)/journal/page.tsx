import type { Metadata } from "next";

import { AdBanner } from "@/components/ads/ad-banner";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Design stories, styling ideas, and craftsmanship insights from Ahbar & Co.",
};

export default function JournalPage() {
  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Journal
      </h1>
      <p className="mt-3 max-w-xl text-sm text-text-secondary sm:mt-4 sm:text-base md:text-lg">
        Editorial content coming soon.
      </p>
      
      <AdBanner slotId="journal-index-top-ad" />
    </Section>
  );
}
