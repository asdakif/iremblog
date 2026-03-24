import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import SessionProvider from "@/components/admin/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page renders without sidebar
  return (
    <SessionProvider session={session}>
      <AdminLayoutInner session={session}>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}

function AdminLayoutInner({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Awaited<ReturnType<typeof getServerSession>>;
}) {
  // The login page itself doesn't need the sidebar
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-stone-950 dark:bg-stone-950">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
