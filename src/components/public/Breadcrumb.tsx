import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-stone-400 dark:text-stone-600 flex-shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-stone-700 dark:text-stone-300 font-medium" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
