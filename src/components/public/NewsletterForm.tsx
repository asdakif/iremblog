"use client";

import { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setStatus("success");
        setMessage("You're subscribed! Thank you for joining.");
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-warm-50 dark:bg-stone-800/60 border border-warm-200 dark:border-stone-700/60 rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-100 dark:bg-ink-900/40 mb-4">
          <Mail size={22} className="text-ink-600 dark:text-ink-300" />
        </div>
        <h3
          className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stay in the story
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          New stories delivered to your inbox. No noise, just words worth reading.
        </p>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-700/40 rounded-xl text-sage-700 dark:text-sage-300">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-stone-800 border border-warm-200 dark:border-stone-600 rounded-xl text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="px-5 py-2.5 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex-shrink-0"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle size={13} />
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
