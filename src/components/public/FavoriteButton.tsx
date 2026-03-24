"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type FavoriteItem = { slug: string; title: string };

interface FavoriteButtonProps {
  slug: string;
  title: string;
}

export default function FavoriteButton({ slug, title }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (!stored) return;
    try {
      const list: FavoriteItem[] = JSON.parse(stored);
      setFavorited(list.some((item) => item.slug === slug));
    } catch {
      // ignore corrupt data
    }
  }, [slug]);

  function toggle() {
    const stored = localStorage.getItem("favorites");
    let list: FavoriteItem[] = [];
    try {
      if (stored) list = JSON.parse(stored);
    } catch {
      list = [];
    }

    let next: boolean;
    if (favorited) {
      list = list.filter((item) => item.slug !== slug);
      next = false;
    } else {
      list = [...list.filter((item) => item.slug !== slug), { slug, title }];
      next = true;
    }

    localStorage.setItem("favorites", JSON.stringify(list));
    setFavorited(next);

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <button
      onClick={toggle}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={`
        group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5
        text-sm font-medium border transition-all duration-200
        ${
          favorited
            ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400"
            : "bg-warm-50 dark:bg-stone-800 border-ink-100/60 dark:border-stone-700/60 text-stone-500 dark:text-stone-400 hover:border-rose-200 dark:hover:border-rose-800/50 hover:text-rose-500 dark:hover:text-rose-400"
        }
      `}
    >
      <Heart
        size={15}
        className={`
          transition-all duration-200
          ${animating ? "scale-125" : "scale-100"}
          ${favorited ? "fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" : "fill-transparent"}
        `}
      />
      <span>{favorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
