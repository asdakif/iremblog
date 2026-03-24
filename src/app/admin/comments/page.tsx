import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommentsClient from "@/components/admin/CommentsClient";

export default async function CommentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const comments = await prisma.comment.findMany({
    include: { story: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in-up max-w-4xl">
      <h1
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Comments
      </h1>
      <CommentsClient initialComments={comments} />
    </div>
  );
}
