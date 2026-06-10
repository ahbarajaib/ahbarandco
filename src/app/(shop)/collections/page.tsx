import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { COLLECTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore Ahbar & Co. furniture collections.",
};

export default function CollectionsPage() {
  return (
    <Section>
      <h1 className="font-heading text-3xl font-medium sm:text-4xl md:text-5xl">
        Collections
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-2">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.slug}
            href={collection.href}
            className="group block"
          >
            <div className="aspect-[4/3] bg-background-secondary transition-transform duration-500 group-hover:scale-[1.01]" />
            <h2 className="mt-3 font-heading text-xl font-medium sm:mt-4 sm:text-2xl">
              {collection.name}
            </h2>
          </Link>
        ))}
      </div>
    </Section>
  );
}
