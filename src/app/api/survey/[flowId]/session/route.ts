import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ flowId: string }> };

// Create a new session
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { flowId } = await params;

  const flow = await prisma.quoteFlow.findUnique({
    where: { id: flowId },
  });

  if (!flow || !flow.publishedVersionId) {
    return NextResponse.json({ error: "Flow not found or not published" }, { status: 404 });
  }

  const session = await prisma.quoteSession.create({
    data: {
      flowId,
      versionId: flow.publishedVersionId,
      answersJson: {},
    },
  });

  return NextResponse.json({ sessionId: session.id });
}

// Update session answers
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { flowId } = await params;
  const { sessionId, answers } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await prisma.quoteSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.flowId !== flowId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.quoteSession.update({
    where: { id: sessionId },
    data: { answersJson: answers },
  });

  return NextResponse.json({ success: true });
}
