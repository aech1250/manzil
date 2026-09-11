import type * as React from "react";
import type { StepProgressIcons, StepStatus } from "./types";

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5L9.5 17L19 7.5" />
    </svg>
  );
}

/** Circular loading indicator for `ongoing` steps */
export function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="40 16"
      />
    </svg>
  );
}

export function getAsset(
  status: StepStatus,
  customIcons?: StepProgressIcons,
  meta?: { index: number; label: string },
): React.ReactNode | null {
  if (status === "complete") {
    if (customIcons?.complete) {
      return typeof customIcons.complete === "function" && meta
        ? customIcons.complete(meta)
        : (customIcons.complete as React.ReactNode);
    }
    return <CheckIcon className="step-progress__icon step-progress__icon--past" />;
  }

  if (status === "ongoing") {
    if (customIcons?.ongoing) {
      return typeof customIcons.ongoing === "function" && meta
        ? customIcons.ongoing(meta)
        : (customIcons.ongoing as React.ReactNode);
    }
    return <SpinnerIcon className="step-progress__icon step-progress__icon--spinner" />;
  }

  return null;
}
