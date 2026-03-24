import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Layers, Clock } from "lucide-react";
import { readingTime, formatDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await prisma.series.findUnique({ where: { slug } });
  if (!series) return {};
  return {
    title: series.name,
    description: series.description ?? undefined,
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      stories: {
        orderBy: { order: "asc" },
        include: {
          story: {
            include: {
              categories: { include: { category: true } },
            },
          },
        },
      },
    },
  });

  if (!series) notFound();

  const publishedEntries = series.stories.filter((ss) => ss.story.published);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Series header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-ink-500 dark:text-ink-400 text-sm font-medium mb-4">
            <Layers size={15} />
            <span>Series</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {series.name}
          </h1>
          {series.description && (
            <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              {series.description}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-ink-100/60 dark:border-stone-700/60">
            <span className="text-sm text-stone-500">
              {publishedEntries.length} stor{publishedEntries.length !== 1 ? "ies" : "y"} in this series
            </span>
          </div>
        </div>

        {/* Stories list */}
        {publishedEntries.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Layers size={40} className="mx-auto mb-4 opacity-30" />
            <p>No published stories in this series yet.</p>
          </div>
        ) : (
          <ol className="space-y-4">
            {publishedEntries.map((entry, i) => {
              const story = entry.story;
              const categories = story.categories.map((c) => c.category);
              return (
                <li key={story.id}>
                  <Link
                    href={`/stories/${story.slug}`}
                    className="group flex items-start gap-5 p-5 rounded-2xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 hover:border-ink-300 dark:hover:border-ink-700 hover:shadow-md transition-all"
                  >
                    {/* Number */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-50 dark:bg-ink-900/30 flex items-center justify-center mt-0.5">
                      <span
                        className="text-lg font-bold text-ink-600 dark:text-ink-400 tabular-nums leading-none"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {i + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="text-xs font-medium text-ink-600 dark:text-ink-400"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2
                        className="text-lg font-semibold text-stone-900 dark:text-stone-100 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors leading-snug mb-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {story.title}
                      </h2>
                      {story.excerpt && (
                        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                          {story.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span>{formatDate(story.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {readingTime(story.content)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}
