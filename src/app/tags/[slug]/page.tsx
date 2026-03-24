import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import StoryCard from "@/components/public/StoryCard";
import { Tag, BookOpen } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  return { title: `#${tag.name} Stories`, description: `Browse stories tagged with ${tag.name}` };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const stories = await prisma.story.findMany({
    where: {
      published: true,
      tags: { some: { tagId: tag.id } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: { where: { approved: true } } } },
    },
  });

  const allTags = await prisma.tag.findMany({
    include: { _count: { select: { stories: { where: { story: { published: true } } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-100/60 dark:bg-warm-900/30 text-warm-700 dark:text-warm-300 text-sm font-medium mb-4">
              <Tag size={14} />
              Tag
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              #{tag.name}
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {/* Tag cloud */}
          <div className="flex flex-wrap gap-2 mb-10">
            {allTags.filter((t) => t._count.stories > 0).map((t) => (
              <a
                key={t.id}
                href={`/tags/${t.slug}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  t.slug === slug
                    ? "bg-warm-500 text-white shadow-md"
                    : "bg-white dark:bg-stone-800 border border-warm-100/60 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:border-warm-300"
                }`}
              >
                #{t.name}
                <span className={`ml-1 text-xs ${t.slug === slug ? "text-warm-100" : "text-stone-400"}`}>
                  {t._count.stories}
                </span>
              </a>
            ))}
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No stories with this tag yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
