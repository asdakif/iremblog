"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, BookOpen, Moon, Sun } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-warm-50/95 dark:bg-stone-900/95 backdrop-blur-md shadow-sm border-b border-ink-100/40 dark:border-stone-700/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-500 to-warm-500 flex items-center justify-center shadow-md group-hover:shadow-ink-300/50 transition-all">
                <BookOpen size={16} className="text-white" />
              </div>
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="gradient-text">Irem</span>
                <span className="text-stone-800 dark:text-stone-100"> Blog</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-stone-600 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 font-medium transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/categories/fiction"
                className="text-stone-600 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 font-medium transition-colors text-sm"
              >
                Fiction
              </Link>
              <Link
                href="/categories/memoir"
                className="text-stone-600 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 font-medium transition-colors text-sm"
              >
                Memoir
              </Link>
              <Link
                href="/categories/poetry"
                className="text-stone-600 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 font-medium transition-colors text-sm"
              >
                Poetry
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 hover:bg-ink-50 dark:hover:bg-stone-800 transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                onClick={toggleDark}
                className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 hover:bg-ink-50 dark:hover:bg-stone-800 transition-all"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="md:hidden p-2 rounded-full text-stone-500 hover:bg-ink-50 dark:hover:bg-stone-800 transition-all"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-ink-100/40 dark:border-stone-700/40 bg-warm-50/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-3">
            <div className="max-w-6xl mx-auto">
              <SearchBar onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-ink-100/40 dark:border-stone-700/40 bg-warm-50/95 dark:bg-stone-900/95 backdrop-blur-md">
            <nav className="flex flex-col px-4 py-4 gap-1">
              {[
                { href: "/", label: "Home" },
                { href: "/categories/fiction", label: "Fiction" },
                { href: "/categories/memoir", label: "Memoir" },
                { href: "/categories/poetry", label: "Poetry" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-ink-50 dark:hover:bg-stone-800 hover:text-ink-700 dark:hover:text-ink-400 font-medium transition-all"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
