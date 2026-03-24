"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function SubscriberExport() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers?format=csv");
      if (!res.ok) throw new Error("Failed to fetch");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export subscribers.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-60 text-stone-200 rounded-xl text-sm font-medium transition-all"
    >
      <Download size={15} />
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
