import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { estimateReadingTime } from "@/lib/markdown";
import { Section } from "@/components/layout/section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Design stories, styling ideas, and woodworking insights from Ahbar & Co.",
};

export default async function JournalPage() {
  const posts = await prisma.journalPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <Section className="py-20 lg:py-28">
      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
        <h1 className="font-heading text-4xl font-medium sm:text-5xl md:text-6xl text-wood-dark tracking-tight">
          The Journal
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-sm text-text-secondary sm:text-base md:text-lg font-serif italic leading-relaxed">
          Design stories, styling ideas, and woodworking insights from our workshop.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-sm max-w-2xl mx-auto bg-background-secondary/5">
          <p className="text-sm font-serif italic text-text-secondary">
            No journal articles published yet. Check back soon for stories from our makers.
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Featured Post (Latest) */}
          {featuredPost && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center border-b border-border/40 pb-20 mb-20">
              <div className="lg:col-span-7">
                <Link 
                  href={`/journal/${featuredPost.slug}`}
                  className="relative block aspect-[16/10] w-full overflow-hidden bg-background-secondary rounded-sm border border-border/10 group shadow-sm"
                >
                  {featuredPost.coverImageUrl ? (
                    <img
                      src={featuredPost.coverImageUrl}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-background-secondary/25">
                      <span className="font-heading text-2xl italic text-text-secondary/30">Ahbar & Co.</span>
                    </div>
                  )}
                </Link>
              </div>

              <div className="lg:col-span-5 flex flex-col space-y-4 lg:py-4">
                <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-wood-medium font-semibold">
                  <span className="bg-background-secondary px-2 py-0.5 rounded-sm">Featured</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{estimateReadingTime(featuredPost.content)}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <time dateTime={featuredPost.publishedAt?.toISOString() || featuredPost.createdAt.toISOString()}>
                    {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                  </time>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-wood-dark tracking-tight leading-tight hover:text-wood-medium transition-colors duration-300">
                  <Link href={`/journal/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>

                {featuredPost.excerpt && (
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary font-serif">
                    {featuredPost.excerpt}
                  </p>
                )}

                <div className="pt-4">
                  <Link
                    href={`/journal/${featuredPost.slug}`}
                    className="inline-flex items-center text-xs tracking-widest uppercase font-semibold text-wood-dark hover:text-wood-medium border-b border-wood-dark/40 hover:border-wood-medium/60 pb-1 transition-all duration-300 hover:translate-x-1"
                  >
                    Read Featured Article
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Posts Grid */}
          {remainingPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
              {remainingPosts.map((post) => {
                const readingTime = estimateReadingTime(post.content);
                const formattedDate = formatDate(post.publishedAt || post.createdAt);

                return (
                  <article key={post.id} className="group flex flex-col space-y-4">
                    {/* Cover Image */}
                    <Link 
                      href={`/journal/${post.slug}`}
                      className="relative block aspect-[3/2] w-full overflow-hidden bg-background-secondary rounded-sm border border-border/10 shadow-sm"
                    >
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-background-secondary/25">
                          <span className="font-heading text-lg italic text-text-secondary/50">Ahbar & Co.</span>
                        </div>
                      )}
                    </Link>

                    {/* Article Info */}
                    <div className="flex flex-col space-y-2 flex-grow">
                      <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-wood-medium font-semibold">
                        <span>{readingTime}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
                          {formattedDate}
                        </time>
                      </div>

                      <h3 className="font-heading text-2xl font-medium text-wood-dark tracking-tight leading-tight group-hover:text-wood-medium transition-colors duration-300">
                        <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm leading-relaxed text-text-secondary font-serif line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="pt-2 mt-auto">
                        <Link
                          href={`/journal/${post.slug}`}
                          className="inline-flex items-center text-xs tracking-widest uppercase font-medium text-wood-dark group-hover:text-wood-medium border-b border-wood-dark/25 group-hover:border-wood-medium/50 pb-0.5 transition-all"
                        >
                          Read Article
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
