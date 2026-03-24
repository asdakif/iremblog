"use client";

import { useEffect } from "react";

type Props = {
  storyId: number;
};

const MILESTONES = [25, 50, 75, 100];

export default function ReadDepthTracker({ storyId }: Props) {
  useEffect(() => {
    const reached = new Set<number>();
    const sessionKey = crypto.randomUUID();

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const percent = Math.round((window.scrollY / total) * 100);

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          fetch(`/api/stories/${storyId}/analytics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "read_progress",
              value: milestone,
              sessionKey,
            }),
          }).catch(() => {
            // silently ignore errors
          });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [storyId]);

  return null;
}
