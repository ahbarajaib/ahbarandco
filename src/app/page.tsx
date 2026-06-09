import Link from "next/link";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { COLLECTIONS } from "@/lib/constants";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <>
      <section className="relative flex min-h-[60vh] items-end bg-background-secondary sm:min-h-[70vh]">
        <div className="absolute inset-0 bg-wood-dark/20" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <p className="text-xs font-medium uppercase tracking-widest text-wood-medium sm:text-sm">
            Handcrafted Furniture
          </p>
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-medium leading-tight sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl">
            Modern Furniture
            <br />
            Made By Hand.
          </h1>
          <p className="mt-4 max-w-lg text-base text-text-secondary sm:mt-6 sm:text-lg">
            Thoughtfully crafted furniture designed for calm and intentional
            spaces.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              className="h-11 w-full sm:h-12 sm:w-auto sm:px-8"
              render={<Link href="/shop" />}
            >
              Shop Collection
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full border-wood-dark/20 bg-transparent sm:h-12 sm:w-auto sm:px-8 hover:bg-background-primary"
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
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.slug}
              href={collection.href}
              className="group block"
            >
              <div className="aspect-[4/5] bg-background-secondary transition-transform duration-500 group-hover:scale-[1.01]" />
              <h3 className="mt-3 font-heading text-xl font-medium sm:mt-4 sm:text-2xl">
                {collection.name}
              </h3>
            </Link>
          ))}
        </div>
      </Section>

      <Section variant="secondary" id="craft-preview">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="aspect-[4/3] bg-background-primary" />
          <div>
            <h2 className="font-heading text-2xl font-medium sm:text-3xl md:text-4xl">
              Crafted With Intention
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
              Every piece is carefully built using durable materials, thoughtful
              design, and traditional craftsmanship.
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
