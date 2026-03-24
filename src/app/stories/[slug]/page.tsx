import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CommentSection from "@/components/public/CommentSection";
import ReadingProgress from "@/components/public/ReadingProgress";
import ShareButtons from "@/components/public/ShareButtons";
import TableOfContents from "@/components/public/TableOfContents";
import Breadcrumb from "@/components/public/Breadcrumb";
import ViewTracker from "@/components/public/ViewTracker";
import ReadDepthTracker from "@/components/public/ReadDepthTracker";
import FontSizeControl from "@/components/public/FontSizeControl";
import FavoriteButton from "@/components/public/FavoriteButton";
import ReadLaterButton from "@/components/public/ReadLaterButton";
import StoryNav from "@/components/public/StoryNav";
import JsonLd from "@/components/public/JsonLd";
import { formatDate, readingTime } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";
import { verifyReaderSessionToken } from "@/lib/readerAuth";
import { Calendar, Clock, Eye } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await prisma.story.findUnique({ where: { slug, published: true } });
  if (!story) return {};
  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: story.coverImage
        ? [story.coverImage]
        : [`/og?title=${encodeURIComponent(story.title)}`],
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug, published: true },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      series: {
        include: {
          series: {
            include: {
              stories: {
                orderBy: { order: "asc" },
                include: { story: { select: { id: true, slug: true, title: true, published: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!story) notFound();

  const cookieStore = await cookies();
  const readerToken = cookieStore.get("reader_session")?.value;
  const readerPayload = verifyReaderSessionToken(readerToken);
  let hasNewsletterAccess = false;
  if (readerPayload?.userId) {
    const reader = await prisma.readerUser.findUnique({
      where: { id: readerPayload.userId },
      select: { email: true },
    });
    if (reader?.email) {
      const subscriber = await prisma.subscriber.findUnique({
        where: { email: reader.email },
        select: { id: true },
      });
      hasNewsletterAccess = !!subscriber;
    }
  }
  const canReadPremium = !story.isPremium || hasNewsletterAccess;

  const categories = story.categories.map((c) => c.category);
  const tags = story.tags.map((t) => t.tag);
  const safeStoryContent = sanitizeRichText(story.content);
  const activeSeries = story.series[0]?.series;
  const publishedSeriesStories =
    activeSeries?.stories.filter((entry) => entry.story.published).map((entry) => entry.story) ?? [];
  const seriesIndex = publishedSeriesStories.findIndex((entry) => entry.id === story.id);
  const nextInSeries =
    seriesIndex >= 0 && seriesIndex + 1 < publishedSeriesStories.length
      ? publishedSeriesStories[seriesIndex + 1]
      : null;

  const allComments = await prisma.comment.findMany({
    where: { storyId: story.id, approved: true },
    orderBy: { createdAt: "desc" },
  });

  const related = await prisma.story.findMany({
    where: {
      published: true,
      id: { not: story.id },
      OR: [
        { categories: { some: { categoryId: { in: story.categories.map((c) => c.categoryId) } } } },
        { tags: { some: { tagId: { in: story.tags.map((t) => t.tagId) } } } },
      ],
    },
    take: 3,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });

  // Prev / next story by createdAt
  const [prevStory, nextStory] = await Promise.all([
    prisma.story.findFirst({
      where: { published: true, createdAt: { lt: story.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.story.findFirst({
      where: { published: true, createdAt: { gt: story.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(categories[0] ? [{ label: categories[0].name, href: `/categories/${categories[0].slug}` }] : []),
    { label: story.title },
  ];

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <ViewTracker storyId={story.id} />
      <ReadDepthTracker storyId={story.id} />
      <JsonLd
        headline={story.title}
        description={story.excerpt}
        datePublished={story.createdAt.toISOString()}
        imageUrl={story.coverImage ?? undefined}
        url={`/stories/${story.slug}`}
      />
      <Header />

      {/* Hero image */}
      {story.coverImage && (
        <div className="relative h-72 md:h-[480px] overflow-hidden">
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIhAAAQMEAgMAAAAAAAAAAAAAAQIDBAAFERIhMUH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Anc="
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-warm-50/80 dark:to-stone-900/80" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-10">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Breadcrumb items={breadcrumbs} />

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4 mt-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-ink-100 text-ink-700 dark:bg-ink-900/30 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800/40 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Title + action buttons */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1
                  className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {story.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  {story.isPremium && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      Premium
                    </span>
                  )}
                  {story.sponsorLabel && (
                    story.sponsorUrl ? (
                      <a
                        href={story.sponsorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warm-100 text-warm-700 dark:bg-warm-900/30 dark:text-warm-300 hover:underline"
                      >
                        Sponsored: {story.sponsorLabel}
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warm-100 text-warm-700 dark:bg-warm-900/30 dark:text-warm-300">
                        Sponsored: {story.sponsorLabel}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                <FavoriteButton slug={story.slug} title={story.title} />
                <ReadLaterButton slug={story.slug} title={story.title} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500 dark:text-stone-400 mb-6 pb-6 border-b border-ink-100/60 dark:border-stone-700/60">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(story.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readingTime(safeStoryContent)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {story.viewCount.toLocaleString()} views
                </span>
              </div>
              <FontSizeControl />
            </div>

            {/* Excerpt */}
            {story.excerpt && (
              <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed mb-8 italic border-l-4 border-ink-300 pl-5">
                {story.excerpt}
              </p>
            )}

            {/* Content */}
            {canReadPremium ? (
              <div
                id="story-content"
                className="story-content"
                dangerouslySetInnerHTML={{ __html: safeStoryContent }}
              />
            ) : (
              <div className="rounded-2xl border border-ink-100/60 dark:border-stone-700/60 bg-white/70 dark:bg-stone-800/50 p-6">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">
                  Premium content
                </p>
                <p className="text-stone-600 dark:text-stone-300 mb-4">
                  This story is available to newsletter subscribers. Subscribe (or resubscribe) to unlock full content.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-xl bg-ink-600 hover:bg-ink-700 text-white text-sm font-semibold"
                  >
                    Manage subscription
                  </Link>
                  <Link
                    href="/account/login"
                    className="px-4 py-2 rounded-xl border border-ink-200 dark:border-stone-600 text-sm font-semibold"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* Tags + Share */}
            <div className="mt-10 pt-6 border-t border-ink-100/60 dark:border-stone-700/60 space-y-4">
              {activeSeries && seriesIndex >= 0 && (
                <div className="rounded-xl border border-ink-100/60 dark:border-stone-700/60 bg-ink-50/50 dark:bg-stone-800/40 p-4">
                  <p className="text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wide mb-1">
                    Series progress
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    {activeSeries.name}: Part {seriesIndex + 1} of {publishedSeriesStories.length}
                  </p>
                  {nextInSeries && (
                    <Link
                      href={`/stories/${nextInSeries.slug}`}
                      className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-ink-600 dark:text-ink-400 hover:underline"
                    >
                      Continue to next part: {nextInSeries.title} →
                    </Link>
                  )}
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-ink-200 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-ink-400 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-all"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
              <ShareButtons title={story.title} />
            </div>

            {/* Prev / Next navigation */}
            <StoryNav prevStory={prevStory ?? undefined} nextStory={nextStory ?? undefined} />

            {/* Comments */}
            {canReadPremium && <CommentSection storyId={story.id} comments={allComments} />}

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-16 pt-8 border-t border-ink-100/60 dark:border-stone-700/60">
                <h2
                  className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  You might also like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((s) => (
                    <Link
                      key={s.id}
                      href={`/stories/${s.slug}`}
                      className="group p-4 rounded-xl border border-ink-100/60 dark:border-stone-700/60 hover:border-ink-300 dark:hover:border-ink-600 bg-white dark:bg-stone-800 hover:shadow-md transition-all"
                    >
                      <p className="text-xs text-ink-500 dark:text-ink-400 mb-1">
                        {s.categories[0]?.category.name}
                      </p>
                      <h3
                        className="font-semibold text-stone-800 dark:text-stone-100 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors text-sm leading-snug"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* TOC sidebar */}
          <aside className="hidden xl:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={safeStoryContent} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
