import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create agency
  const agency = await prisma.agency.upsert({
    where: { id: "seed-agency-1" },
    update: {},
    create: {
      id: "seed-agency-1",
      name: "Acme Insurance Agency",
    },
  });
  console.log("Created agency:", agency.name);

  // Create agency owner user
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "owner@acme.com" },
    update: {},
    create: {
      id: "seed-user-1",
      email: "owner@acme.com",
      name: "Agency Owner",
      role: "agency_owner",
      passwordHash,
    },
  });
  console.log("Created user:", user.email);

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-main" },
    update: {},
    create: {
      id: "seed-workspace-1",
      agencyId: agency.id,
      name: "Acme Main Workspace",
      slug: "acme-main",
    },
  });
  console.log("Created workspace:", workspace.name);

  // Link user to workspace
  await prisma.workspaceUser.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "agency_owner",
    },
  });
  console.log("Linked user to workspace");

  // Create sample quote flow
  const quoteFlow = await prisma.quoteFlow.upsert({
    where: { id: "seed-quoteflow-1" },
    update: {},
    create: {
      id: "seed-quoteflow-1",
      workspaceId: workspace.id,
      name: "Home Insurance Quote",
      status: "draft",
    },
  });
  console.log("Created quote flow:", quoteFlow.name);

  // Create initial version
  await prisma.quoteFlowVersion.upsert({
    where: { id: "seed-version-1" },
    update: {},
    create: {
      id: "seed-version-1",
      quoteFlowId: quoteFlow.id,
      versionNumber: 1,
      configJson: {
        steps: ["property_info", "coverage_options", "review"],
        fields: {
          property_info: ["address", "year_built", "square_footage"],
          coverage_options: ["dwelling", "liability", "deductible"],
        },
      },
    },
  });
  console.log("Created quote flow version v1");

  console.log("\nSeed complete!");
  console.log("Login with: owner@acme.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
