import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const seriesId = parseInt(id);
  if (isNaN(seriesId)) {
    return NextResponse.json({ error: "Invalid series id" }, { status: 400 });
  }

  const body = await req.json();
  const { name, description } = body as { name?: string; description?: string };

  const updateData: { name?: string; slug?: string; description?: string | null } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
    }
    updateData.name = name.trim();
    updateData.slug = createSlug(name.trim());
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  const series = await prisma.series.update({
    where: { id: seriesId },
    data: updateData,
    include: {
      _count: { select: { stories: true } },
    },
  });

  return NextResponse.json(series);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const seriesId = parseInt(id);
  if (isNaN(seriesId)) {
    return NextResponse.json({ error: "Invalid series id" }, { status: 400 });
  }

  await prisma.series.delete({ where: { id: seriesId } });

  return NextResponse.json({ success: true });
}
