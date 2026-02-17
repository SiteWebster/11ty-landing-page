"use client";

import type { Question } from "@/lib/flow-types";

interface QuestionsStepProps {
  questions: Question[];
  answers: Record<string, string | string[] | number | boolean>;
  onUpdate: (answers: Record<string, string | string[] | number | boolean>) => void;
}

export function QuestionsStep({
  questions,
  answers,
  onUpdate,
}: QuestionsStepProps) {
  function setValue(questionId: string, value: string | string[] | number | boolean) {
    onUpdate({ [questionId]: value });
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {q.label}
            {q.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {q.helpText && (
            <p className="mb-2 text-xs text-gray-500">{q.helpText}</p>
          )}

          {q.type === "text" && (
            <input
              type="text"
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setValue(q.id, e.target.value)}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {q.type === "number" && (
            <input
              type="number"
              value={(answers[q.id] as number) ?? ""}
              onChange={(e) =>
                setValue(
                  q.id,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {q.type === "yes_no" && (
            <div className="flex gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  onClick={() => setValue(q.id, val)}
                  className={`rounded border px-6 py-2 text-sm font-medium ${
                    answers[q.id] === val
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          )}

          {q.type === "single_select" && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center rounded border px-4 py-3 text-sm ${
                    answers[q.id] === opt.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={(e) => setValue(q.id, e.target.value)}
                    className="mr-3"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {q.type === "multi_select" && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = Array.isArray(answers[q.id])
                  ? (answers[q.id] as string[])
                  : [];
                const isChecked = selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center rounded border px-4 py-3 text-sm ${
                      isChecked
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const next = isChecked
                          ? selected.filter((v) => v !== opt.value)
                          : [...selected, opt.value];
                        setValue(q.id, next);
                      }}
                      className="mr-3"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
