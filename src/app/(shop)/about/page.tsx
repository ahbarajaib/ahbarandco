import type { Metadata } from "next";
import Image from "next/image";

import { Section } from "@/components/layout/section";
import { getPageAssets } from "@/lib/page-assets";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ahbar & Co. — handcrafted minimalist modern furniture made with intention.",
};

export default async function AboutPage() {
  const assets = await getPageAssets("about");

  return (
    <>
      {/* Hero Header Banner */}
      <section className="relative flex min-h-[30vh] sm:min-h-[40vh] items-center justify-center overflow-hidden bg-wood-dark text-background-primary">
        {assets.about_hero && (
          <Image
            src={assets.about_hero}
            alt="Wood workshop woodworking details"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-wood-dark/40" aria-hidden="true" />
        <div className="relative text-center z-10 px-4">
          <h1 className="font-heading text-4xl font-medium sm:text-5xl md:text-6xl text-background-primary">
            About Us
          </h1>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-background-primary/80 uppercase tracking-widest font-medium">
            Ahbar & Co. Story
          </p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            Our Story
          </h2>
          <p className="mt-6 text-base leading-relaxed text-text-secondary sm:text-lg">
            Ahbar & Co. creates handcrafted minimalist modern furniture that blends
            timeless craftsmanship with contemporary living. Born out of a passion for 
            honest materials and quiet, functional design, we build pieces that are meant 
            to be lived with, aged gracefully, and passed down.
          </p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Each item is designed with a deep appreciation for architectural simplicity 
            and organic warmth, transforming domestic environments into spaces of calm 
            introspection.
          </p>
        </div>
      </Section>

      <Section variant="secondary" id="craft">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
              Our Craft
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
              Every piece is carefully built using durable materials, thoughtful
              design, and traditional craftsmanship. We reject mass production in favor 
              of intentional woodworking.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              From hand-selecting character-rich walnut logs to finishing wood surfaces 
              with zero-VOC natural oils, our hands-on process ensures that no two pieces 
              are exactly alike.
            </p>
          </div>
          <div className="relative aspect-video lg:aspect-[4/3] order-1 lg:order-2 overflow-hidden bg-background-primary rounded-sm border border-border/10">
            {assets.about_craft ? (
              <Image
                src={assets.about_craft}
                alt="Wood joinery crafting detail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-background-primary" />
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
