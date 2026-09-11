import type * as React from "react";

export type StepProgressSize = "sm" | "md" | "lg";

/** Explicit node status. When omitted, status is derived from `value`. */
export type StepStatus = "complete" | "ongoing" | "upcoming";

/**
 * Relative widths of the three shimmer parts: low → bright → low.
 * Values are weights (not required to sum to 1); they are normalized.
 */
export interface ShimmerBand {
  /** Soft ramp into the highlight. Default `1`. */
  leading?: number;
  /** Bright core (highlight). Default `0.35` (~matches original 47–53%). */
  highlight?: number;
  /** Soft ramp out of the highlight. Default `1`. */
  trailing?: number;
  /** Peak highlight opacity 0–1. Default `0.9`. */
  intensity?: number;
}

export type IconRenderer =
  | React.ReactNode
  | ((props: { index: number; label: string }) => React.ReactNode);

export interface StepProgressIcons {
  complete?: IconRenderer;
  ongoing?: IconRenderer;
}

export interface StepProgressClassnames {
  root?: string;
  trackWrap?: string;
  track?: string;
  fill?: string;
  shimmer?: string;
  nodes?: string;
  node?: string;
  nodeMarker?: string;
  label?: string;
  badge?: string;
  underline?: string;
  icon?: string;
  num?: string;
}

export interface StepProgressProps {
  /** Step labels — also defines how many segments the bar has */
  steps: string[];
  /** Current step index (0-based). Drives fill width and node states. Optional when `store` is provided. */
  value?: number;
  /** Extra class name on the outer wrapper */
  className?: string;
  /** Visual size. Default `"md"`. */
  size?: StepProgressSize;
  /** Show step labels under the nodes. Default `true`. */
  showLabels?: boolean;
  /**
   * Soft shimmer on the fill. Default `true`.
   * Automatically suppressed when all steps are completed.
   */
  showShimmer?: boolean;
  /**
   * Custom fill percentages per step index.
   * Defaults to the front-loaded curve from `getStepProgress(steps.length)`.
   */
  progressStops?: number[];
  /** Dim the bar and block pointer events. Visual only. */
  disabled?: boolean;
  /**
   * Colors for the fill gradient, start → end.
   * Default is the navy → ice palette.
   * Evenly spaced unless you pass full CSS stop strings (e.g. `"#006CF6 52%"`).
   */
  gradientColors?: string[];
  /**
   * Angle of the fill gradient in degrees.
   * Default `90` (left → right).
   */
  gradientAngle?: number;
  /**
   * Angle of the shimmer sweep in degrees.
   * Default `75`.
   */
  shimmerAngle?: number;
  /**
   * Leading / highlight / trailing widths for the shimmer band.
   * Applied for every segment unless `shimmerBands` overrides.
   */
  shimmerBand?: ShimmerBand;
  /**
   * Per-segment shimmer bands.
   * Index `i` is used while `value === i` (segment from step i toward i+1).
   * Falls back to `shimmerBand`, then defaults.
   */
  shimmerBands?: ShimmerBand[];
  /**
   * Shimmer sweep duration in seconds.
   * Default `1.7`.
   */
  shimmerDuration?: number;
  /**
   * Per-step status. When set, drives node icons:
   * - `complete` → check
   * - `ongoing` → loading spinner
   * - `upcoming` → step number
   * Fill width still follows `value` unless you change it yourself.
   */
  statuses?: StepStatus[];
  /** Optional custom icons for completed and ongoing steps. */
  icons?: StepProgressIcons;
  /** Granular class names for every sub-element of the component (Tailwind-friendly). */
  classNames?: StepProgressClassnames;
  /** Optional external stepProgress store (or observer instance). */
  store?: StepProgressStore;
  /** Strip default visual styles (borders, shadows, background) while keeping layout geometry. */
  unstyled?: boolean;
  /** Text and layout direction ('ltr' or 'rtl'). Defaults to 'ltr'. */
  dir?: "ltr" | "rtl" | "auto";
  /** Callback fired when a step node is clicked. If provided, nodes become accessible interactive buttons. */
  onStepClick?: (stepIndex: number, stepLabel: string) => void;
  /** Accessible label for the progressbar. Default `"Progress"`. */
  "aria-label"?: string;
  /** Accessible text describing current progress. Default `"Step {current} of {total}: {label}"`. */
  "aria-valuetext"?:
    | string
    | ((props: { current: number; total: number; label: string }) => string);
}

export type ProgressStops = number[];

/** Default navy → ice fill colors (matches original artifact) */
export const DEFAULT_GRADIENT_COLORS = [
  "#000A20",
  "#001535",
  "#002860",
  "#006CF6",
  "#73B3FF",
  "#D3EAFF",
  "#E8F7FF",
] as const;

export const DEFAULT_GRADIENT_ANGLE = 90;
export const DEFAULT_SHIMMER_ANGLE = 75;
export const DEFAULT_SHIMMER_DURATION = 1.7;

/** Default band weights — soft edges, narrow highlight */
export const DEFAULT_SHIMMER_BAND: Required<ShimmerBand> = {
  leading: 1.6,
  highlight: 0.2,
  trailing: 1.6,
  intensity: 0.9,
};

/* ── State & Store Interfaces ──────────────────────────────── */

export interface StepProgressState {
  value: number;
  statuses?: StepStatus[];
  isOngoing: boolean;
  isCompleted: boolean;
}

export type StepProgressSubscriber = (state: StepProgressState) => void;

export interface StepProgressPromiseOptions<T = any> {
  loading?: string;
  success?: string | ((data: T) => string | void);
  error?: string | ((err: any) => string | void);
  advanceOnSuccess?: boolean;
}

export interface StepProgressStore {
  getState: () => StepProgressState;
  subscribe: (subscriber: StepProgressSubscriber) => () => void;
  setValue: (value: number) => void;
  setStatus: (stepIndex: number, status: StepStatus) => void;
  setStatuses: (statuses: StepStatus[]) => void;
  next: () => void;
  prev: () => void;
  goTo: (stepIndex: number) => void;
  complete: () => void;
  reset: () => void;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: StepProgressPromiseOptions<T>,
  ) => Promise<T>;
}

export interface UseStepProgressOptions {
  steps: string[];
  initialStep?: number;
  initialStatuses?: StepStatus[];
  store?: StepProgressStore;
}

export interface UseStepProgressReturn {
  step: number;
  statuses?: StepStatus[];
  setStep: (step: number) => void;
  setStatus: (stepIndex: number, status: StepStatus) => void;
  next: () => void;
  prev: () => void;
  goTo: (stepIndex: number) => void;
  complete: () => void;
  reset: () => void;
  isFirst: boolean;
  isLast: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: StepProgressPromiseOptions<T>,
  ) => Promise<T>;
  props: {
    steps: string[];
    value: number;
    statuses?: StepStatus[];
  };
}
