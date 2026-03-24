"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag as TagIcon } from "lucide-react";

type Tag = {
  id: number;
  name: string;
  slug: string;
  _count: { stories: number };
};

export default function TagsClient({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, { ...tag, _count: { stories: 0 } }]);
      setNewName("");
    }
    setAdding(false);
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => prev.map((t) => (t.id === id ? { ...tag, _count: t._count } : t)));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New tag name…"
          className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700/60 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-warm-500/50 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-warm-500 hover:bg-warm-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Tag cloud + list */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        {tags.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <TagIcon size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tags yet.</p>
          </div>
        ) : (
          <ul>
            {tags.map((tag, i) => (
              <li
                key={tag.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${
                  i < tags.length - 1 ? "border-b border-stone-700/30" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-warm-900/30 flex items-center justify-center flex-shrink-0">
                  <TagIcon size={14} className="text-warm-400" />
                </div>

                {editingId === tag.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(tag.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 bg-stone-700 border border-stone-600 rounded-lg text-white text-sm focus:outline-none"
                    />
                    <button onClick={() => handleEdit(tag.id)} className="p-1.5 text-sage-400 hover:text-sage-300 rounded-lg">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-200">#{tag.name}</p>
                    <p className="text-xs text-stone-500">{tag._count.stories} stories</p>
                  </div>
                )}

                {editingId !== tag.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                      className="p-1.5 text-stone-500 hover:text-warm-400 rounded-lg hover:bg-stone-700 transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-700 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
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
