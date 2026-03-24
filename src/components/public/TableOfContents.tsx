"use client";

import { useEffect, useState, useRef } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type Props = {
  content: string;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const nodes = Array.from(doc.querySelectorAll("h2, h3")) as HTMLElement[];

    const parsed: Heading[] = nodes.map((node) => {
      const text = node.textContent?.trim() || "";
      const id = node.id || slugifyHeading(text);
      return { id, text, level: parseInt(node.tagName[1]) as 2 | 3 };
    });

    setHeadings(parsed);

    // Add IDs to actual DOM headings if missing
    const domHeadings = document.querySelectorAll(".story-content h2, .story-content h3");
    domHeadings.forEach((el) => {
      const text = el.textContent?.trim() || "";
      if (!el.id) {
        (el as HTMLElement).id = slugifyHeading(text);
      }
    });
  }, [content]);

  useEffect(() => {
    if (headings.length < 2) return;

    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-10% 0px -70% 0px",
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-56 shrink-0">
        <div className="bg-warm-50 dark:bg-stone-800/50 border border-warm-200 dark:border-stone-700/40 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <List size={13} />
            Contents
          </p>
          <nav className="space-y-0.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-sm leading-snug py-1 transition-colors rounded px-2 ${
                  h.level === 3 ? "pl-4" : ""
                } ${
                  activeId === h.id
                    ? "text-ink-600 dark:text-ink-300 font-medium bg-ink-50 dark:bg-ink-900/20"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile: collapsible */}
      <div className="xl:hidden mb-6 bg-warm-50 dark:bg-stone-800/50 border border-warm-200 dark:border-stone-700/40 rounded-xl overflow-hidden">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <span className="flex items-center gap-1.5">
            <List size={14} />
            Table of Contents
          </span>
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
        {!collapsed && (
          <nav className="px-4 pb-4 space-y-0.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-sm py-1 transition-colors ${
                  h.level === 3 ? "pl-3" : ""
                } ${
                  activeId === h.id
                    ? "text-ink-600 dark:text-ink-300 font-medium"
                    : "text-stone-500 dark:text-stone-400"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                  setCollapsed(true);
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
