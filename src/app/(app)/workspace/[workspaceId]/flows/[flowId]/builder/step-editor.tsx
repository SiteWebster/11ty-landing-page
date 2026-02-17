"use client";

import { useState } from "react";
import type {
  Question,
  QuestionType,
  PricingKind,
  QuestionOption,
} from "@/lib/flow-types";
import { createQuestion } from "@/lib/flow-types";

interface StepEditorProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "yes_no", label: "Yes/No" },
  { value: "single_select", label: "Single Select" },
  { value: "multi_select", label: "Multi Select" },
];

const PRICING_KINDS: { value: PricingKind; label: string }[] = [
  { value: "none", label: "None" },
  { value: "add_fixed", label: "Add Fixed" },
  { value: "multiply", label: "Multiply" },
  { value: "unit_rate", label: "Unit Rate" },
  { value: "select_package", label: "Select Package" },
  { value: "sets_base", label: "Sets Base" },
];

export function StepEditor({ questions, onChange }: StepEditorProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  function addQuestion() {
    const q = createQuestion();
    onChange([...questions, q]);
    setExpandedQuestion(q.id);
  }

  function removeQuestion(qId: string) {
    onChange(questions.filter((q) => q.id !== qId));
    if (expandedQuestion === qId) setExpandedQuestion(null);
  }

  function moveQuestion(qId: string, direction: "up" | "down") {
    const idx = questions.findIndex((q) => q.id === qId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const copy = [...questions];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    onChange(copy);
  }

  function updateQuestion(qId: string, updates: Partial<Question>) {
    onChange(
      questions.map((q) => (q.id === qId ? { ...q, ...updates } : q))
    );
  }

  function updateOption(
    qId: string,
    optIdx: number,
    updates: Partial<QuestionOption>
  ) {
    onChange(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const options = q.options.map((opt, i) =>
          i === optIdx ? { ...opt, ...updates } : opt
        );
        return { ...q, options };
      })
    );
  }

  function addOption(qId: string) {
    onChange(
      questions.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: [...q.options, { label: "", value: "" }],
        };
      })
    );
  }

  function removeOption(qId: string, optIdx: number) {
    onChange(
      questions.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optIdx),
        };
      })
    );
  }

  const hasSelectType = (type: QuestionType) =>
    type === "single_select" || type === "multi_select";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase text-gray-500">
          Questions ({questions.length})
        </h4>
        <button
          onClick={addQuestion}
          className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          + Add Question
        </button>
      </div>

      {questions.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">
          No questions. Click &quot;Add Question&quot; to get started.
        </p>
      )}

      {questions.map((q, idx) => (
        <div
          key={q.id}
          className="rounded border bg-gray-50"
        >
          {/* Question header */}
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={() =>
                setExpandedQuestion(
                  expandedQuestion === q.id ? null : q.id
                )
              }
              className="flex items-center gap-2 text-left text-sm"
            >
              <span className="text-gray-400">
                {expandedQuestion === q.id ? "▼" : "▶"}
              </span>
              <span className="font-medium text-gray-800">
                {q.label || "(untitled question)"}
              </span>
              <span className="text-xs text-gray-400">{q.type}</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveQuestion(q.id, "up")}
                disabled={idx === 0}
                className="rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestion(q.id, "down")}
                disabled={idx === questions.length - 1}
                className="rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => removeQuestion(q.id)}
                className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Question body */}
          {expandedQuestion === q.id && (
            <div className="space-y-3 border-t px-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">Label</label>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) =>
                      updateQuestion(q.id, { label: e.target.value })
                    }
                    placeholder="e.g. What is your home's square footage?"
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Help Text
                  </label>
                  <input
                    type="text"
                    value={q.helpText}
                    onChange={(e) =>
                      updateQuestion(q.id, { helpText: e.target.value })
                    }
                    placeholder="Optional helper text"
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">Type</label>
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        type: e.target.value as QuestionType,
                        options: hasSelectType(e.target.value as QuestionType)
                          ? q.options.length > 0
                            ? q.options
                            : [{ label: "", value: "" }]
                          : [],
                      })
                    }
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {QUESTION_TYPES.map((qt) => (
                      <option key={qt.value} value={qt.value}>
                        {qt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Required
                  </label>
                  <select
                    value={q.required ? "yes" : "no"}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        required: e.target.value === "yes",
                      })
                    }
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Pricing Impact
                  </label>
                  <select
                    value={q.pricingImpact.kind}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        pricingImpact: {
                          ...q.pricingImpact,
                          kind: e.target.value as PricingKind,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PRICING_KINDS.map((pk) => (
                      <option key={pk.value} value={pk.value}>
                        {pk.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {q.pricingImpact.kind !== "none" && (
                <div>
                  <label className="block text-xs text-gray-500">
                    Pricing Value
                  </label>
                  <input
                    type="text"
                    value={q.pricingImpact.value}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        pricingImpact: {
                          ...q.pricingImpact,
                          value: isNaN(Number(e.target.value))
                            ? e.target.value
                            : Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Options (for select types) */}
              {hasSelectType(q.type) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">
                      Options
                    </label>
                    <button
                      onClick={() => addOption(q.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) =>
                          updateOption(q.id, optIdx, {
                            label: e.target.value,
                            value:
                              opt.value === "" ||
                              opt.value === slugify(opt.label)
                                ? slugify(e.target.value)
                                : opt.value,
                          })
                        }
                        placeholder="Label"
                        className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={opt.value}
                        onChange={(e) =>
                          updateOption(q.id, optIdx, {
                            value: e.target.value,
                          })
                        }
                        placeholder="Value"
                        className="block w-40 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeOption(q.id, optIdx)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
