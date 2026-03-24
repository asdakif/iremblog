import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSafeCsvCell(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const rows = [
      "id,email,createdAt",
      ...subscribers.map(
        (s) =>
          `${s.id},"${toSafeCsvCell(s.email)}","${s.createdAt.toISOString()}"`
      ),
    ];
    const csv = rows.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      },
    });
  }

  return NextResponse.json(subscribers);
}
