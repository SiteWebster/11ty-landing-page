"use client";

import type { DisplayMode } from "@/lib/flow-types";

interface PricingResult {
  exact: number;
  rangeLow: number;
  rangeHigh: number;
}

interface ResultsStepProps {
  result: PricingResult;
  displayMode: DisplayMode;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ResultsStep({ result, displayMode }: ResultsStepProps) {
  return (
    <div className="text-center">
      <p className="mb-6 text-sm text-gray-600">
        Based on your answers, here&apos;s your estimated quote:
      </p>

      {(displayMode === "exact_only" || displayMode === "both") && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Estimated Price</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(result.exact)}
          </p>
        </div>
      )}

      {(displayMode === "range_only" || displayMode === "both") && (
        <div className="mb-4">
          {displayMode === "both" && (
            <p className="mt-4 text-sm text-gray-500">Estimated Range</p>
          )}
          {displayMode === "range_only" && (
            <p className="text-sm text-gray-500">Estimated Range</p>
          )}
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(result.rangeLow)} &ndash;{" "}
            {formatCurrency(result.rangeHigh)}
          </p>
        </div>
      )}

      <div className="mt-8 rounded bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          This is an estimate based on the information provided. A member of our
          team will follow up with a detailed quote.
        </p>
      </div>
    </div>
  );
}
