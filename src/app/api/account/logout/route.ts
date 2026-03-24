import { NextResponse } from "next/server";
import { readerSessionCookie } from "@/lib/readerAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(readerSessionCookie.name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res;
}
