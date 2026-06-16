import Link from "next/link";
import Image from "next/image";

import { ProductCard } from "@/components/ecommerce/product-card";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getPageAssets } from "@/lib/page-assets";
import { getFeaturedProducts } from "@/lib/products";
import { estimateReadingTime } from "@/lib/markdown";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);
  const assets = await getPageAssets("home");
  
  const collections = await prisma.collection.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  const journalPosts = await prisma.journalPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      {/* Expansive Hero Section */}
      <section className="relative flex min-h-[75vh] items-end bg-background-secondary sm:min-h-[85vh] overflow-hidden">
        {assets.hero_bg && (
          <Image
            src={assets.hero_bg}
            alt="Precision minimalist modern furniture showcase"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.85] transition-transform duration-10000 ease-out hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-wood-dark/35" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36 text-background-primary z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background-primary/90 sm:text-sm">
            Precision Wood Art
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-medium leading-[1.15] sm:mt-5 sm:text-5xl md:text-6xl lg:text-7xl text-background-primary tracking-tight">
            Functional Wood Art
            <br />
            Designed to Last.
          </h1>
          <p className="mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-background-primary/95 sm:mt-8 md:text-lg">
            In an age of temporary things, we build permanent objects of premium quality. Functional art, engineered with technical precision.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button
              size="lg"
              className="h-11 w-full bg-background-primary text-wood-dark hover:bg-background-primary/90 sm:h-12 sm:w-auto sm:px-8 cursor-pointer text-xs uppercase tracking-widest font-semibold"
              render={<Link href="/shop" />}
            >
              Shop Collection
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full border-background-primary/30 text-background-primary bg-transparent sm:h-12 sm:w-auto sm:px-8 hover:bg-background-primary/10 hover:border-background-primary cursor-pointer text-xs uppercase tracking-widest font-semibold"
              render={<Link href="/about#craft" />}
            >
              Our Craft
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <Section variant="primary" className="py-24 lg:py-32">
        <div className="mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-wood-medium font-semibold">CATEGORIES</span>
          <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark mt-2">
            Featured Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/${collection.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary rounded-sm border border-border/10 shadow-sm">
                {collection.imageUrl ? (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-background-secondary" />
                )}
              </div>
              <h3 className="mt-4 font-heading text-xl font-medium sm:mt-5 sm:text-2xl text-wood-dark group-hover:text-wood-medium transition-colors duration-300">
                {collection.name}
              </h3>
            </Link>
          ))}
        </div>
      </Section>

      {/* Editorial Preview Section */}
      <Section variant="secondary" id="craft-preview" className="py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden bg-background-primary rounded-sm border border-border/10 shadow-sm">
            {assets.craft_image ? (
              <Image
                src={assets.craft_image}
                alt="Woodworking process detail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-102"
              />
            ) : (
              <div className="h-full w-full bg-background-primary" />
            )}
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-wood-medium font-semibold">THE STUDIO</span>
            <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark mt-2">
              Precision as Art
            </h2>
            <p className="mt-6 text-sm sm:text-base leading-relaxed text-text-secondary md:text-lg">
              We use precision cutters, routers, and fine engineering to bring wood to life. Every item is built with uncompromising care, designed to be a permanent fixture in a temporary world.
            </p>
            <div className="mt-8">
              <Link 
                href="/about"
                className="inline-flex items-center text-xs tracking-widest uppercase font-semibold text-wood-dark hover:text-wood-medium border-b border-wood-dark/40 hover:border-wood-medium/60 pb-1 transition-all duration-300"
              >
                Learn More About Our Story
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <Section className="py-24 lg:py-32">
          <div className="mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-wood-medium font-semibold">CURATED SELECTION</span>
            <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark mt-2">
              Featured Products
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      {/* Dynamic Journal / Storytelling Section */}
      {journalPosts.length > 0 && (
        <Section variant="secondary" className="py-24 lg:py-32 border-t border-border/20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <span className="text-xs uppercase tracking-widest text-wood-medium font-semibold">STORIES & INSIGHTS</span>
              <h2 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark mt-2">
                The Design Journal
              </h2>
            </div>
            <Link
              href="/journal"
              className="inline-flex items-center text-xs tracking-widest uppercase font-semibold text-wood-dark hover:text-wood-medium border-b border-wood-dark/40 hover:border-wood-medium/60 pb-1 transition-all duration-300"
            >
              Read All Stories
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {journalPosts.map((post) => {
              const readingTime = estimateReadingTime(post.content);
              const formattedDate = formatDate(post.publishedAt || post.createdAt);

              return (
                <article key={post.id} className="group flex flex-col space-y-4">
                  {/* Article Thumbnail */}
                  <Link 
                    href={`/journal/${post.slug}`}
                    className="relative block aspect-[3/2] w-full overflow-hidden bg-background-primary rounded-sm border border-border/10 shadow-sm"
                  >
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-background-primary/25">
                        <span className="font-heading text-lg italic text-text-secondary/50">Ahbar & Co.</span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col space-y-2 flex-grow">
                    <div className="flex items-center gap-2.5 text-[10px] tracking-widest uppercase text-wood-medium font-semibold">
                      <span>{readingTime}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
                        {formattedDate}
                      </time>
                    </div>

                    <h3 className="font-heading text-xl font-medium text-wood-dark tracking-tight leading-snug group-hover:text-wood-medium transition-colors duration-300">
                      <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs leading-relaxed text-text-secondary font-serif line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="pt-2 mt-auto">
                      <Link
                        href={`/journal/${post.slug}`}
                        className="inline-flex items-center text-[10px] tracking-widest uppercase font-semibold text-wood-dark group-hover:text-wood-medium border-b border-wood-dark/25 group-hover:border-wood-medium/50 pb-0.5 transition-all"
                      >
                        Read Article
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
