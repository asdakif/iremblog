import Link from "next/link";
import { TrendingUp } from "lucide-react";

type MostReadStory = {
  slug: string;
  title: string;
  viewCount: number;
  categories?: { category: { name: string; slug: string } }[];
};

interface MostReadProps {
  stories: MostReadStory[];
}

export default function MostRead({ stories }: MostReadProps) {
  const top = stories.slice(0, 5);

  if (top.length === 0) return null;

  return (
    <aside className="rounded-xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
      {/* Heading */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-ink-100/60 dark:border-stone-700/60 bg-warm-50/60 dark:bg-stone-800/60">
        <TrendingUp size={15} className="text-ink-500 dark:text-ink-400" />
        <h2
          className="text-sm font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Most Read
        </h2>
      </div>

      {/* List */}
      <ol className="divide-y divide-ink-50/80 dark:divide-stone-700/60">
        {top.map((story, index) => {
          const category = story.categories?.[0]?.category;
          return (
            <li key={story.slug}>
              <Link
                href={`/stories/${story.slug}`}
                className="group flex items-start gap-3.5 px-5 py-3.5 hover:bg-warm-50/60 dark:hover:bg-stone-700/40 transition-colors"
              >
                {/* Rank number */}
                <span
                  className={`
                    shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
                    ${
                      index === 0
                        ? "bg-ink-500 text-white"
                        : index === 1
                        ? "bg-ink-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200"
                        : index === 2
                        ? "bg-warm-200 dark:bg-warm-800/60 text-warm-700 dark:text-warm-300"
                        : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
                    }
                  `}
                >
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {story.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        {category.name}
                      </span>
                    )}
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {story.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
