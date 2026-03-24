import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart2, Eye } from "lucide-react";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Top 10 stories by viewCount
  const topStories = await prisma.story.findMany({
    orderBy: { viewCount: "desc" },
    take: 10,
    include: {
      categories: { include: { category: true } },
    },
  });

  // Last 14 days daily views
  const today = new Date();
  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const dailyViews = await prisma.dailyView.findMany({
    where: {
      date: { in: dates },
    },
  });

  // Group by date and sum counts
  const viewsByDate: Record<string, number> = {};
  for (const date of dates) {
    viewsByDate[date] = 0;
  }
  for (const dv of dailyViews) {
    if (viewsByDate[dv.date] !== undefined) {
      viewsByDate[dv.date] += dv.count;
    }
  }

  const maxCount = Math.max(...Object.values(viewsByDate), 1);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-500 to-warm-500 flex items-center justify-center">
          <BarChart2 size={18} className="text-white" />
        </div>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stats
        </h1>
      </div>

      {/* 14-day bar chart */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wide mb-6">
          Views — Last 14 Days
        </h2>
        <div className="flex items-end gap-1.5 h-40">
          {dates.map((date) => {
            const count = viewsByDate[date];
            const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 4 : 1);
            const shortDate = date.slice(5); // "MM-DD"
            return (
              <div key={date} className="flex flex-col items-center flex-1 gap-1.5 h-full justify-end">
                <span className="text-xs text-stone-500 tabular-nums">
                  {count > 0 ? count : ""}
                </span>
                <div
                  className="w-full rounded-t-sm bg-ink-500/70 hover:bg-ink-400/80 transition-colors"
                  style={{ height: `${heightPct}%` }}
                  title={`${date}: ${count} views`}
                />
                <span
                  className="text-stone-600 tabular-nums"
                  style={{ fontSize: "9px" }}
                >
                  {shortDate}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-600 mt-4">
          Total:{" "}
          <span className="text-stone-400 font-medium">
            {Object.values(viewsByDate).reduce((a, b) => a + b, 0).toLocaleString()} views
          </span>{" "}
          over the last 14 days
        </p>
      </div>

      {/* Top 10 stories */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-700/60">
          <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wide">
            Top Stories by Views
          </h2>
        </div>
        {topStories.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">No stories yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-stone-500 uppercase tracking-wide border-b border-stone-700/40">
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Categories</th>
                <th className="text-right px-5 py-3">
                  <span className="flex items-center justify-end gap-1">
                    <Eye size={12} />
                    Views
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {topStories.map((story, i) => (
                <tr
                  key={story.id}
                  className={`border-b border-stone-700/30 hover:bg-stone-700/30 transition-colors ${
                    i === topStories.length - 1 ? "border-0" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        i === 0
                          ? "text-warm-400"
                          : i === 1
                          ? "text-stone-400"
                          : i === 2
                          ? "text-warm-700"
                          : "text-stone-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-stone-200 line-clamp-1">
                      {story.title}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {story.categories.map((c) => (
                        <span
                          key={c.categoryId}
                          className="px-2 py-0.5 bg-ink-900/30 text-ink-300 rounded-full text-xs"
                        >
                          {c.category.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold text-stone-300 tabular-nums">
                      {story.viewCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
