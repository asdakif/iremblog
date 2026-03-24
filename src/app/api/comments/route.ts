import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const pending = searchParams.get("pending") === "true";
  const comments = await prisma.comment.findMany({
    where: pending ? { approved: false } : {},
    include: { story: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests per 15 minutes per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const allowed = rateLimit(`comments:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a while before posting again." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { storyId, authorName, body: commentBody } = body;
  if (!storyId || !authorName || !commentBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const story = await prisma.story.findUnique({
    where: { id: parseInt(storyId), published: true },
  });
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }
  const comment = await prisma.comment.create({
    data: {
      storyId: parseInt(storyId),
      authorName: authorName.trim(),
      body: commentBody.trim(),
      approved: false,
    },
  });
  return NextResponse.json(comment, { status: 201 });
}
