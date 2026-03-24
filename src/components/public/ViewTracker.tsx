"use client";

import { useEffect } from "react";

type Props = {
  storyId: number;
};

export default function ViewTracker({ storyId }: Props) {
  useEffect(() => {
    fetch(`/api/stories/${storyId}/view`, { method: "POST" }).catch(() => {
      // silently ignore errors
    });
  }, [storyId]);

  return null;
}
