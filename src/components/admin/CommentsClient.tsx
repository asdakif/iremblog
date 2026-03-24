"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Trash2, MessageSquare, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Comment = {
  id: number;
  authorName: string;
  body: string;
  approved: boolean;
  createdAt: Date | string;
  story: { id: number; title: string; slug: string };
};

export default function CommentsClient({
  initialComments,
}: {
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const pending = comments.filter((c) => !c.approved).length;

  const filteredIds = filtered.map((c) => c.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, approved } : c)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/comments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved: true }),
        })
      )
    );
    setComments((prev) =>
      prev.map((c) => (selected.has(c.id) ? { ...c, approved: true } : c))
    );
    setSelected(new Set());
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} comment${selected.size > 1 ? "s" : ""}?`)) return;
    setBulkLoading(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/comments/${id}`, { method: "DELETE" })
      )
    );
    setComments((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setBulkLoading(false);
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-ink-500 text-white"
                : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200 border border-stone-700/60"
            }`}
          >
            {f}
            {f === "pending" && pending > 0 && (
              <span className="ml-1.5 text-xs bg-warm-500 text-white rounded-full px-1.5">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-stone-700/50 border border-stone-600/60 rounded-xl">
          <span className="text-xs text-stone-400 mr-1">
            {selected.size} selected
          </span>
          <button
            onClick={handleBulkApprove}
            disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sage-300 hover:text-sage-200 bg-sage-900/20 hover:bg-sage-900/40 rounded-lg border border-sage-700/30 transition-all disabled:opacity-50"
          >
            <CheckCircle size={13} />
            Approve selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-900/10 hover:bg-rose-900/20 rounded-lg border border-rose-700/20 transition-all disabled:opacity-50"
          >
            <Trash2 size={13} />
            Delete selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-stone-500 hover:text-stone-300 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-1">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-stone-600 bg-stone-700 accent-ink-500 cursor-pointer"
            />
            <span className="text-xs text-stone-500">Select all on this page</span>
          </div>

          {filtered.map((comment) => (
            <div
              key={comment.id}
              className={`bg-stone-800 border rounded-xl p-5 transition-all ${
                selected.has(comment.id)
                  ? "border-ink-500/40 bg-ink-900/10"
                  : !comment.approved
                  ? "border-warm-700/30 bg-warm-900/10"
                  : "border-stone-700/60"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                  className="mt-1 w-4 h-4 rounded border-stone-600 bg-stone-700 accent-ink-500 cursor-pointer flex-shrink-0"
                />

                <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-stone-200 text-sm">
                        {comment.authorName}
                      </span>
                      {comment.approved ? (
                        <span className="flex items-center gap-1 text-xs text-sage-400">
                          <CheckCircle size={12} />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-warm-400">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-400 leading-relaxed mb-2">{comment.body}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <span>{formatDate(comment.createdAt)}</span>
                      <span>·</span>
                      <span>on </span>
                      <Link
                        href={`/stories/${comment.story.slug}`}
                        target="_blank"
                        className="text-ink-400 hover:text-ink-300 transition-colors truncate"
                      >
                        {comment.story.title}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!comment.approved ? (
                      <button
                        onClick={() => handleApprove(comment.id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sage-300 hover:text-sage-200 bg-sage-900/20 hover:bg-sage-900/40 rounded-lg border border-sage-700/30 transition-all"
                      >
                        <CheckCircle size={13} />
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(comment.id, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-700/40 hover:bg-stone-700 rounded-lg transition-all"
                      >
                        <XCircle size={13} />
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-700 transition-all"
                      title="Delete comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
