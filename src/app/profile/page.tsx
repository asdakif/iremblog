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
  const [nameInput, setNameInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/account/me", { cache: "no-store" });
      const meData = (await meRes.json()) as { user: ReaderUser | null };
      if (!meData.user) {
        router.push("/account/login");
        return;
      }
      setUser(meData.user);
      setNameInput(meData.user.name || "");

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

      const newsletterRes = await fetch("/api/account/newsletter", { cache: "no-store" });
      if (newsletterRes.ok) {
        const newsletterData = (await newsletterRes.json()) as { subscribed: boolean };
        setNewsletterSubscribed(newsletterData.subscribed);
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

  async function saveProfile() {
    setSaving(true);
    setSaveError("");
    setSaveMessage("");
    const res = await fetch("/api/account/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string; user?: ReaderUser };
    setSaving(false);
    if (!res.ok) {
      setSaveError(data.error || "Failed to update profile.");
      return;
    }
    if (data.user) {
      setUser(data.user);
    }
    setCurrentPassword("");
    setNewPassword("");
    setSaveMessage("Profile updated.");
  }

  async function toggleNewsletter() {
    setNewsletterLoading(true);
    setNewsletterMessage("");
    const method = newsletterSubscribed ? "DELETE" : "POST";
    const res = await fetch("/api/account/newsletter", { method });
    const data = (await res.json()) as { subscribed?: boolean; error?: string };
    setNewsletterLoading(false);
    if (!res.ok) {
      setNewsletterMessage(data.error || "Failed to update newsletter setting.");
      return;
    }
    setNewsletterSubscribed(!!data.subscribed);
    setNewsletterMessage(data.subscribed ? "You are subscribed to the newsletter." : "You are unsubscribed.");
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
              <div className="mt-6 rounded-xl border border-ink-100 dark:border-stone-700 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Edit profile
                </h2>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password (required for password change)"
                  className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full rounded-xl border border-ink-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
                />
                {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
                {saveMessage && <p className="text-sm text-sage-600 dark:text-sage-400">{saveMessage}</p>}
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-xl bg-ink-600 hover:bg-ink-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
              <div className="mt-6 rounded-xl border border-ink-100 dark:border-stone-700 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Newsletter
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {newsletterSubscribed
                    ? "You are currently subscribed with your account email."
                    : "You are currently unsubscribed."}
                </p>
                <button
                  onClick={toggleNewsletter}
                  disabled={newsletterLoading}
                  className="rounded-xl border border-ink-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold hover:bg-ink-50 dark:hover:bg-stone-700 disabled:opacity-60"
                >
                  {newsletterLoading
                    ? "Updating..."
                    : newsletterSubscribed
                      ? "Unsubscribe"
                      : "Subscribe"}
                </button>
                {newsletterMessage && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">{newsletterMessage}</p>
                )}
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
