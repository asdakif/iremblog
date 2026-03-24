import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getReaderUserId } from "@/lib/readerAuth";

export async function GET(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.readerUser.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  return NextResponse.json({ subscribed: !!subscriber });
}

export async function POST(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.readerUser.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.subscriber.upsert({
    where: { email: user.email },
    update: {},
    create: { email: user.email },
  });

  return NextResponse.json({ subscribed: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = getReaderUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.readerUser.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.subscriber.deleteMany({
    where: { email: user.email },
  });

  return NextResponse.json({ subscribed: false });
}
