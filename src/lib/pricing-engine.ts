import type { FlowConfig, Step, Question, PricingConfig } from "./flow-types";

export interface PricingResult {
  exact: number;
  rangeLow: number;
  rangeHigh: number;
}

export function calculateQuote(
  config: FlowConfig,
  answers: Record<string, string | string[] | number | boolean>
): PricingResult {
  const { pricingConfig, steps } = config;
  let subtotal = pricingConfig.basePrice;

  // Walk through all question steps and apply pricing impacts
  for (const step of steps) {
    if (step.type !== "questions") continue;
    for (const question of step.questions) {
      const answer = answers[question.id];
      if (answer === undefined || answer === null || answer === "") continue;
      subtotal = applyPricingImpact(subtotal, question, answer, pricingConfig);
    }
  }

  // Apply caps
  if (pricingConfig.minCap !== null && subtotal < pricingConfig.minCap) {
    subtotal = pricingConfig.minCap;
  }
  if (pricingConfig.maxCap !== null && subtotal > pricingConfig.maxCap) {
    subtotal = pricingConfig.maxCap;
  }

  // Apply rounding
  const increment = pricingConfig.roundingIncrement;
  if (increment > 0) {
    subtotal = Math.round(subtotal / increment) * increment;
  }

  // Calculate range
  const rangeLow = Math.round(
    (subtotal * pricingConfig.rangeLowPercent) / (increment || 1)
  ) * (increment || 1);
  const rangeHigh = Math.round(
    (subtotal * pricingConfig.rangeHighPercent) / (increment || 1)
  ) * (increment || 1);

  return {
    exact: subtotal,
    rangeLow,
    rangeHigh,
  };
}

function applyPricingImpact(
  subtotal: number,
  question: Question,
  answer: string | string[] | number | boolean,
  pricingConfig: PricingConfig
): number {
  const { kind, value } = question.pricingImpact;
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  switch (kind) {
    case "none":
      return subtotal;

    case "sets_base": {
      // If the answer itself is a number (e.g., selected option value), use it as base
      // Otherwise use the configured value
      const selectedValue = parseFloat(String(answer));
      if (!isNaN(selectedValue) && selectedValue > 0) {
        return selectedValue;
      }
      return numericValue > 0 ? numericValue : subtotal;
    }

    case "add_fixed": {
      // For select types, add the value if an option is selected
      // For yes_no, add if answer is true/yes
      if (question.type === "yes_no") {
        const isYes = answer === true || answer === "yes" || answer === "true";
        return isYes ? subtotal + numericValue : subtotal;
      }
      return subtotal + numericValue;
    }

    case "multiply": {
      // For select types, use the selected option's value as multiplier if numeric
      if (
        question.type === "single_select" ||
        question.type === "multi_select"
      ) {
        const selectedVal = parseFloat(String(answer));
        if (!isNaN(selectedVal)) {
          return subtotal * selectedVal;
        }
      }
      return subtotal * numericValue;
    }

    case "unit_rate": {
      // Multiply the answer (a number) by the unit rate and add to subtotal
      const qty = parseFloat(String(answer));
      if (!isNaN(qty)) {
        return subtotal + qty * numericValue;
      }
      return subtotal;
    }

    case "select_package": {
      // Look up package price from pricingConfig.packages if available
      const packages = (pricingConfig as unknown as Record<string, unknown>).packages as
        | Record<string, number>
        | undefined;
      if (packages && typeof answer === "string" && packages[answer]) {
        return packages[answer];
      }
      return subtotal;
    }

    default:
      return subtotal;
  }
}
