import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import SearchBar from "@/components/public/SearchBar";
import { formatDate, readingTime, stripHtml } from "@/lib/utils";
import { escapeHtml } from "@/lib/sanitize";
import { Search, BookOpen, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Stories",
};

type Props = { searchParams: Promise<{ q?: string }> };

function highlight(text: string, query: string): string {
  const safeText = escapeHtml(text);
  if (!query) return safeText;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safeText.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function getSnippet(content: string, query: string, length = 200): string {
  const plain = stripHtml(content);
  const lower = plain.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return plain.slice(0, length) + "…";
  const start = Math.max(0, idx - 80);
  const end = Math.min(plain.length, idx + query.length + 120);
  return (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "");
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const stories = query
    ? await prisma.story.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      })
    : [];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100/60 dark:bg-ink-900/30 text-ink-700 dark:text-ink-300 text-sm font-medium mb-4">
              <Search size={14} />
              Search
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find a Story
            </h1>
            <SearchBar />
          </div>

          {/* Results */}
          {query && (
            <div className="mt-10">
              <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">
                {stories.length > 0
                  ? `${stories.length} result${stories.length !== 1 ? "s" : ""} for `
                  : `No stories found for `}
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  &ldquo;{query}&rdquo;
                </span>
              </p>

              {stories.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => {
                    const snippet = getSnippet(story.content, query);
                    const highlightedTitle = highlight(story.title, query);
                    const highlightedSnippet = highlight(snippet, query);
                    const highlightedExcerpt = highlight(story.excerpt, query);

                    return (
                      <Link
                        key={story.id}
                        href={`/stories/${story.slug}`}
                        className="group block bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 rounded-xl p-5 hover:border-ink-300 dark:hover:border-ink-600 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {story.categories.map((c) => (
                            <span
                              key={c.categoryId}
                              className="px-2 py-0.5 rounded-full text-xs font-semibold bg-ink-100 text-ink-700 dark:bg-ink-900/30 dark:text-ink-300"
                            >
                              {c.category.name}
                            </span>
                          ))}
                        </div>
                        <h2
                          className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors [&_mark]:bg-warm-200 [&_mark]:dark:bg-warm-800/50 [&_mark]:text-inherit [&_mark]:rounded"
                          style={{ fontFamily: "var(--font-display)" }}
                          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                        />
                        <p
                          className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-3 [&_mark]:bg-warm-200 [&_mark]:dark:bg-warm-800/50 [&_mark]:text-stone-700 [&_mark]:dark:text-stone-300 [&_mark]:rounded [&_mark]:px-0.5"
                          dangerouslySetInnerHTML={{ __html: highlightedExcerpt || highlightedSnippet }}
                        />
                        <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDate(story.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {readingTime(story.content)}
                          </span>
                          <span className="ml-auto text-ink-500 dark:text-ink-400 font-medium group-hover:underline">
                            Read →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!query && (
            <div className="text-center py-16 text-stone-400 dark:text-stone-500">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Enter a search term to find stories.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
