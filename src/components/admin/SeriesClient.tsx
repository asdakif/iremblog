"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X, Layers } from "lucide-react";

type SeriesItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count: { stories: number };
};

type Props = {
  initialSeries: SeriesItem[];
};

export default function SeriesClient({ initialSeries }: Props) {
  const router = useRouter();
  const [series, setSeries] = useState<SeriesItem[]>(initialSeries);

  // New series form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create series");
        return;
      }
      const created: SeriesItem = await res.json();
      setSeries((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewDescription("");
      router.refresh();
    } catch {
      alert("Failed to create series");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: SeriesItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function handleSaveEdit(id: number) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update series");
        return;
      }
      const updated: SeriesItem = await res.json();
      setSeries((prev) =>
        prev.map((s) => (s.id === id ? updated : s)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      alert("Failed to update series");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this series? Stories in it will not be deleted.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete series");
        return;
      }
      setSeries((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete series");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create new series */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wide mb-4">
          Add New Series
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs text-stone-400 mb-1.5">Series Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Travel Diaries"
              required
              className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-ink-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1.5">Description (optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="A short description of this series…"
              rows={2}
              className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-ink-500 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus size={15} />
            {creating ? "Creating…" : "Create Series"}
          </button>
        </form>
      </div>

      {/* Series list */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-700/60">
          <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wide">
            All Series ({series.length})
          </h2>
        </div>
        {series.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No series yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y divide-stone-700/30">
            {series.map((item) => (
              <li key={item.id} className="px-5 py-4 hover:bg-stone-700/20 transition-colors">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-ink-500 transition-colors"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      placeholder="Description (optional)"
                      className="w-full bg-stone-900 border border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-ink-500 transition-colors resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={saving || !editName.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <Check size={13} />
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg text-xs font-medium transition-all"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-ink-900/40 flex items-center justify-center flex-shrink-0">
                        <Layers size={14} className="text-ink-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-200">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-stone-600 mt-1">
                          {item._count.stories} stor{item._count.stories !== 1 ? "ies" : "y"}
                          {" · "}
                          <span className="text-stone-700">/{item.slug}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-stone-500 hover:text-ink-300 rounded-lg hover:bg-stone-700 transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-rose-900/20 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
