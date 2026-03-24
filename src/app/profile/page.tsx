"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

type ReaderUser = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ReaderUser | null>(null);
  const [favorites, setFavorites] = useState(0);
  const [readLater, setReadLater] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/account/me", { cache: "no-store" });
      const meData = (await meRes.json()) as { user: ReaderUser | null };
      if (!meData.user) {
        router.push("/account/login");
        return;
      }
      setUser(meData.user);

      const [favRes, readRes] = await Promise.all([
        fetch("/api/account/saved?kind=favorite", { cache: "no-store" }),
        fetch("/api/account/saved?kind=readLater", { cache: "no-store" }),
      ]);
      if (favRes.ok) {
        const list = (await favRes.json()) as Array<{ slug: string; title: string }>;
        setFavorites(list.length);
      }
      if (readRes.ok) {
        const list = (await readRes.json()) as Array<{ slug: string; title: string }>;
        setReadLater(list.length);
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-50 dark:bg-stone-950 py-14 px-4">
        <div className="max-w-2xl mx-auto rounded-2xl border border-ink-100/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 p-6">
          {loading ? (
            <p className="text-stone-500 dark:text-stone-400">Loading profile...</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Your profile</h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1">
                {user?.name || "Reader"} ({user?.email})
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-ink-100 dark:border-stone-700 p-4">
                  <p className="text-sm text-stone-500 dark:text-stone-400">Favorites</p>
                  <p className="text-2xl font-bold mt-1">{favorites}</p>
                </div>
                <div className="rounded-xl border border-ink-100 dark:border-stone-700 p-4">
                  <p className="text-sm text-stone-500 dark:text-stone-400">Read later</p>
                  <p className="text-2xl font-bold mt-1">{readLater}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="mt-6 rounded-xl border border-ink-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold hover:bg-ink-50 dark:hover:bg-stone-700"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
