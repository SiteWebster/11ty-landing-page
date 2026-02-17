import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { calculateQuote } from "@/lib/pricing-engine";
import type { FlowConfig } from "@/lib/flow-types";
import type { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ flowId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { flowId } = await params;
  const { sessionId, contact, answers } = await request.json();

  if (!contact?.email) {
    return NextResponse.json({ error: "Contact email required" }, { status: 400 });
  }

  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
  });

  if (!flow || !flow.publishedVersionId) {
    return NextResponse.json({ error: "Flow not published" }, { status: 404 });
  }

  const version = await prisma.quoteFlowVersion.findUnique({
    where: { id: flow.publishedVersionId },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const config = version.configJson as unknown as FlowConfig;
  const hasNeedsReview = config.steps.some((s) => s.type === "needs_review");

  // Calculate pricing
  const result = calculateQuote(config, answers);

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      flowId,
      versionId: flow.publishedVersionId,
      contactJson: contact,
      answersJson: answers,
      resultJson: result as unknown as Prisma.InputJsonValue,
      needsReview: hasNeedsReview,
    },
  });

  // Update session if provided
  if (sessionId) {
    await prisma.quoteSession.update({
      where: { id: sessionId },
      data: { answersJson: answers },
    }).catch(() => {
      // Session may not exist, that's ok
    });
  }

  return NextResponse.json({
    submissionId: submission.id,
    result,
    needsReview: hasNeedsReview,
  });
}
