import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { stories: { where: { story: { published: true } } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name: name.trim(), slug: createSlug(name) },
  });

  return NextResponse.json(category, { status: 201 });
}
