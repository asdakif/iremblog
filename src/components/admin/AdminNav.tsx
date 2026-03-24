"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Folder,
  MessageSquare,
  LogOut,
  ChevronRight,
  Feather,
  BarChart2,
  Mail,
  Layers,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/stats", label: "Stats", icon: BarChart2 },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/series", label: "Series", icon: Layers },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-stone-900 dark:bg-stone-950 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-stone-700/60">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-500 to-warm-500 flex items-center justify-center">
            <Feather size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Irem Blog
            </p>
            <p className="text-stone-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    active
                      ? "bg-ink-600/20 text-ink-300 border border-ink-600/20"
                      : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                  }`}
                >
                  <Icon size={18} className={active ? "text-ink-400" : "group-hover:text-stone-300"} />
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {active && <ChevronRight size={14} className="text-ink-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-700/60">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-all text-sm mb-1"
        >
          <BookOpen size={16} />
          View Blog
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-400 hover:bg-rose-900/20 hover:text-rose-300 transition-all text-sm"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
