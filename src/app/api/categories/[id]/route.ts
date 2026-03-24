import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const categoryId = parseInt(id);
  if (Number.isNaN(categoryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const { name } = await req.json();

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { name: name.trim(), slug: createSlug(name) },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const categoryId = parseInt(id);
  if (Number.isNaN(categoryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return NextResponse.json({ success: true });
}
