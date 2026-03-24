import Link from "next/link";
import { BookOpen } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100/60 dark:border-stone-700/60 bg-warm-100/40 dark:bg-stone-800/40">
      {/* Newsletter banner */}
      <div className="border-b border-ink-100/40 dark:border-stone-700/40 bg-gradient-to-r from-ink-50/60 via-warm-50/40 to-rose-50/40 dark:from-stone-800/60 dark:via-stone-800/40 dark:to-stone-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="max-w-xl mx-auto text-center">
            <h3
              className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stay in the story
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">
              New stories delivered to your inbox. No noise, just words.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ink-500 to-warm-500 flex items-center justify-center">
                <BookOpen size={14} className="text-white" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="gradient-text">Irem</span>
                <span className="text-stone-800 dark:text-stone-100"> Blog</span>
              </span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              A warm, literary space for stories about life, love, and the
              things that matter most.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="font-semibold text-stone-800 dark:text-stone-100 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Categories
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/categories/fiction", label: "Fiction" },
                { href: "/categories/memoir", label: "Memoir" },
                { href: "/categories/poetry", label: "Poetry" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-stone-500 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-semibold text-stone-800 dark:text-stone-100 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/search", label: "Search Stories" },
                { href: "/contact", label: "Contact" },
                { href: "/feed.xml", label: "RSS Feed" },
                { href: "/admin", label: "Admin Panel" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-stone-500 dark:text-stone-400 hover:text-ink-600 dark:hover:text-ink-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-100/40 dark:border-stone-700/40 text-center text-xs text-stone-400 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Irem Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
