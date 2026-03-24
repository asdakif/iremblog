import Link from "next/link";

type StoryRef = {
  slug: string;
  title: string;
};

interface StoryNavProps {
  prevStory?: StoryRef;
  nextStory?: StoryRef;
}

export default function StoryNav({ prevStory, nextStory }: StoryNavProps) {
  if (!prevStory && !nextStory) return null;

  return (
    <nav
      aria-label="Story navigation"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12"
    >
      {/* Previous */}
      <div className={!prevStory ? "hidden sm:block" : ""}>
        {prevStory ? (
          <Link
            href={`/stories/${prevStory.slug}`}
            className="group flex flex-col gap-1 rounded-xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 px-5 py-4 shadow-sm hover:shadow-md hover:border-ink-200 dark:hover:border-ink-700 transition-all"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide group-hover:text-ink-500 dark:group-hover:text-ink-400 transition-colors">
              <span aria-hidden="true">←</span> Previous
            </span>
            <span
              className="text-stone-800 dark:text-stone-100 font-medium leading-snug line-clamp-2 group-hover:text-ink-700 dark:group-hover:text-ink-300 transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {prevStory.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next */}
      <div className={!nextStory ? "hidden sm:block" : ""}>
        {nextStory ? (
          <Link
            href={`/stories/${nextStory.slug}`}
            className="group flex flex-col gap-1 rounded-xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 px-5 py-4 shadow-sm hover:shadow-md hover:border-ink-200 dark:hover:border-ink-700 transition-all text-right"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide group-hover:text-ink-500 dark:group-hover:text-ink-400 transition-colors">
              Next <span aria-hidden="true">→</span>
            </span>
            <span
              className="text-stone-800 dark:text-stone-100 font-medium leading-snug line-clamp-2 group-hover:text-ink-700 dark:group-hover:text-ink-300 transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {nextStory.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
