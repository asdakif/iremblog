"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

type ReadLaterItem = { slug: string; title: string };

interface ReadLaterButtonProps {
  slug: string;
  title: string;
}

export default function ReadLaterButton({ slug, title }: ReadLaterButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("readLater");
    if (!stored) return;
    try {
      const list: ReadLaterItem[] = JSON.parse(stored);
      setSaved(list.some((item) => item.slug === slug));
    } catch {
      // ignore corrupt data
    }
  }, [slug]);

  function toggle() {
    const stored = localStorage.getItem("readLater");
    let list: ReadLaterItem[] = [];
    try {
      if (stored) list = JSON.parse(stored);
    } catch {
      list = [];
    }

    let next: boolean;
    if (saved) {
      list = list.filter((item) => item.slug !== slug);
      next = false;
    } else {
      list = [...list.filter((item) => item.slug !== slug), { slug, title }];
      next = true;
    }

    localStorage.setItem("readLater", JSON.stringify(list));
    setSaved(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove from read later" : "Save for later"}
      aria-pressed={saved}
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5
        text-sm font-medium border transition-all duration-200
        ${
          saved
            ? "bg-ink-50 dark:bg-ink-900/20 border-ink-200 dark:border-ink-800/50 text-ink-600 dark:text-ink-400"
            : "bg-warm-50 dark:bg-stone-800 border-ink-100/60 dark:border-stone-700/60 text-stone-500 dark:text-stone-400 hover:border-ink-200 dark:hover:border-ink-700 hover:text-ink-600 dark:hover:text-ink-400"
        }
      `}
    >
      <Bookmark
        size={15}
        className={`
          transition-all duration-200
          ${saved ? "fill-ink-500 text-ink-500 dark:fill-ink-400 dark:text-ink-400" : "fill-transparent"}
        `}
      />
      <span>{saved ? "Saved" : "Read Later"}</span>
    </button>
  );
}
