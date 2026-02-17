import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SurveyRunner } from "./survey-runner";
import type { FlowConfig } from "@/lib/flow-types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;

  // Find the published flow by matching slug in the published version's configJson
  const flows = await prisma.quoteFlow.findMany({
    where: { status: "active", publishedVersionId: { not: null } },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });

  // Match by slug in the published version's configJson
  const match = flows.find((flow) => {
    const publishedVersion = flow.versions.find(
      (v) => v.id === flow.publishedVersionId
    );
    if (!publishedVersion) return false;
    const config = publishedVersion.configJson as unknown as FlowConfig;
    return config.slug === slug;
  });

  if (!match) {
    notFound();
  }

  const publishedVersion = match.versions.find(
    (v) => v.id === match.publishedVersionId
  )!;
  const config = publishedVersion.configJson as unknown as FlowConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyRunner
        flowId={match.id}
        flowName={match.name}
        config={config}
      />
    </div>
  );
}
