import Link from "next/link";

type SpotlightStory = {
  slug: string;
  title: string;
  excerpt: string;
  categories?: { category: { name: string; slug: string } }[];
};

interface SpotlightProps {
  story: SpotlightStory;
}

export default function Spotlight({ story }: SpotlightProps) {
  const categories = story.categories?.map((c) => c.category) ?? [];

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-warm-100 via-ink-50/60 to-rose-50/80 dark:from-stone-800 dark:via-stone-800/80 dark:to-stone-900 border border-ink-100/50 dark:border-stone-700/50 shadow-md">
      {/* Decorative top-left quotation mark */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 text-[12rem] leading-none font-serif text-ink-200/40 dark:text-stone-600/30 select-none pointer-events-none"
        style={{ fontFamily: "var(--font-display)", lineHeight: 0.85 }}
      >
        &ldquo;
      </div>

      <div className="relative z-10 px-8 sm:px-14 py-12 sm:py-16">
        {/* Category tags */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ink-100/70 dark:bg-stone-700/70 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-stone-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Pull quote / excerpt */}
        <blockquote className="mb-6">
          <p
            className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-stone-800 dark:text-stone-100 italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {story.excerpt}
          </p>
        </blockquote>

        {/* Story title + link */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2
            className="text-base font-semibold text-stone-600 dark:text-stone-300"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {story.title}
          </h2>
          <Link
            href={`/stories/${story.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors shrink-0"
          >
            Read the full story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Decorative bottom-right quotation mark */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-2 text-[8rem] leading-none font-serif text-ink-200/30 dark:text-stone-600/20 select-none pointer-events-none rotate-180"
        style={{ fontFamily: "var(--font-display)", lineHeight: 0.85 }}
      >
        &ldquo;
      </div>
    </section>
  );
}
