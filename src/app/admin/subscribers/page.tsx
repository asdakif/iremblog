import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import SubscriberExport from "@/components/admin/SubscriberExport";

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-warm-500 flex items-center justify-center">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Subscribers
            </h1>
            <p className="text-stone-500 text-xs mt-0.5">
              {subscribers.length} total subscriber{subscribers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <SubscriberExport />
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
          <div className="text-3xl font-bold text-white mb-1">
            {subscribers.length.toLocaleString()}
          </div>
          <div className="text-sm text-stone-400">Total Subscribers</div>
        </div>
        <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
          <div className="text-3xl font-bold text-white mb-1">
            {subscribers.filter((s) => {
              const d = new Date(s.createdAt);
              const now = new Date();
              const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              return diff <= 30;
            }).length.toLocaleString()}
          </div>
          <div className="text-sm text-stone-400">Last 30 Days</div>
        </div>
        <div className="bg-stone-800 border border-stone-700/60 rounded-xl p-5">
          <div className="text-3xl font-bold text-white mb-1">
            {subscribers.filter((s) => {
              const d = new Date(s.createdAt);
              const now = new Date();
              const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              return diff <= 7;
            }).length.toLocaleString()}
          </div>
          <div className="text-sm text-stone-400">Last 7 Days</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-stone-800 border border-stone-700/60 rounded-xl overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="text-center py-16 text-stone-500 text-sm">
            No subscribers yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-700/60 text-xs text-stone-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3.5">#</th>
                <th className="text-left px-5 py-3.5">Email</th>
                <th className="text-left px-5 py-3.5 hidden sm:table-cell">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr
                  key={sub.id}
                  className={`border-b border-stone-700/30 hover:bg-stone-700/30 transition-colors ${
                    i === subscribers.length - 1 ? "border-0" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-stone-600 tabular-nums">{i + 1}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-stone-200">{sub.email}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-stone-500">{formatDate(sub.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
