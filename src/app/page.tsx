import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import StoryCard from "@/components/public/StoryCard";
import Spotlight from "@/components/public/Spotlight";
import MostRead from "@/components/public/MostRead";
import { BookOpen, Feather, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import { dictionaries, normalizeLocale } from "@/lib/i18n";

async function getData() {
  const [featured, recent, categories, mostRead, spotlight] = await Promise.all([
    prisma.story.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { approved: true } } } },
      },
    }),
    prisma.story.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { approved: true } } } },
      },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { stories: { where: { story: { published: true } } } } },
      },
    }),
    prisma.story.findMany({
      where: { published: true },
      orderBy: { viewCount: "desc" },
      take: 5,
      include: { categories: { include: { category: true } } },
    }),
    prisma.story.findFirst({
      where: { published: true, featured: true },
      orderBy: { viewCount: "desc" },
      include: { categories: { include: { category: true } } },
    }),
  ]);

  return { featured, recent, categories, mostRead, spotlight };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("lang")?.value);
  const t = dictionaries[locale].home;
  const { featured, recent, categories, mostRead, spotlight } = await getData();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-ink-200/30 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-warm-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100/60 dark:bg-ink-900/30 text-ink-700 dark:text-ink-300 text-sm font-medium mb-6">
            <Feather size={14} />
            <span>{t.badge}</span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.titleTop}
            <br />
            <span className="gradient-text">{t.titleAccent}</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="#stories"
              className="px-6 py-3 bg-ink-500 hover:bg-ink-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-ink-300/30 flex items-center gap-2"
            >
              <BookOpen size={18} />
              {t.startReading}
            </Link>
            <Link
              href="/search"
              className="px-6 py-3 border border-ink-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:border-ink-400 dark:hover:border-ink-500 rounded-xl font-semibold transition-all"
            >
              {t.browseStories}
            </Link>
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-3 flex-wrap mt-12">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="px-4 py-2 rounded-full bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-ink-400 dark:hover:border-ink-500 hover:text-ink-700 dark:hover:text-ink-300 shadow-sm transition-all"
              >
                {cat.name}
                <span className="ml-1.5 text-xs text-stone-400 dark:text-stone-500">
                  {cat._count.stories}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Spotlight */}
      {spotlight && <Spotlight story={spotlight} />}

      {/* Featured Stories */}
      {featured.length > 0 && (
        <section className="py-12 px-4 sm:px-6 bg-white/60 dark:bg-stone-800/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {`✦ ${t.featured}`}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((story) => (
                <StoryCard key={story.id} story={story} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Stories + Most Read */}
      <section id="stories" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-10">
            {/* Stories grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.recent}
                </h2>
                <Link
                  href="/search"
                  className="flex items-center gap-1 text-sm font-medium text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
                >
                  {t.viewAll} <ArrowRight size={15} />
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="text-center py-16 text-stone-400 dark:text-stone-500">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">{t.noStories}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recent.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}
            </div>

            {/* Most read sidebar */}
            {mostRead.length > 0 && (
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <MostRead stories={mostRead} />
              </aside>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
