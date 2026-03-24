import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { formatDate, readingTime } from "@/lib/utils";

type Category = { id: number; name: string; slug: string };
type Tag = { id: number; name: string; slug: string };

type Story = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  isPremium?: boolean;
  sponsorLabel?: string | null;
  sponsorUrl?: string | null;
  createdAt: Date | string;
  content: string;
  categories: { category: Category }[];
  tags: { tag: Tag }[];
  _count?: { comments: number };
};

const CATEGORY_COLORS: Record<string, string> = {
  fiction: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  memoir: "bg-warm-100 text-warm-700 dark:bg-warm-900/30 dark:text-warm-300",
  poetry: "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300",
};

function getCategoryColor(slug: string) {
  return CATEGORY_COLORS[slug] || "bg-ink-100 text-ink-700 dark:bg-ink-900/30 dark:text-ink-300";
}

export default function StoryCard({ story, featured = false }: { story: Story; featured?: boolean }) {
  const categories = story.categories.map((c) => c.category);
  const tags = story.tags.map((t) => t.tag);

  if (featured) {
    return (
      <article className="story-card group rounded-2xl overflow-hidden bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 shadow-sm">
        <Link href={`/stories/${story.slug}`} className="block">
          <div className="relative h-64 md:h-80 overflow-hidden">
            {story.coverImage ? (
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-ink-200 to-warm-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {story.isPremium && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/80 text-white">
                    Premium
                  </span>
                )}
                {story.sponsorLabel && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warm-500/80 text-white">
                    Sponsored
                  </span>
                )}
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-white leading-snug mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {story.title}
              </h2>
            </div>
          </div>
        </Link>
        <div className="p-6">
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4 line-clamp-2">
            {story.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(story.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {readingTime(story.content)}
              </span>
              {story._count && (
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  {story._count.comments}
                </span>
              )}
            </div>
            <Link
              href={`/stories/${story.slug}`}
              className="text-sm font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
            >
              Read →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="story-card group rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 shadow-sm flex flex-col">
      <Link href={`/stories/${story.slug}`} className="block">
        <div className="relative h-44 overflow-hidden">
          {story.coverImage ? (
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ink-100 via-warm-200 to-rose-100" />
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {story.isPremium && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              Premium
            </span>
          )}
          {story.sponsorLabel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warm-100 text-warm-700 dark:bg-warm-900/30 dark:text-warm-300">
              Sponsored
            </span>
          )}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(cat.slug)}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <Link href={`/stories/${story.slug}`}>
          <h3
            className="font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors line-clamp-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
          >
            {story.title}
          </h3>
        </Link>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 flex-1 mb-4">
          {story.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-ink-50 dark:border-stone-700">
          <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(story.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {readingTime(story.content)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="text-xs text-stone-400 dark:text-stone-500 hover:text-ink-500 dark:hover:text-ink-400 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
