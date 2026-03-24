import { NextRequest, NextResponse } from "next/server";
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
