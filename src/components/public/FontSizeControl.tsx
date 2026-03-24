"use client";

import { useEffect, useState } from "react";

type FontSize = "small" | "default" | "large";

const SIZE_CLASS: Record<FontSize, string> = {
  small: "text-base",
  default: "text-lg",
  large: "text-xl",
};

const SIZE_LABEL: Record<FontSize, string> = {
  small: "A-",
  default: "A",
  large: "A+",
};

const ALL_SIZE_CLASSES = Object.values(SIZE_CLASS);

export default function FontSizeControl() {
  const [current, setCurrent] = useState<FontSize>("default");

  useEffect(() => {
    const stored = localStorage.getItem("fontSize") as FontSize | null;
    const size: FontSize =
      stored && SIZE_CLASS[stored] ? stored : "default";
    apply(size);
    setCurrent(size);
  }, []);

  function apply(size: FontSize) {
    const root = document.documentElement;
    ALL_SIZE_CLASSES.forEach((cls) => root.classList.remove(cls));
    root.classList.add(SIZE_CLASS[size]);
    localStorage.setItem("fontSize", size);
  }

  function handleClick(size: FontSize) {
    apply(size);
    setCurrent(size);
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full bg-warm-100/80 dark:bg-stone-800/80 border border-ink-100/60 dark:border-stone-700/60 px-1.5 py-1 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label="Font size control"
    >
      {(["small", "default", "large"] as FontSize[]).map((size) => (
        <button
          key={size}
          onClick={() => handleClick(size)}
          aria-label={`Font size ${size}`}
          aria-pressed={current === size}
          className={`
            rounded-full w-7 h-7 flex items-center justify-center font-semibold
            transition-all duration-150 select-none
            ${
              current === size
                ? "bg-ink-600 dark:bg-ink-500 text-white shadow-sm"
                : "text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-stone-700"
            }
            ${size === "small" ? "text-xs" : size === "default" ? "text-sm" : "text-base"}
          `}
        >
          {SIZE_LABEL[size]}
        </button>
      ))}
    </div>
  );
}
