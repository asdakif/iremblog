import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  BarChart2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import DeleteStoryButton from "@/components/admin/DeleteStoryButton";
import CloneStoryButton from "@/components/admin/CloneStoryButton";

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: { include: { category: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stories
        </h1>
        <Link
          href="/admin/stories/new"
          className="flex items-center gap-2 px-4 py-2 bg-ink-500 hover:bg-ink-600 text-white rounded-xl text-sm font-medium transition-all shadow-md"
        >
          <PlusCircle size={16} />
          New Story
        </Link>
      </div>

      {/* Table */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        {stories.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <p className="mb-4">No stories yet.</p>
            <Link href="/admin/stories/new" className="text-ink-400 hover:text-ink-300 transition-colors text-sm">
              Create your first story →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-700/60 text-xs text-stone-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3.5">Title</th>
                <th className="text-left px-5 py-3.5 hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 hidden sm:table-cell">Date</th>
                <th className="text-center px-5 py-3.5">Status</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story, i) => (
                <tr
                  key={story.id}
                  className={`border-b border-stone-700/30 hover:bg-stone-700/30 transition-colors ${
                    i === stories.length - 1 ? "border-0" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-stone-200 line-clamp-1">
                        {story.title}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{story._count.comments} comments</span>
                        <span className="flex items-center gap-0.5">
                          <BarChart2 size={11} />
                          {story.viewCount.toLocaleString()} views
                        </span>
                      </p>
                    </div>
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
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs text-stone-500">{formatDate(story.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {story.published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-900/30 text-sage-400 text-xs font-medium">
                        <CheckCircle size={11} />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-700 text-stone-400 text-xs font-medium">
                        <Clock size={11} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {story.published && (
                        <Link
                          href={`/stories/${story.slug}`}
                          target="_blank"
                          className="p-1.5 text-stone-500 hover:text-ink-300 rounded-lg hover:bg-stone-700 transition-all"
                          title="View"
                        >
                          <Eye size={15} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/stories/${story.id}/edit`}
                        className="p-1.5 text-stone-500 hover:text-ink-300 rounded-lg hover:bg-stone-700 transition-all"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <CloneStoryButton storyId={story.id} />
                      <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
                    </div>
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
