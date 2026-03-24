import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

export async function GET() {
  const series = await prisma.series.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });
  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body as { name: string; description?: string };

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = createSlug(name.trim());

  const series = await prisma.series.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    },
    include: {
      _count: { select: { stories: true } },
    },
  });

  return NextResponse.json(series, { status: 201 });
}
