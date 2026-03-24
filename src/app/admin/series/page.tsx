import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Layers } from "lucide-react";
import SeriesClient from "@/components/admin/SeriesClient";

export default async function AdminSeriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const series = await prisma.series.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-500 to-sage-500 flex items-center justify-center">
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Series
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            Manage story collections and series
          </p>
        </div>
      </div>

      <SeriesClient initialSeries={series} />
    </div>
  );
}
