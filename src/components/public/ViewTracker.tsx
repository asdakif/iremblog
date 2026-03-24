"use client";

import { useEffect } from "react";

type Props = {
  storyId: number;
};

export default function ViewTracker({ storyId }: Props) {
  useEffect(() => {
    const key = `viewed-story-${storyId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch(`/api/stories/${storyId}/view`, { method: "POST" }).catch(() => {
      // silently ignore errors
    });

    const sessionKey = crypto.randomUUID();
    fetch(`/api/stories/${storyId}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "view", sessionKey }),
    }).catch(() => {
      // silently ignore errors
    });
  }, [storyId]);

  return null;
}
