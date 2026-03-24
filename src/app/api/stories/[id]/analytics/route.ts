import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  eventType?: string;
  value?: number;
  sessionKey?: string;
};

const ALLOWED_EVENTS = new Set(["view", "read_progress"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const storyId = parseInt(id);
  if (Number.isNaN(storyId)) {
    return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const eventType = body.eventType || "";
  if (!ALLOWED_EVENTS.has(eventType)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  await prisma.storyAnalyticsEvent.create({
    data: {
      storyId,
      eventType,
      value: typeof body.value === "number" ? body.value : null,
      sessionKey: body.sessionKey || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
