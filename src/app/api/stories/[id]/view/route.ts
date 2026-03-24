import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const storyId = parseInt(id);
  if (isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  try {
    await Promise.all([
      prisma.story.update({
        where: { id: storyId },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.dailyView.upsert({
        where: { storyId_date: { storyId, date: today } },
        create: { storyId, date: today, count: 1 },
        update: { count: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }
}
