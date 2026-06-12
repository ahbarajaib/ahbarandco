import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseMarkdown, estimateReadingTime } from "@/lib/markdown";
import { Section } from "@/components/layout/section";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate SEO Metadata for specific journal post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.journalPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || !post.published) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${post.title} | Ahbar & Co.`,
    description: post.excerpt || `Read "${post.title}" on the Ahbar & Co. Journal.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      type: "article",
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await prisma.journalPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  // 404 if post doesn't exist or is not published yet
  if (!post || !post.published) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(post.publishedAt || post.createdAt);

  const parsedContent = parseMarkdown(post.content);

  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium text-text-secondary hover:text-wood-dark transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 text-xs tracking-wider uppercase text-wood-medium font-medium">
            <span>{readingTime}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
              {formattedDate}
            </time>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-wood-dark tracking-tight leading-tight max-w-2xl mx-auto">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-serif italic text-text-secondary text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed pt-2">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-secondary rounded-sm border border-border/10 mb-12 sm:mb-16 shadow-sm">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        )}

        {/* Article Content */}
        <article 
          className="prose prose-stone max-w-2xl mx-auto border-t border-border/40 pt-10 sm:pt-14 text-left"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />

        {/* Footer/Navigation */}
        <div className="border-t border-border/40 mt-16 pt-8 flex items-center justify-between">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-medium text-text-secondary hover:text-wood-dark transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>
          <div className="text-xs text-text-secondary font-serif">
            Ahbar & Co. Editorial Board
          </div>
        </div>
      </div>
    </Section>
  );
}
