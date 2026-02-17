import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AgencyDashboard() {
  const session = await auth();
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, {session?.user?.name ?? "User"}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Workspaces
        </h2>
        {workspaces.length === 0 ? (
          <p className="text-gray-500">No workspaces yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {workspaces.map((ws) => (
              <li key={ws.id} className="py-3">
                <Link
                  href={`/workspace/${ws.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {ws.name}
                </Link>
                <span className="ml-2 text-sm text-gray-400">/{ws.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
