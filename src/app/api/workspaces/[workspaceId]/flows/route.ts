import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Create a new flow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;
  const { name } = await request.json();

  const flow = await prisma.quoteFlow.create({
    data: {
      workspaceId,
      name: name || "Untitled Flow",
      status: "draft",
      versions: {
        create: {
          versionNumber: 1,
          configJson: {
            slug: "",
            displayMode: "range_only",
            steps: [],
            pricingConfig: {
              model: "base_multipliers_addons",
              basePrice: 0,
              roundingIncrement: 25,
              rangeLowPercent: 0.92,
              rangeHighPercent: 1.12,
              minCap: null,
              maxCap: null,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(flow);
}
