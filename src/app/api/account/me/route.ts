import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getReaderUserId } from "@/lib/readerAuth";

export async function GET(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.readerUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.readerUser.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let passwordHash: string | undefined;
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, existing.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const user = await prisma.readerUser.update({
    where: { id: userId },
    data: {
      name: name || null,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
