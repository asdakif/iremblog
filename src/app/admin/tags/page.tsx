import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TagsClient from "@/components/admin/TagsClient";

export default async function TagsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { stories: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <h1
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Tags
      </h1>
      <TagsClient initialTags={tags} />
    </div>
  );
}
