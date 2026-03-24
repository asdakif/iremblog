"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PopularSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("popularSearches");
      if (!stored) return;
      const list = JSON.parse(stored) as string[];
      setItems(list.slice(0, 8));
    } catch {
      setItems([]);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-stone-400 dark:text-stone-500">Popular:</span>
      {items.map((q) => (
        <Link
          key={q}
          href={`/search?q=${encodeURIComponent(q)}`}
          className="px-2.5 py-1 rounded-full text-xs border border-ink-100 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-ink-300 dark:hover:border-ink-600 hover:text-ink-600 dark:hover:text-ink-400"
        >
          {q}
        </Link>
      ))}
    </div>
  );
}
