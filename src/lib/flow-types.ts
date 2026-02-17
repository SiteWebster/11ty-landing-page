export type StepType = "questions" | "contact_gate" | "results" | "needs_review";

export type QuestionType =
  | "single_select"
  | "multi_select"
  | "number"
  | "text"
  | "yes_no";

export type PricingKind =
  | "none"
  | "add_fixed"
  | "multiply"
  | "unit_rate"
  | "select_package"
  | "sets_base";

export interface PricingImpact {
  kind: PricingKind;
  value: number | string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  label: string;
  helpText: string;
  type: QuestionType;
  required: boolean;
  options: QuestionOption[];
  pricingImpact: PricingImpact;
}

export interface Step {
  id: string;
  title: string;
  type: StepType;
  questions: Question[];
}

export interface PricingConfig {
  model: string;
  basePrice: number;
  roundingIncrement: number;
  rangeLowPercent: number;
  rangeHighPercent: number;
  minCap: number | null;
  maxCap: number | null;
}

export type DisplayMode = "range_only" | "exact_only" | "both";

export interface FlowConfig {
  slug: string;
  displayMode: DisplayMode;
  steps: Step[];
  pricingConfig: PricingConfig;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  model: "base_multipliers_addons",
  basePrice: 0,
  roundingIncrement: 25,
  rangeLowPercent: 0.92,
  rangeHighPercent: 1.12,
  minCap: null,
  maxCap: null,
};

export function createStep(type: StepType): Step {
  return {
    id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title:
      type === "questions"
        ? "Questions"
        : type === "contact_gate"
          ? "Contact Information"
          : type === "results"
            ? "Results"
            : "Needs Review",
    type,
    questions: [],
  };
}

export function createQuestion(): Question {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    helpText: "",
    type: "text",
    required: true,
    options: [],
    pricingImpact: { kind: "none", value: 0 },
  };
}
