import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlowActions } from "./flow-actions";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function FlowsListPage({ params }: Props) {
  const { workspaceId } = await params;
  await auth();

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
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-2">
        <Link
          href="/agency"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Agency
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {workspace.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {workspace.agency.name}
          </p>
        </div>
        <FlowActions workspaceId={workspaceId} />
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
              <th className="px-6 py-3">Flow Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workspace.quoteFlows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No flows yet. Create your first one!
                </td>
              </tr>
            ) : (
              workspace.quoteFlows.map((flow) => (
                <tr key={flow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {flow.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        flow.status === "active"
                          ? "bg-green-100 text-green-700"
                          : flow.status === "archived"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {flow.status === "active" ? "Published" : flow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/workspace/${workspaceId}/flows/${flow.id}/builder`}
                        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                      >
                        Open Builder
                      </Link>
                      <FlowActions
                        workspaceId={workspaceId}
                        duplicateFlowId={flow.id}
                        variant="duplicate"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
