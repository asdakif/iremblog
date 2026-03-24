"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

type StoryItem = {
  id: number;
  title: string;
  published: boolean;
  sortOrder: number;
};

type Props = {
  stories: StoryItem[];
};

export default function StoriesOrderClient({ stories: initialStories }: Props) {
  const [items, setItems] = useState<StoryItem[]>(
    [...initialStories].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;
      if (result.destination.index === result.source.index) return;

      const reordered = Array.from(items);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);

      setItems(reordered);
      setSaved(false);
      setSaving(true);

      try {
        const order = reordered.map((s) => s.id);
        const res = await fetch("/api/stories/order", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }),
        });
        if (!res.ok) {
          alert("Failed to save order");
          setItems(items); // revert
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch {
        alert("Failed to save order");
        setItems(items); // revert
      } finally {
        setSaving(false);
      }
    },
    [items]
  );

  return (
    <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-700/60 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wide">
          Drag to Reorder
        </h2>
        {saving && (
          <span className="text-xs text-stone-500">Saving…</span>
        )}
        {saved && !saving && (
          <span className="text-xs text-sage-400">Saved</span>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stories-order">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="divide-y divide-stone-700/30"
            >
              {items.map((story, index) => (
                <Draggable key={story.id} draggableId={String(story.id)} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                        snapshot.isDragging
                          ? "bg-stone-700/60 shadow-lg rounded-lg"
                          : "hover:bg-stone-700/20"
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="text-stone-600 hover:text-stone-400 cursor-grab active:cursor-grabbing flex-shrink-0"
                      >
                        <GripVertical size={18} />
                      </div>
                      <span className="text-xs text-stone-600 tabular-nums w-6 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-stone-200 flex-1 min-w-0 truncate">
                        {story.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          story.published
                            ? "bg-sage-900/30 text-sage-400"
                            : "bg-stone-700 text-stone-500"
                        }`}
                      >
                        {story.published ? "Published" : "Draft"}
                      </span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
