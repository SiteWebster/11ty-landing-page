"use client";

import { ContactGateStep } from "./contact-gate-step";

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface NeedsReviewStepProps {
  contactCaptured: boolean;
  initialContact: ContactInfo | null;
  onContactSubmit: (contact: ContactInfo) => void;
}

export function NeedsReviewStep({
  contactCaptured,
  initialContact,
  onContactSubmit,
}: NeedsReviewStepProps) {
  if (contactCaptured) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Review Required
        </h3>
        <p className="text-sm text-gray-600">
          Based on your responses, your quote requires manual review by our
          team. We&apos;ll be in touch within 1 business day with your
          personalized quote.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Your quote requires manual review. Please provide your contact
          information so our team can reach out with your personalized quote.
        </p>
      </div>
      <ContactGateStep
        initialContact={initialContact}
        onSubmit={onContactSubmit}
      />
    </div>
  );
}
