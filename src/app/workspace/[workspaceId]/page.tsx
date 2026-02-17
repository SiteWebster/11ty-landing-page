import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDashboard({ params }: Props) {
  const { workspaceId } = await params;
  const session = await auth();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      agency: true,
      quoteFlows: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!workspace) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-2">
        <Link
          href="/agency"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Agency
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
        <p className="mt-1 text-gray-600">
          Agency: {workspace.agency.name} &middot; Slug: /{workspace.slug}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          QuoteFlows
        </h2>
        {workspace.quoteFlows.length === 0 ? (
          <p className="text-gray-500">
            No quote flows yet. Logged in as {session?.user?.name ?? "User"}.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {workspace.quoteFlows.map((qf) => (
              <li key={qf.id} className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-900">{qf.name}</span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {qf.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
