import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { BuilderClient } from "./builder-client";
import type { FlowConfig } from "@/lib/flow-types";
import { DEFAULT_PRICING_CONFIG } from "@/lib/flow-types";

interface Props {
  params: Promise<{ workspaceId: string; flowId: string }>;
}

export default async function BuilderPage({ params }: Props) {
  const { workspaceId, flowId } = await params;
  await auth();

  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!flow || flow.versions.length === 0) {
    notFound();
  }

  const raw = flow.versions[0].configJson as Record<string, unknown> | null;
  const config: FlowConfig = {
    slug: (raw?.slug as string) ?? "",
    displayMode: (raw?.displayMode as FlowConfig["displayMode"]) ?? "range_only",
    steps: (raw?.steps as FlowConfig["steps"]) ?? [],
    pricingConfig:
      (raw?.pricingConfig as FlowConfig["pricingConfig"]) ?? DEFAULT_PRICING_CONFIG,
  };

  return (
    <BuilderClient
      workspaceId={workspaceId}
      flowId={flowId}
      flowName={flow.name}
      initialConfig={config}
    />
  );
}
