import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import webpush from "web-push";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BroadcastBody = {
  title?: string;
  body?: string;
  url?: string;
};

function configureVapid() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!configureVapid()) {
    return NextResponse.json({ error: "Missing VAPID env vars" }, { status: 500 });
  }

  let payload: BroadcastBody;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = payload.title?.trim() || "Irem Blog";
  const body = payload.body?.trim() || "A new story is live.";
  const url = payload.url?.trim() || "/";

  const subscriptions = await prisma.pushSubscription.findMany();
  const message = JSON.stringify({ title, body, url });

  let sent = 0;
  let removed = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message
      );
      sent++;
    } catch {
      // Remove invalid/stale subscriptions.
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      removed++;
    }
  }

  return NextResponse.json({ sent, removed, total: subscriptions.length });
}
