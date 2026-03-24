"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate a short delay (no backend needed)
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
          <CheckCircle size={32} className="text-sage-600 dark:text-sage-400" />
        </div>
        <h2
          className="text-2xl font-bold text-stone-800 dark:text-stone-100"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Message sent!
        </h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-sm">
          Thank you for reaching out. I&apos;ll get back to you as soon as I can.
        </p>
        <button
          onClick={() => {
            setForm({ name: "", email: "", message: "" });
            setSubmitted(false);
          }}
          className="mt-2 text-sm text-ink-600 dark:text-ink-300 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
          >
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-warm-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/50 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
          >
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-warm-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/50 text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
        >
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          value={form.message}
          onChange={handleChange}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-warm-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-400/50 text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-3 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
      >
        <Send size={15} />
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
