"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function base64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushPrompt() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) return;
    setReady(Notification.permission !== "denied");
    void navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setEnabled(!!existing);
    });
  }, []);

  async function enablePush() {
    if (!VAPID_PUBLIC_KEY) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    setEnabled(true);
  }

  if (!ready || enabled) return null;

  return (
    <button
      onClick={() => void enablePush()}
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-ink-600 hover:bg-ink-700 text-white px-4 py-2 text-sm font-semibold shadow-lg"
      aria-label="Enable notifications"
    >
      <Bell size={16} />
      Enable notifications
    </button>
  );
}
