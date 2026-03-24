import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const storyId = parseInt(id);
  if (Number.isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      comments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(story);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const storyId = parseInt(id);
  if (Number.isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json();
  const {
    title,
    content,
    excerpt,
    coverImage,
    published,
    featured,
    isPremium,
    sponsorLabel,
    sponsorUrl,
    categoryIds,
    tagIds,
  } = body;

  const slug = createSlug(title);
  const safeContent = sanitizeRichText(content);

  const story = await prisma.$transaction(async (tx) => {
    // Keep relation replacement atomic.
    await tx.categoryOnStory.deleteMany({ where: { storyId } });
    await tx.tagOnStory.deleteMany({ where: { storyId } });

    return tx.story.update({
      where: { id: storyId },
      data: {
        title,
        slug,
        content: safeContent,
        excerpt: excerpt || "",
        coverImage: coverImage || null,
        published: published ?? false,
        featured: featured ?? false,
        isPremium: isPremium ?? false,
        sponsorLabel: sponsorLabel || null,
        sponsorUrl: sponsorUrl || null,
        categories: {
          create: (categoryIds || []).map((cId: number) => ({ categoryId: cId })),
        },
        tags: {
          create: (tagIds || []).map((tId: number) => ({ tagId: tId })),
        },
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  });

  return NextResponse.json(story);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const storyId = parseInt(id);
  if (Number.isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.story.delete({ where: { id: storyId } });

  return NextResponse.json({ success: true });
}
