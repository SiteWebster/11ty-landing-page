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
        slug: "home-insurance-quote",
        displayMode: "range_only",
        steps: [
          {
            id: "step_property",
            title: "Property Information",
            type: "questions",
            questions: [
              {
                id: "q_address",
                label: "Property Address",
                helpText: "Enter the full street address",
                type: "text",
                required: true,
                options: [],
                pricingImpact: { kind: "none", value: 0 },
              },
              {
                id: "q_sqft",
                label: "Square Footage",
                helpText: "Total living area in sq ft",
                type: "number",
                required: true,
                options: [],
                pricingImpact: { kind: "unit_rate", value: 0.5 },
              },
              {
                id: "q_year",
                label: "Year Built",
                helpText: "",
                type: "number",
                required: true,
                options: [],
                pricingImpact: { kind: "none", value: 0 },
              },
            ],
          },
          {
            id: "step_coverage",
            title: "Coverage Options",
            type: "questions",
            questions: [
              {
                id: "q_dwelling",
                label: "Dwelling Coverage",
                helpText: "Amount of coverage for your home structure",
                type: "single_select",
                required: true,
                options: [
                  { label: "$250,000", value: "250000" },
                  { label: "$500,000", value: "500000" },
                  { label: "$750,000", value: "750000" },
                ],
                pricingImpact: { kind: "sets_base", value: 0 },
              },
              {
                id: "q_deductible",
                label: "Deductible",
                helpText: "Higher deductible = lower premium",
                type: "single_select",
                required: true,
                options: [
                  { label: "$500", value: "500" },
                  { label: "$1,000", value: "1000" },
                  { label: "$2,500", value: "2500" },
                ],
                pricingImpact: { kind: "multiply", value: 1 },
              },
            ],
          },
          {
            id: "step_contact",
            title: "Contact Information",
            type: "contact_gate",
            questions: [],
          },
          {
            id: "step_results",
            title: "Your Quote",
            type: "results",
            questions: [],
          },
        ],
        pricingConfig: {
          model: "base_multipliers_addons",
          basePrice: 1200,
          roundingIncrement: 25,
          rangeLowPercent: 0.92,
          rangeHighPercent: 1.12,
          minCap: null,
          maxCap: null,
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
