"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteStoryButton({
  storyId,
  storyTitle,
}: {
  storyId: number;
  storyTitle: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
        >
          {loading ? "…" : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-700 transition-all"
      title={`Delete "${storyTitle}"`}
    >
      <Trash2 size={15} />
    </button>
  );
}
