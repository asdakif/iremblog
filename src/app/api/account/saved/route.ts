import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getReaderUserId } from "@/lib/readerAuth";

const VALID_KINDS = new Set(["favorite", "readLater"]);

export async function GET(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kind = new URL(req.url).searchParams.get("kind") || "";
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const saved = await prisma.savedStory.findMany({
    where: { userId, kind },
    orderBy: { createdAt: "desc" },
    include: { story: { select: { slug: true, title: true } } },
  });

  return NextResponse.json(
    saved.map((item) => ({ slug: item.story.slug, title: item.story.title }))
  );
}

export async function POST(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { kind?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const kind = body.kind || "";
  const slug = body.slug?.trim();
  if (!VALID_KINDS.has(kind) || !slug) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const story = await prisma.story.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true },
  });
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  await prisma.savedStory.upsert({
    where: {
      userId_storyId_kind: {
        userId,
        storyId: story.id,
        kind,
      },
    },
    update: {},
    create: {
      userId,
      storyId: story.id,
      kind,
    },
  });

  return NextResponse.json({ slug: story.slug, title: story.title }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "";
  const slug = url.searchParams.get("slug")?.trim();
  if (!VALID_KINDS.has(kind) || !slug) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const story = await prisma.story.findUnique({ where: { slug }, select: { id: true } });
  if (!story) {
    return NextResponse.json({ success: true });
  }

  await prisma.savedStory.deleteMany({
    where: {
      userId,
      storyId: story.id,
      kind,
    },
  });

  return NextResponse.json({ success: true });
}
