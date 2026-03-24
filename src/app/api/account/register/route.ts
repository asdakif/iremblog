import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createReaderSessionToken, readerSessionCookie } from "@/lib/readerAuth";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim() || null;
  const email = body.email?.toLowerCase().trim();
  const password = body.password ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.readerUser.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });

    const token = createReaderSessionToken(user.id);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(readerSessionCookie.name, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: readerSessionCookie.maxAge,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
