"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Send, User } from "lucide-react";

type Comment = {
  id: number;
  authorName: string;
  body: string;
  createdAt: Date | string;
  approved: boolean;
};

export default function CommentSection({
  storyId,
  comments,
}: {
  storyId: number;
  comments: Comment[];
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const approvedComments = comments.filter((c) => c.approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, authorName: name, body }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      setName("");
      setBody("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16">
      <h2
        className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-8 flex items-center gap-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <MessageCircle size={24} className="text-ink-500" />
        {approvedComments.length > 0
          ? `${approvedComments.length} Comment${approvedComments.length !== 1 ? "s" : ""}`
          : "Leave a Comment"}
      </h2>

      {/* Comments list */}
      {approvedComments.length > 0 && (
        <div className="space-y-6 mb-12">
          {approvedComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 animate-fade-in-up"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-ink-200 to-warm-300 flex items-center justify-center">
                <User size={18} className="text-ink-600" />
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-ink-100/40 dark:border-stone-700/40">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                    {comment.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="bg-warm-50/80 dark:bg-stone-800/60 rounded-2xl p-6 border border-ink-100/40 dark:border-stone-700/40">
        <h3
          className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Share your thoughts
        </h3>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-3">
              <MessageCircle size={24} className="text-sage-600 dark:text-sage-400" />
            </div>
            <p className="font-semibold text-stone-800 dark:text-stone-100">
              Thank you for your comment!
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              It will appear after review.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-ink-600 dark:text-ink-400 hover:underline"
            >
              Leave another comment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full px-4 py-2.5 rounded-xl border border-ink-200/60 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/40 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Comment
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you think of this story?"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-200/60 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/40 text-sm transition-all resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md"
            >
              <Send size={15} />
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
