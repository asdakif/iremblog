import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const storyId = parseInt(id);
  if (isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
  }

  const original = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!original) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const baseTitle = `Copy of ${original.title}`;
  let slug = createSlug(baseTitle);

  // Ensure slug uniqueness by appending a timestamp suffix if needed
  const existing = await prisma.story.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const cloned = await prisma.story.create({
    data: {
      title: baseTitle,
      slug,
      content: original.content,
      excerpt: original.excerpt,
      coverImage: original.coverImage,
      published: false,
      featured: false,
      viewCount: 0,
      sortOrder: original.sortOrder,
      categories: {
        create: original.categories.map((c) => ({ categoryId: c.categoryId })),
      },
      tags: {
        create: original.tags.map((t) => ({ tagId: t.tagId })),
      },
    },
  });

  return NextResponse.json(cloned, { status: 201 });
}
