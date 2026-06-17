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
      <section className="group relative flex min-h-[35vh] sm:min-h-[45vh] items-center justify-center overflow-hidden bg-wood-dark text-background-primary">
        {assets.about_hero && (
          <Image
            src={assets.about_hero}
            alt="Wood workshop woodworking details"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-75 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-wood-dark/45" aria-hidden="true" />
        <div className="relative text-center z-10 px-4">
          <p className="text-xs sm:text-sm text-background-primary/80 uppercase tracking-[0.2em] font-medium mb-3">
            Ahbar & Co. Story
          </p>
          <h1 className="font-heading text-4xl font-medium sm:text-5xl md:text-6xl text-background-primary tracking-tight">
            About Us
          </h1>
        </div>
      </section>

      {/* Our Story & Pull Quote Section */}
      <Section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <blockquote className="font-heading text-2xl sm:text-3xl lg:text-4xl italic text-wood-medium leading-normal max-w-3xl mx-auto">
            &ldquo;In an age of temporary things, we design permanent objects. Functional art, engineered with technical precision.&rdquo;
          </blockquote>
          <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16 text-left border-t border-border/40 pt-16">
            <div>
              <h2 className="font-heading text-2xl font-medium text-wood-dark">
                Our Story
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-text-secondary">
                Ahbar & Co. creates precision-engineered minimalist modern wood art and furniture. 
                Born out of a passion for fine materials, premium design, and functional art, we reject 
                the temporary culture of modern furniture. We believe in creating high-quality, durable 
                pieces that are built to endure, age gracefully, and serve as permanent anchors in your space.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-medium text-wood-dark">
                Our Philosophy
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-text-secondary">
                Each item is designed with a deep appreciation for architectural simplicity 
                and organic warmth, transforming domestic environments into spaces of calm 
                introspection. We honor the character of the wood, allowing the natural grain 
                and texture to dictate the form of the final design.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Material Integrity Section */}
      <Section variant="secondary" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark">
              Material Integrity
            </h2>
            <p className="mt-4 text-sm text-text-secondary uppercase tracking-[0.15em]">
              Sourced with care, built for generations
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {/* Material 1 */}
            <div className="group bg-surface p-8 rounded-sm border border-border/20 shadow-2xs transition-all duration-300 hover:border-wood-medium/20 hover:shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-wood-medium/70 group-hover:text-wood-medium transition-colors duration-300 font-semibold">01 / Premium Hardwood</span>
                <h3 className="font-heading text-xl font-medium text-wood-dark mt-2 group-hover:text-wood-medium transition-colors duration-300">C.P. Teakwood (Sagwan)</h3>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  The gold standard of Indian craftsmanship. Highly prized for its rich golden-brown luster, 
                  high natural oil content, and legendary resistance to moisture, warping, and pests.
                </p>
              </div>
            </div>

            {/* Material 2 */}
            <div className="group bg-surface p-8 rounded-sm border border-border/20 shadow-2xs transition-all duration-300 hover:border-wood-medium/20 hover:shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-wood-medium/70 group-hover:text-wood-medium transition-colors duration-300 font-semibold">02 / Structural strength</span>
                <h3 className="font-heading text-xl font-medium text-wood-dark mt-2 group-hover:text-wood-medium transition-colors duration-300">Indian Rosewood (Sheesham)</h3>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  Celebrated for its striking, deep-toned, contrast-rich grain patterns. Exceptionally 
                  dense and robust, making it the perfect choice for architectural furniture designed for high load.
                </p>
              </div>
            </div>

            {/* Material 3 */}
            <div className="group bg-surface p-8 rounded-sm border border-border/20 shadow-2xs transition-all duration-300 hover:border-wood-medium/20 hover:shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-wood-medium/70 group-hover:text-wood-medium transition-colors duration-300 font-semibold">03 / Multi-toned Grain</span>
                <h3 className="font-heading text-xl font-medium text-wood-dark mt-2 group-hover:text-wood-medium transition-colors duration-300">Acacia (Babool)</h3>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  A beautiful, resilient hardwood featuring dynamic shades of honey and chocolate. Its 
                  interlocking grain structure provides remarkable stability for modern minimalist designs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Process Section */}
      <Section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark">
                Our Process
              </h2>
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-text-secondary">
                We consider furniture-making to be a fine art. Our process is defined by care, intentional design, 
                and the technical precision of modern routing and cutting tools. By using machinery not for mass production, 
                but as an extension of artistic vision, we achieve crisp lines, perfect joints, and structures of unmatched durability.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-text-secondary">
                From selecting premium, high-grade wood slabs to the final touch of natural protective oils, 
                we treat every cut and curve with uncompromising care. The result is premium furniture designed 
                to stand the test of time, bringing longevity and quiet beauty to your home.
              </p>
            </div>
            <div className="relative aspect-video lg:aspect-[4/3] overflow-hidden bg-background-secondary rounded-sm border border-border/10 shadow-2xs hover:shadow-xs transition-shadow duration-300 group">
              {assets.about_craft ? (
                <Image
                  src={assets.about_craft}
                  alt="Wood joinery crafting detail"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-full w-full bg-background-secondary" />
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
