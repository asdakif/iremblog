"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function ReaderRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Failed to create account.");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 dark:bg-stone-950 py-14 px-4">
        <div className="max-w-md mx-auto rounded-2xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 p-6">
          <h1 className="text-2xl font-bold mb-2 text-stone-900 dark:text-stone-100">Create account</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            Save stories and sync them in your profile.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5"
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ink-600 hover:bg-ink-700 text-white py-2.5 font-semibold disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-4">
            Already have an account?{" "}
            <Link href="/account/login" className="text-ink-600 dark:text-ink-400 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
