import Link from "next/link";
import Image from "next/image";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getPageAssets } from "@/lib/page-assets";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);
  const assets = await getPageAssets("home");
  const collections = await prisma.collection.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="relative flex min-h-[60vh] items-end bg-background-secondary sm:min-h-[70vh] overflow-hidden">
        {assets.hero_bg && (
          <Image
            src={assets.hero_bg}
            alt="Precision minimalist modern furniture showcase"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-wood-dark/40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32 text-background-primary">
          <p className="text-xs font-medium uppercase tracking-widest text-background-primary/80 sm:text-sm">
            Precision Wood Art
          </p>
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-medium leading-tight sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl text-background-primary">
            Functional Wood Art
            <br />
            Designed to Last.
          </h1>
          <p className="mt-4 max-w-lg text-base text-background-primary/95 sm:mt-6 sm:text-lg">
            In an age of temporary things, we build permanent objects of premium quality. Functional art, engineered with technical precision.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              className="h-11 w-full bg-background-primary text-wood-dark hover:bg-background-primary/90 sm:h-12 sm:w-auto sm:px-8 cursor-pointer"
              render={<Link href="/shop" />}
            >
              Shop Collection
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full border-background-primary/30 text-background-primary bg-transparent sm:h-12 sm:w-auto sm:px-8 hover:bg-background-primary/10 hover:border-background-primary cursor-pointer"
              render={<Link href="/about#craft" />}
            >
              Our Craft
            </Button>
          </div>
        </div>
      </section>


      <Section variant="primary">
        <div className="mb-8 sm:mb-12">
          <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
            Featured Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/${collection.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary rounded-sm border border-border/10">
                {collection.imageUrl ? (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-background-secondary" />
                )}
              </div>
              <h3 className="mt-3 font-heading text-xl font-medium sm:mt-4 sm:text-2xl text-wood-dark group-hover:text-wood-medium transition-colors">
                {collection.name}
              </h3>
            </Link>
          ))}
        </div>
      </Section>

      <Section variant="secondary" id="craft-preview">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden bg-background-primary rounded-sm border border-border/10">
            {assets.craft_image ? (
              <Image
                src={assets.craft_image}
                alt="Woodworking process detail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-background-primary" />
            )}
          </div>
          <div>
            <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
              Precision as Art
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
              We use precision cutters, routers, and fine engineering to bring wood to life. Every item is built with uncompromising care, designed to be a permanent fixture in a temporary world.
            </p>
          </div>
        </div>
      </Section>



      {featuredProducts.length > 0 && (
        <Section>
          <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
            Featured Products
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
