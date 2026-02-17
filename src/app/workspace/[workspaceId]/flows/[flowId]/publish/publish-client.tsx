"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PublishClientProps {
  workspaceId: string;
  flowId: string;
  contactGates: number;
  results: number;
  totalSteps: number;
  totalQuestions: number;
  publishedVersionNumber: number | null;
  draftVersionNumber: number;
  isLatestPublished: boolean;
  flowStatus: string;
}

export function PublishClient({
  workspaceId,
  flowId,
  contactGates,
  results,
  totalSteps,
  totalQuestions,
  publishedVersionNumber,
  draftVersionNumber,
  isLatestPublished,
  flowStatus,
}: PublishClientProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validationErrors: string[] = [];
  if (contactGates !== 1) {
    validationErrors.push(
      `Need exactly 1 Contact Gate step (found ${contactGates})`
    );
  }
  if (results !== 1) {
    validationErrors.push(
      `Need exactly 1 Results step (found ${results})`
    );
  }
  if (totalSteps === 0) {
    validationErrors.push("Flow has no steps");
  }

  const canPublish = validationErrors.length === 0 && !isLatestPublished;

  async function handlePublish() {
    setPublishing(true);
    setError("");
    setSuccess(false);

    const res = await fetch(
      `/api/workspaces/${workspaceId}/flows/${flowId}/publish`,
      { method: "POST" }
    );

    setPublishing(false);

    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      try {
        const data = await res.json();
        setError(data.error || "Failed to publish");
      } catch {
        setError(`Server error (${res.status}). Make sure you've run: npx prisma db push`);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Current status */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Publish Status
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Flow Status</p>
            <p className="mt-1 font-medium">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  flowStatus === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {flowStatus === "active" ? "Published" : flowStatus}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Published Version</p>
            <p className="mt-1 font-medium text-gray-900">
              {publishedVersionNumber
                ? `v${publishedVersionNumber}`
                : "Not published"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Draft Version</p>
            <p className="mt-1 font-medium text-gray-900">
              v{draftVersionNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Draft Changes</p>
            <p className="mt-1 font-medium text-gray-900">
              {isLatestPublished
                ? "No unpublished changes"
                : "Has unpublished changes"}
            </p>
          </div>
        </div>
      </div>

      {/* Validation */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Validation
        </h3>
        <div className="space-y-2">
          <ValidationItem
            label="Has steps"
            valid={totalSteps > 0}
            detail={`${totalSteps} step(s)`}
          />
          <ValidationItem
            label="Exactly 1 Contact Gate step"
            valid={contactGates === 1}
            detail={`${contactGates} found`}
          />
          <ValidationItem
            label="Exactly 1 Results step"
            valid={results === 1}
            detail={`${results} found`}
          />
          <ValidationItem
            label="Has questions"
            valid={totalQuestions > 0}
            detail={`${totalQuestions} question(s)`}
          />
        </div>
      </div>

      {/* Publish action */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
            Published successfully! The draft remains editable.
          </div>
        )}

        {isLatestPublished ? (
          <p className="text-sm text-gray-500">
            The current draft is already published. Make changes in the Builder
            tab first.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Publish v{draftVersionNumber} as a new version
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This creates an immutable snapshot. The draft stays editable.
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className="rounded bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ValidationItem({
  label,
  valid,
  detail,
}: {
  label: string;
  valid: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          valid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {valid ? "✓" : "✗"}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-xs text-gray-400">{detail}</span>
    </div>
  );
}
