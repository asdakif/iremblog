"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchCategory = { id: number; name: string; slug: string };

type SearchBarProps = {
  onClose?: () => void;
  initialQuery?: string;
  initialCategory?: string;
  initialPeriod?: string;
  initialSort?: string;
  categories?: SearchCategory[];
};

export default function SearchBar({
  onClose,
  initialQuery = "",
  initialCategory = "",
  initialPeriod = "any",
  initialSort = "relevance",
  categories = [],
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [period, setPeriod] = useState(initialPeriod);
  const [sort, setSort] = useState(initialSort);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const params = new URLSearchParams();
    params.set("q", q);
    if (category) params.set("category", category);
    if (period && period !== "any") params.set("period", period);
    if (sort && sort !== "relevance") params.set("sort", sort);

    try {
      const key = "popularSearches";
      const stored = localStorage.getItem(key);
      const list = stored ? (JSON.parse(stored) as string[]) : [];
      const next = [q, ...list.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Ignore localStorage issues; search should still work.
    }

    router.push(`/search?${params.toString()}`);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories…"
            autoFocus
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-200/60 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/40 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-ink-500 hover:bg-ink-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-ink-200/60 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-ink-200/60 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value="any">Any time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="365d">Last year</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-ink-200/60 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="recent">Sort: Newest</option>
          <option value="popular">Sort: Most viewed</option>
        </select>
      </div>
    </form>
  );
}
