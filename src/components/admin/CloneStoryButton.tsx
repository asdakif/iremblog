"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

type Props = {
  storyId: number;
};

export default function CloneStoryButton({ storyId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClone() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/clone`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to clone story");
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to clone story");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClone}
      disabled={loading}
      className="p-1.5 text-stone-500 hover:text-warm-300 rounded-lg hover:bg-stone-700 transition-all disabled:opacity-50"
      title={loading ? "Cloning…" : "Clone story"}
    >
      <Copy size={15} />
    </button>
  );
}
