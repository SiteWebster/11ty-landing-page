import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PublishClient } from "./publish-client";
import type { FlowConfig } from "@/lib/flow-types";

interface Props {
  params: Promise<{ workspaceId: string; flowId: string }>;
}

export default async function PublishPage({ params }: Props) {
  const { workspaceId, flowId } = await params;
  await auth();

  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });

  if (!flow) {
    notFound();
  }

  const latestVersion = flow.versions[0];
  const config = latestVersion?.configJson as FlowConfig | null;
  const steps = config?.steps ?? [];

  const contactGates = steps.filter((s) => s.type === "contact_gate").length;
  const results = steps.filter((s) => s.type === "results").length;

  const publishedVersion = flow.publishedVersionId
    ? flow.versions.find((v) => v.id === flow.publishedVersionId)
    : null;

  const isLatestPublished = flow.publishedVersionId === latestVersion?.id;

  return (
    <PublishClient
      workspaceId={workspaceId}
      flowId={flowId}
      contactGates={contactGates}
      results={results}
      totalSteps={steps.length}
      totalQuestions={steps.reduce(
        (sum, s) => sum + (s.questions?.length ?? 0),
        0
      )}
      publishedVersionNumber={publishedVersion?.versionNumber ?? null}
      draftVersionNumber={latestVersion?.versionNumber ?? 0}
      isLatestPublished={isLatestPublished}
      flowStatus={flow.status}
    />
  );
}
