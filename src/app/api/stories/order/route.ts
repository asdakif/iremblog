import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { order } = body as { order: number[] };

  if (!Array.isArray(order) || order.some((id) => typeof id !== "number")) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  await prisma.$transaction(
    order.map((storyId, index) =>
      prisma.story.update({
        where: { id: storyId },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
