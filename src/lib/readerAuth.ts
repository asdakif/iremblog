import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "reader_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: number;
  exp: number;
};

function getSecret() {
  return process.env.READER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-reader-secret-change-me";
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createReaderSessionToken(userId: number) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + THIRTY_DAYS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyReaderSessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!payload.userId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getReaderUserId(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = verifyReaderSessionToken(token);
  return payload?.userId ?? null;
}

export const readerSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: THIRTY_DAYS,
};
