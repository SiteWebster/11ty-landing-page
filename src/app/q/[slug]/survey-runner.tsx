"use client";

import { useState, useEffect, useCallback } from "react";
import type { FlowConfig } from "@/lib/flow-types";
import { QuestionsStep } from "./steps/questions-step";
import { ContactGateStep } from "./steps/contact-gate-step";
import { ResultsStep } from "./steps/results-step";
import { NeedsReviewStep } from "./steps/needs-review-step";

interface SurveyRunnerProps {
  flowId: string;
  flowName: string;
  config: FlowConfig;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SubmissionResult {
  exact: number;
  rangeLow: number;
  rangeHigh: number;
}

export function SurveyRunner({ flowId, flowName, config }: SurveyRunnerProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number | boolean>>({});
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const steps = config.steps;
  const currentStep = steps[currentStepIdx];
  const totalSteps = steps.length;

  // Create session on mount
  useEffect(() => {
    fetch(`/api/survey/${flowId}/session`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.sessionId) setSessionId(data.sessionId);
      })
      .catch(() => {});
  }, [flowId]);

  // Persist answers to session
  const persistAnswers = useCallback(
    (updatedAnswers: Record<string, string | string[] | number | boolean>) => {
      if (!sessionId) return;
      fetch(`/api/survey/${flowId}/session`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: updatedAnswers }),
      }).catch(() => {});
    },
    [flowId, sessionId]
  );

  function updateAnswers(
    newAnswers: Record<string, string | string[] | number | boolean>
  ) {
    const merged = { ...answers, ...newAnswers };
    setAnswers(merged);
    persistAnswers(merged);
  }

  function goNext() {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  }

  function goBack() {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  }

  async function handleContactSubmit(contactInfo: ContactInfo) {
    setContact(contactInfo);
    goNext();
  }

  async function handleSubmit() {
    if (!contact) return;

    const res = await fetch(`/api/survey/${flowId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, contact, answers }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.result);
      setSubmitted(true);
    }
  }

  // Check if we can proceed past a step
  function canProceed(): boolean {
    if (!currentStep) return false;
    if (currentStep.type === "questions") {
      // Check all required questions are answered
      for (const q of currentStep.questions) {
        if (!q.required) continue;
        const answer = answers[q.id];
        if (answer === undefined || answer === null || answer === "") {
          return false;
        }
        if (Array.isArray(answer) && answer.length === 0) {
          return false;
        }
      }
      return true;
    }
    return true;
  }

  // For results step: block if contact not captured
  const contactCaptured = contact !== null;

  // If we hit a results step without contact, find the contact_gate step
  if (
    currentStep?.type === "results" &&
    !contactCaptured &&
    !submitted
  ) {
    const contactGateIdx = steps.findIndex((s) => s.type === "contact_gate");
    if (contactGateIdx >= 0 && contactGateIdx !== currentStepIdx) {
      setCurrentStepIdx(contactGateIdx);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{flowName}</h1>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
          <span>{currentStep?.title}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentStepIdx + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {currentStep?.title}
        </h2>

        {currentStep?.type === "questions" && (
          <QuestionsStep
            questions={currentStep.questions}
            answers={answers}
            onUpdate={updateAnswers}
          />
        )}

        {currentStep?.type === "contact_gate" && (
          <ContactGateStep
            initialContact={contact}
            onSubmit={handleContactSubmit}
          />
        )}

        {currentStep?.type === "results" && submitted && result && (
          <ResultsStep
            result={result}
            displayMode={config.displayMode}
          />
        )}

        {currentStep?.type === "results" && !submitted && contactCaptured && (
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              Ready to see your estimate?
            </p>
            <button
              onClick={handleSubmit}
              className="rounded bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get My Quote
            </button>
          </div>
        )}

        {currentStep?.type === "needs_review" && (
          <NeedsReviewStep
            contactCaptured={contactCaptured}
            onContactSubmit={handleContactSubmit}
            initialContact={contact}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep?.type !== "contact_gate" && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={currentStepIdx === 0}
            className="rounded border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
          >
            Back
          </button>

          {currentStep?.type === "questions" && (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
