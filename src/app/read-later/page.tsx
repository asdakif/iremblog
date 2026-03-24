"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

type ReadLaterItem = { slug: string; title: string };

export default function ReadLaterPage() {
  const [items, setItems] = useState<ReadLaterItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const cloudRes = await fetch("/api/account/saved?kind=readLater", { cache: "no-store" });
        if (cloudRes.ok) {
          const cloudList = (await cloudRes.json()) as ReadLaterItem[];
          setItems(cloudList);
          localStorage.setItem("readLater", JSON.stringify(cloudList));
          setLoaded(true);
          return;
        }
      } catch {
        // Fall back to local storage below.
      }

      const stored = localStorage.getItem("readLater");
      if (stored) {
        try {
          const list: ReadLaterItem[] = JSON.parse(stored);
          setItems(list);
        } catch {
          setItems([]);
        }
      }
      setLoaded(true);
    }
    void load();
  }, []);

  async function remove(slug: string) {
    const updated = items.filter((i) => i.slug !== slug);
    setItems(updated);
    localStorage.setItem("readLater", JSON.stringify(updated));
    try {
      await fetch(`/api/account/saved?kind=readLater&slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
    } catch {
      // Keep local list even when cloud remove fails.
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 dark:bg-stone-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          {/* Page header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-100 dark:bg-ink-900/30 mb-4">
              <Bookmark
                size={22}
                className="text-ink-500 dark:text-ink-400 fill-ink-500 dark:fill-ink-400"
              />
            </div>
            <h1
              className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Read Later
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Stories you&apos;ve bookmarked for a quiet moment.
            </p>
          </div>

          {!loaded ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-warm-100 dark:bg-stone-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark
                size={40}
                className="mx-auto text-stone-300 dark:text-stone-600 mb-4"
              />
              <p className="text-stone-500 dark:text-stone-400 font-medium mb-1">
                Nothing saved yet
              </p>
              <p className="text-stone-400 dark:text-stone-500 text-sm mb-6">
                Bookmark stories you want to read when you have more time.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
              >
                Explore stories →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-white dark:bg-stone-800 border border-ink-100/60 dark:border-stone-700/60 px-5 py-4 shadow-sm hover:shadow-md hover:border-ink-200 dark:hover:border-ink-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bookmark
                      size={15}
                      className="shrink-0 text-ink-400 fill-ink-400 dark:text-ink-400 dark:fill-ink-400"
                    />
                    <Link
                      href={`/stories/${item.slug}`}
                      className="font-medium text-stone-800 dark:text-stone-100 hover:text-ink-600 dark:hover:text-ink-400 transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                  </div>
                  <button
                    onClick={() => remove(item.slug)}
                    aria-label="Remove from read later"
                    className="shrink-0 text-stone-300 dark:text-stone-600 hover:text-ink-500 dark:hover:text-ink-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
