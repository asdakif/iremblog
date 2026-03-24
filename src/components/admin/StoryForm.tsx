"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, EyeOff, Star, Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";

const TipTapEditor = dynamic(() => import("./TipTapEditor"), { ssr: false });

type Category = { id: number; name: string; slug: string };
type Tag = { id: number; name: string; slug: string };

type Props = {
  storyId?: number;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    published: boolean;
    featured: boolean;
    isPremium: boolean;
    sponsorLabel: string;
    sponsorUrl: string;
    categoryIds: number[];
    tagIds: number[];
  };
  categories: Category[];
  tags: Tag[];
};

type DraftData = {
  title: string;
  excerpt: string;
  content: string;
  savedAt: number;
};

export default function StoryForm({ storyId, initialData, categories, tags }: Props) {
  const router = useRouter();
  const isEdit = !!storyId;
  const draftKey = `story-draft-${storyId ?? "new"}`;

  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [isPremium, setIsPremium] = useState(initialData?.isPremium ?? false);
  const [sponsorLabel, setSponsorLabel] = useState(initialData?.sponsorLabel || "");
  const [sponsorUrl, setSponsorUrl] = useState(initialData?.sponsorUrl || "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialData?.categoryIds || []
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(initialData?.tagIds || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Autosave state
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saved">("idle");
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);

      // Only offer restore if draft is newer than initialData (or is for new story)
      if (!isEdit || draft.savedAt > Date.now() - 7 * 24 * 60 * 60 * 1000) {
        const hasContent = draft.title || draft.excerpt || draft.content;
        const isDifferent =
          draft.title !== (initialData?.title || "") ||
          draft.excerpt !== (initialData?.excerpt || "") ||
          draft.content !== (initialData?.content || "");

        if (hasContent && isDifferent) {
          setShowRestoreBanner(true);
        }
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);
      setTitle(draft.title);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setRestoredDraft(true);
    } catch {
      // ignore
    }
    setShowRestoreBanner(false);
  };

  const dismissRestore = () => {
    setShowRestoreBanner(false);
    localStorage.removeItem(draftKey);
  };

  // Autosave logic with debounce
  const triggerAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      try {
        const draft: DraftData = { title, excerpt, content, savedAt: Date.now() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setAutosaveStatus("saved");
        if (autosaveFadeRef.current) clearTimeout(autosaveFadeRef.current);
        autosaveFadeRef.current = setTimeout(() => setAutosaveStatus("idle"), 2500);
      } catch {
        // ignore storage errors
      }
    }, 2000);
  }, [title, excerpt, content, draftKey]);

  // Trigger autosave when fields change (skip initial mount)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    triggerAutosave();
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, content]);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content,
      coverImage,
      published: publish !== undefined ? publish : published,
      featured,
      isPremium,
      sponsorLabel: sponsorLabel.trim() || null,
      sponsorUrl: sponsorUrl.trim() || null,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
    };

    try {
      const res = await fetch(isEdit ? `/api/stories/${storyId}` : "/api/stories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      // Clear draft on successful save
      localStorage.removeItem(draftKey);

      router.push("/admin/stories");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save story.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setCoverImage(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isEdit ? "Edit Story" : "New Story"}
          </h1>
          {/* Autosave indicator */}
          <p
            className={`text-xs text-stone-500 mt-0.5 transition-opacity duration-500 ${
              autosaveStatus === "saved" ? "opacity-100" : "opacity-0"
            }`}
          >
            {restoredDraft ? "Draft restored & autosaved" : "Draft autosaved"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl text-sm font-medium transition-all"
          >
            <Save size={15} />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-ink-500 hover:bg-ink-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <Eye size={15} />
            {published ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Restore draft banner */}
      {showRestoreBanner && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-warm-900/20 border border-warm-700/30 rounded-xl text-warm-300 text-sm">
          <span className="flex-1">
            A saved draft was found. Would you like to restore it?
          </span>
          <button
            onClick={restoreDraft}
            className="px-3 py-1 bg-warm-600 hover:bg-warm-500 text-white rounded-lg text-xs font-medium transition-all"
          >
            Restore
          </button>
          <button
            onClick={dismissRestore}
            className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg text-xs font-medium transition-all"
          >
            Discard
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-rose-900/20 border border-rose-700/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story title…"
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700/60 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief description or opening line…"
              rows={2}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700/60 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-sm resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Content <span className="text-rose-400">*</span>
            </label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your story…"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-300 mb-3">Status</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setPublished(!published)}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
                    published ? "bg-sage-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      published ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-stone-200">
                    {published ? (
                      <span className="flex items-center gap-1.5">
                        <Eye size={13} className="text-sage-400" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <EyeOff size={13} className="text-stone-500" />
                        Draft
                      </span>
                    )}
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setFeatured(!featured)}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
                    featured ? "bg-warm-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      featured ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <p className="text-sm text-stone-200 flex items-center gap-1.5">
                  <Star size={13} className={featured ? "text-warm-400" : "text-stone-500"} />
                  Featured
                </p>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
                    isPremium ? "bg-rose-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isPremium ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <p className="text-sm text-stone-200">Premium content</p>
              </label>
            </div>
          </div>

          {/* Monetization */}
          <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-300 mb-3">Sponsorship</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={sponsorLabel}
                onChange={(e) => setSponsorLabel(e.target.value)}
                placeholder="Sponsor label (optional)"
                className="w-full px-3 py-2 bg-stone-700/60 border border-stone-600/60 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-xs"
              />
              <input
                type="url"
                value={sponsorUrl}
                onChange={(e) => setSponsorUrl(e.target.value)}
                placeholder="https://sponsor.example"
                className="w-full px-3 py-2 bg-stone-700/60 border border-stone-600/60 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-xs"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-1.5">
              <ImageIcon size={14} />
              Cover Image
            </h3>

            {/* URL input */}
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 bg-stone-700/60 border border-stone-600/60 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-ink-500/50 text-xs mb-2"
            />

            {/* Upload button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-1.5 w-full px-3 py-2 bg-stone-700/40 hover:bg-stone-700 disabled:opacity-60 border border-stone-600/40 rounded-lg text-stone-400 hover:text-stone-200 text-xs font-medium transition-all"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Upload from device
                  </>
                )}
              </button>
            </div>

            {coverImage && (
              <div className="mt-3 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 w-6 h-6 bg-stone-900/80 rounded-full flex items-center justify-center text-stone-300 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-300 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategories.includes(cat.id)
                      ? "bg-ink-500 text-white"
                      : "bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-stone-300 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-warm-500 text-white"
                      : "bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-200"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
