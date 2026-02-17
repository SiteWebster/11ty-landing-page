import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlowTabs } from "./flow-tabs";

interface Props {
  params: Promise<{ workspaceId: string; flowId: string }>;
  children: React.ReactNode;
}

export default async function FlowLayout({ params, children }: Props) {
  const { workspaceId, flowId } = await params;

  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
    include: { workspace: true },
  });

  if (!flow) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-2">
        <Link
          href={`/workspace/${workspaceId}/flows`}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Flows
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{flow.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {flow.workspace.name} &middot;{" "}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              flow.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {flow.status === "active" ? "Published" : flow.status}
          </span>
        </p>
      </div>

      <FlowTabs workspaceId={workspaceId} flowId={flowId} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
