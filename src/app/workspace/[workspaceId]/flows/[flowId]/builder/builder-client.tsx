"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  FlowConfig,
  Step,
  StepType,
  Question,
  QuestionType,
  PricingKind,
} from "@/lib/flow-types";
import { createStep, createQuestion } from "@/lib/flow-types";
import { StepEditor } from "./step-editor";

interface BuilderClientProps {
  workspaceId: string;
  flowId: string;
  flowName: string;
  initialConfig: FlowConfig;
}

export function BuilderClient({
  workspaceId,
  flowId,
  flowName: initialName,
  initialConfig,
}: BuilderClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [config, setConfig] = useState<FlowConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(
    config.steps[0]?.id ?? null
  );

  const updateSteps = useCallback(
    (updater: (steps: Step[]) => Step[]) => {
      setConfig((prev) => ({ ...prev, steps: updater(prev.steps) }));
      setSaved(false);
    },
    []
  );

  function addStep(type: StepType) {
    const step = createStep(type);
    updateSteps((steps) => [...steps, step]);
    setExpandedStep(step.id);
  }

  function removeStep(stepId: string) {
    updateSteps((steps) => steps.filter((s) => s.id !== stepId));
    if (expandedStep === stepId) setExpandedStep(null);
  }

  function moveStep(stepId: string, direction: "up" | "down") {
    updateSteps((steps) => {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx < 0) return steps;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= steps.length) return steps;
      const copy = [...steps];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }

  function renameStep(stepId: string, title: string) {
    updateSteps((steps) =>
      steps.map((s) => (s.id === stepId ? { ...s, title } : s))
    );
  }

  function updateStepQuestions(stepId: string, questions: Question[]) {
    updateSteps((steps) =>
      steps.map((s) => (s.id === stepId ? { ...s, questions } : s))
    );
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(
      `/api/workspaces/${workspaceId}/flows/${flowId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, configJson: config }),
      }
    );
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Flow name */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">
          Flow Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Flow settings */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Flow Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500">Slug</label>
            <input
              type="text"
              value={config.slug}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, slug: e.target.value }));
                setSaved(false);
              }}
              placeholder="home-insurance-quote"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Display Mode</label>
            <select
              value={config.displayMode}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  displayMode: e.target.value as FlowConfig["displayMode"],
                }));
                setSaved(false);
              }}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="range_only">Range Only</option>
              <option value="exact_only">Exact Only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing config */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Pricing Config
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500">Base Price</label>
            <input
              type="number"
              value={config.pricingConfig.basePrice}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  pricingConfig: {
                    ...prev.pricingConfig,
                    basePrice: Number(e.target.value),
                  },
                }));
                setSaved(false);
              }}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              Rounding Increment
            </label>
            <input
              type="number"
              value={config.pricingConfig.roundingIncrement}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  pricingConfig: {
                    ...prev.pricingConfig,
                    roundingIncrement: Number(e.target.value),
                  },
                }));
                setSaved(false);
              }}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Range Low %</label>
            <input
              type="number"
              step="0.01"
              value={config.pricingConfig.rangeLowPercent}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  pricingConfig: {
                    ...prev.pricingConfig,
                    rangeLowPercent: Number(e.target.value),
                  },
                }));
                setSaved(false);
              }}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Range High %</label>
            <input
              type="number"
              step="0.01"
              value={config.pricingConfig.rangeHighPercent}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  pricingConfig: {
                    ...prev.pricingConfig,
                    rangeHighPercent: Number(e.target.value),
                  },
                }));
                setSaved(false);
              }}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Steps</h3>
          <div className="flex gap-2">
            {(
              [
                ["questions", "Questions"],
                ["contact_gate", "Contact Gate"],
                ["results", "Results"],
                ["needs_review", "Needs Review"],
              ] as [StepType, string][]
            ).map(([type, label]) => (
              <button
                key={type}
                onClick={() => addStep(type)}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                + {label}
              </button>
            ))}
          </div>
        </div>

        {config.steps.length === 0 && (
          <div className="rounded-lg border-2 border-dashed bg-gray-50 p-8 text-center text-sm text-gray-400">
            No steps yet. Add a step using the buttons above.
          </div>
        )}

        {config.steps.map((step, idx) => (
          <div
            key={step.id}
            className="rounded-lg border bg-white shadow-sm"
          >
            {/* Step header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <button
                onClick={() =>
                  setExpandedStep(expandedStep === step.id ? null : step.id)
                }
                className="flex items-center gap-2 text-left"
              >
                <span className="text-gray-400">{expandedStep === step.id ? "▼" : "▶"}</span>
                <span className="text-sm font-medium text-gray-900">
                  {step.title}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {step.type}
                </span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveStep(step.id, "up")}
                  disabled={idx === 0}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveStep(step.id, "down")}
                  disabled={idx === config.steps.length - 1}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeStep(step.id)}
                  className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Step body */}
            {expandedStep === step.id && (
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-xs text-gray-500">
                    Step Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => renameStep(step.id, e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {step.type === "questions" && (
                  <StepEditor
                    questions={step.questions}
                    onChange={(questions) =>
                      updateStepQuestions(step.id, questions)
                    }
                  />
                )}

                {step.type === "contact_gate" && (
                  <p className="text-sm text-gray-500">
                    This step collects contact information before showing
                    results. No additional configuration needed.
                  </p>
                )}

                {step.type === "results" && (
                  <p className="text-sm text-gray-500">
                    This step displays the calculated quote to the user. No
                    additional configuration needed.
                  </p>
                )}

                {step.type === "needs_review" && (
                  <p className="text-sm text-gray-500">
                    This step flags the submission for manual review. No
                    additional configuration needed.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white py-4">
        {saved && (
          <span className="text-sm text-green-600">Saved!</span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
