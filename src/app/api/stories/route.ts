import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");
  const all = searchParams.get("all") === "true"; // admin: include drafts

  const session = await getServerSession(authOptions);
  const isAdmin = !!session;

  const where: Record<string, unknown> = {};

  if (!isAdmin || !all) {
    where.published = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  if (category) {
    where.categories = {
      some: { category: { slug: category } },
    };
  }

  if (tag) {
    where.tags = {
      some: { tag: { slug: tag } },
    };
  }

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { approved: true } } } },
      },
    }),
    prisma.story.count({ where }),
  ]);

  return NextResponse.json({ stories, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const slug = createSlug(title);
  const safeContent = sanitizeRichText(content);

  try {
    const story = await prisma.story.create({
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
          create: (categoryIds || []).map((id: number) => ({ categoryId: id })),
        },
        tags: {
          create: (tagIds || []).map((id: number) => ({ tagId: id })),
        },
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "A story with this title already exists" }, { status: 409 });
    }
    throw error;
  }
}
