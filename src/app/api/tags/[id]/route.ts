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
  const tagId = parseInt(id);
  if (Number.isNaN(tagId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const { name } = await req.json();

  const tag = await prisma.tag.update({
    where: { id: tagId },
    data: { name: name.trim(), slug: createSlug(name) },
  });

  return NextResponse.json(tag);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tagId = parseInt(id);
  if (Number.isNaN(tagId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.tag.delete({ where: { id: tagId } });

  return NextResponse.json({ success: true });
}
