import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  Folder,
  Tag,
  TrendingUp,
  Clock,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getStats() {
  const [
    totalStories,
    publishedStories,
    draftStories,
    totalComments,
    pendingComments,
    totalCategories,
    totalTags,
    totalSubscribers,
    recentStories,
    recentComments,
  ] = await Promise.all([
    prisma.story.count(),
    prisma.story.count({ where: { published: true } }),
    prisma.story.count({ where: { published: false } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.subscriber.count(),
    prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { categories: { include: { category: true } } },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { story: { select: { title: true, slug: true } } },
    }),
  ]);

  return {
    totalStories,
    publishedStories,
    draftStories,
    totalComments,
    pendingComments,
    totalCategories,
    totalTags,
    totalSubscribers,
    recentStories,
    recentComments,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const stats = await getStats();

  const statCards = [
    {
      label: "Total Stories",
      value: stats.totalStories,
      icon: BookOpen,
      color: "from-ink-500 to-warm-500",
      sub: `${stats.publishedStories} published, ${stats.draftStories} drafts`,
      href: "/admin/stories",
    },
    {
      label: "Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "from-rose-400 to-rose-500",
      sub: stats.pendingComments > 0 ? `${stats.pendingComments} pending review` : "All reviewed",
      href: "/admin/comments",
    },
    {
      label: "Subscribers",
      value: stats.totalSubscribers,
      icon: Mail,
      color: "from-rose-400 to-rose-500",
      sub: "Newsletter subscribers",
      href: "/admin",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      icon: Folder,
      color: "from-sage-400 to-sage-500",
      sub: "Content categories",
      href: "/admin/categories",
    },
    {
      label: "Tags",
      value: stats.totalTags,
      icon: Tag,
      color: "from-warm-400 to-warm-500",
      sub: "Story tags",
      href: "/admin/tags",
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dashboard
          </h1>
          <p className="text-stone-400 text-sm">Welcome back, {session.user?.name}</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-500 hover:bg-ink-600 text-white rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-ink-600/20"
        >
          <PlusCircle size={16} />
          New Story
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="group bg-stone-800 hover:bg-stone-750 border border-stone-700/60 rounded-xl p-5 transition-all hover:border-stone-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-stone-600 group-hover:text-stone-500 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-stone-300">{label}</div>
            <div className="text-xs text-stone-500 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Pending comments banner */}
      {stats.pendingComments > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-warm-500/10 border border-warm-500/20 rounded-xl mb-6">
          <AlertCircle size={18} className="text-warm-400 flex-shrink-0" />
          <p className="text-sm text-warm-300 flex-1">
            You have{" "}
            <span className="font-semibold">{stats.pendingComments} comment{stats.pendingComments !== 1 ? "s" : ""}</span>{" "}
            waiting for review.
          </p>
          <Link
            href="/admin/comments"
            className="text-xs font-semibold text-warm-400 hover:text-warm-300 transition-colors"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent stories */}
        <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent Stories
            </h2>
            <Link
              href="/admin/stories"
              className="text-xs text-ink-400 hover:text-ink-300 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentStories.map((story) => (
              <Link
                key={story.id}
                href={`/admin/stories/${story.id}/edit`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-stone-700/50 transition-all group"
              >
                <div className="mt-0.5">
                  {story.published ? (
                    <CheckCircle size={15} className="text-sage-400" />
                  ) : (
                    <Clock size={15} className="text-stone-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-200 truncate group-hover:text-white transition-colors">
                    {story.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatDate(story.createdAt)} ·{" "}
                    {story.published ? (
                      <span className="text-sage-500">Published</span>
                    ) : (
                      <span className="text-stone-600">Draft</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent comments */}
        <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent Comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-xs text-ink-400 hover:text-ink-300 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentComments.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">No comments yet.</p>
            ) : (
              stats.recentComments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg bg-stone-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-200">
                      {comment.authorName}
                    </span>
                    {comment.approved ? (
                      <span className="text-xs text-sage-400">Approved</span>
                    ) : (
                      <span className="text-xs text-warm-400">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-1">{comment.body}</p>
                  <p className="text-xs text-stone-600">
                    on{" "}
                    <Link
                      href={`/stories/${comment.story.slug}`}
                      className="text-ink-400 hover:text-ink-300 transition-colors"
                    >
                      {comment.story.title}
                    </Link>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
