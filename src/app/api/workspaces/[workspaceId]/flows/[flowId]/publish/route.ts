import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Step {
  type: string;
}

interface ConfigJson {
  steps?: Step[];
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; flowId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flowId } = await params;

    const flow = await prisma.quoteFlow.findUnique({
      where: { id: flowId },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });

    if (!flow || flow.versions.length === 0) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    const latestVersion = flow.versions[0];
    const config = latestVersion.configJson as ConfigJson;
    const steps = config.steps ?? [];

    // Validate: exactly 1 contact_gate and 1 results step
    const contactGates = steps.filter((s) => s.type === "contact_gate");
    const resultSteps = steps.filter((s) => s.type === "results");

    const errors: string[] = [];
    if (contactGates.length !== 1) {
      errors.push(
        `Expected exactly 1 contact_gate step, found ${contactGates.length}`
      );
    }
    if (resultSteps.length !== 1) {
      errors.push(
        `Expected exactly 1 results step, found ${resultSteps.length}`
      );
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    if (flow.publishedVersionId === latestVersion.id) {
      return NextResponse.json(
        { error: "This version is already published" },
        { status: 400 }
      );
    }

    // Create a new immutable published version
    const publishedVersion = await prisma.quoteFlowVersion.create({
      data: {
        quoteFlowId: flowId,
        versionNumber: latestVersion.versionNumber + 1,
        configJson: latestVersion.configJson ?? {},
      },
    });

    // Update flow status and publishedVersionId
    await prisma.quoteFlow.update({
      where: { id: flowId },
      data: {
        status: "active",
        publishedVersionId: publishedVersion.id,
      },
    });

    return NextResponse.json({
      success: true,
      publishedVersionId: publishedVersion.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Publish error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
