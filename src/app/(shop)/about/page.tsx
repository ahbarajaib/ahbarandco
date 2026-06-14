import type { Metadata } from "next";
import Image from "next/image";

import { Section } from "@/components/layout/section";
import { getPageAssets } from "@/lib/page-assets";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ahbar & Co. — precision wood art and fine minimalist furniture made to last.",
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
            Ahbar & Co. creates precision-engineered minimalist modern wood art and furniture. 
            Born out of a passion for fine materials, premium design, and functional art, we reject 
            the temporary culture of modern furniture. We believe in creating high-quality, durable 
            pieces that are built to endure, age gracefully, and serve as permanent anchors in your space.
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
              Our Process
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
              We consider furniture-making to be a fine art. Our process is defined by care, intentional design, 
              and the technical precision of modern routing and cutting tools. By using machinery not for mass production, 
              but as an extension of artistic vision, we achieve crisp lines, perfect joints, and structures of unmatched durability.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              From selecting premium, high-grade wood slabs to the final touch of natural oils, 
              we treat every cut and curve with uncompromising care. The result is premium furniture designed 
              to stand the test of time, bringing longevity and quiet beauty to your home.
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
