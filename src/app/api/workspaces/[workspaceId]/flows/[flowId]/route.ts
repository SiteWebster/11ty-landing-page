import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ workspaceId: string; flowId: string }> };

// Save builder config (draft version)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flowId } = await params;
  const { name, configJson } = await request.json();

  // Update flow name
  if (name !== undefined) {
    await prisma.quoteFlow.update({
      where: { id: flowId },
      data: { name },
    });
  }

  // Find the latest draft version (highest versionNumber without being published)
  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!flow || flow.versions.length === 0) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const latestVersion = flow.versions[0];

  // If this version is published, create a new draft
  if (flow.publishedVersionId === latestVersion.id) {
    await prisma.quoteFlowVersion.create({
      data: {
        quoteFlowId: flowId,
        versionNumber: latestVersion.versionNumber + 1,
        configJson,
      },
    });
  } else {
    // Update the existing draft
    await prisma.quoteFlowVersion.update({
      where: { id: latestVersion.id },
      data: { configJson },
    });
  }

  return NextResponse.json({ success: true });
}

// Duplicate a flow
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, flowId } = await params;

  const sourceFlow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!sourceFlow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const configJson = sourceFlow.versions[0]?.configJson ?? {};

  const newFlow = await prisma.quoteFlow.create({
    data: {
      workspaceId,
      name: `${sourceFlow.name} (copy)`,
      status: "draft",
      versions: {
        create: {
          versionNumber: 1,
          configJson,
        },
      },
    },
  });

  return NextResponse.json(newFlow);
}
