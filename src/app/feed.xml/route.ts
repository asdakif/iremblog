import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://iremblog.com";
const SITE_NAME = "Irem Blog";
const SITE_DESCRIPTION = "A warm, literary space for stories about life, love, and the things that matter most.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const stories = await prisma.story.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
    },
  });

  const items = stories
    .map((story) => {
      const link = `${SITE_URL}/stories/${story.slug}`;
      return `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(story.excerpt || "")}</description>
      <pubDate>${new Date(story.createdAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
