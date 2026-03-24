import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import StoryCard from "@/components/public/StoryCard";
import { BookOpen } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return {};
  return { title: `${cat.name} Stories`, description: `Browse all ${cat.name} stories` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const stories = await prisma.story.findMany({
    where: {
      published: true,
      categories: { some: { categoryId: category.id } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: { where: { approved: true } } } },
    },
  });

  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { stories: { where: { story: { published: true } } } } } },
  });

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100/60 dark:bg-ink-900/30 text-ink-700 dark:text-ink-300 text-sm font-medium mb-4">
              <BookOpen size={14} />
              Category
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {category.name}
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {/* Category nav */}
          <div className="flex flex-wrap gap-2 mb-10">
            {allCategories.map((cat) => (
              <a
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat.slug === slug
                    ? "bg-ink-500 text-white shadow-md"
                    : "bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:border-ink-300"
                }`}
              >
                {cat.name}
                <span className={`ml-1.5 text-xs ${cat.slug === slug ? "text-ink-200" : "text-stone-400"}`}>
                  {cat._count.stories}
                </span>
              </a>
            ))}
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No stories in this category yet.</p>
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
