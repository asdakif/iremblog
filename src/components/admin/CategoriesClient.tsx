"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Folder } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  _count: { stories: number };
};

export default function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, { ...cat, _count: { stories: 0 } }]);
      setNewName("");
    }
    setAdding(false);
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...cat, _count: c._count } : c))
      );
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Stories will not be deleted.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
          placeholder="New category name…"
          className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700/60 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* List */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Folder size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No categories yet.</p>
          </div>
        ) : (
          <ul>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < categories.length - 1 ? "border-b border-stone-700/30" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-ink-900/30 flex items-center justify-center flex-shrink-0">
                  <Folder size={16} className="text-ink-400" />
                </div>

                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(cat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 bg-stone-700 border border-stone-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-500/50"
                    />
                    <button
                      onClick={() => handleEdit(cat.id)}
                      className="p-1.5 text-sage-400 hover:text-sage-300 rounded-lg hover:bg-stone-700"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-stone-700"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-200">{cat.name}</p>
                    <p className="text-xs text-stone-500">
                      {cat._count.stories} {cat._count.stories === 1 ? "story" : "stories"}
                    </p>
                  </div>
                )}

                {editingId !== cat.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="p-1.5 text-stone-500 hover:text-ink-400 rounded-lg hover:bg-stone-700 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-700 transition-all"
                    >
                      <Trash2 size={14} />
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
