import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoryForm from "@/components/admin/StoryForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditStoryPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const storyId = parseInt(id);

  const [story, categories, tags] = await Promise.all([
    prisma.story.findUnique({
      where: { id: storyId },
      include: {
        categories: true,
        tags: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!story) notFound();

  const initialData = {
    title: story.title,
    excerpt: story.excerpt,
    content: story.content,
    coverImage: story.coverImage || "",
    published: story.published,
    featured: story.featured,
    isPremium: story.isPremium,
    sponsorLabel: story.sponsorLabel || "",
    sponsorUrl: story.sponsorUrl || "",
    categoryIds: story.categories.map((c) => c.categoryId),
    tagIds: story.tags.map((t) => t.tagId),
  };

  return (
    <div className="animate-fade-in-up">
      <StoryForm
        storyId={storyId}
        initialData={initialData}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
