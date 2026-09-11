"use client";

import * as React from "react";
import "./styles.css";

import { getAsset } from "./assets";
import { getStepProgress } from "./progress";
import { buildLinearGradient } from "./gradient";
import { buildShimmerGradient, resolveShimmerBand } from "./shimmer";
import { useStepProgressStore } from "./hooks";
import {
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_COLORS,
  DEFAULT_SHIMMER_ANGLE,
  DEFAULT_SHIMMER_DURATION,
} from "./types";
import type {
  StepProgressProps,
  StepStatus,
} from "./types";

/** 75% solid → transparent feather (mid-step mask) */
const FILL_MASK =
  "linear-gradient(to right, black 0%, black 75%, transparent 100%)";

export function StepProgress({
  steps,
  value: controlledValue,
  className = "",
  size = "md",
  showLabels = true,
  showShimmer = true,
  progressStops,
  disabled = false,
  gradientColors,
  gradientAngle = DEFAULT_GRADIENT_ANGLE,
  shimmerAngle = DEFAULT_SHIMMER_ANGLE,
  shimmerBand,
  shimmerBands,
  statuses: controlledStatuses,
  shimmerDuration = DEFAULT_SHIMMER_DURATION,
  icons,
  classNames,
  store,
  unstyled = false,
  dir = "ltr",
  onStepClick,
  "aria-label": ariaLabel = "Progress",
  "aria-valuetext": ariaValueText,
}: StepProgressProps) {
  // Subscribe to store state unconditionally (zero Rules of Hooks violations)
  const storeState = useStepProgressStore(store);
  const activeValue = storeState ? storeState.value : (controlledValue ?? 0);
  const activeStatuses = storeState?.statuses ?? controlledStatuses;

  const count = steps.length;
  const stops = progressStops ?? getStepProgress(count);
  const clamped = Math.max(0, Math.min(activeValue, count - 1));
  const progress = stops[clamped] ?? 100;
  const isLast = clamped >= count - 1;

  // When statuses are provided, shimmer continues if any step is "ongoing"
  const hasOngoing = activeStatuses
    ? activeStatuses.some((s) => s === "ongoing")
    : false;
  const isCompleted = activeStatuses
    ? !hasOngoing && activeStatuses[count - 1] === "complete"
    : isLast;
  const shimmer = showShimmer && (!isCompleted || hasOngoing);

  const fillGradient = unstyled
    ? undefined
    : buildLinearGradient(
        gradientColors ?? DEFAULT_GRADIENT_COLORS,
        gradientAngle,
      );

  const band = resolveShimmerBand(clamped, shimmerBand, shimmerBands);
  const shimmerBackground = buildShimmerGradient(shimmerAngle, band);

  const computedAriaValueText =
    typeof ariaValueText === "function"
      ? ariaValueText({
          current: clamped + 1,
          total: count,
          label: steps[clamped] ?? "",
        })
      : ariaValueText ?? `Step ${clamped + 1} of ${count}: ${steps[clamped] ?? ""}`;

  return (
    <div
      className={`step-progress ${className} ${classNames?.root ?? ""}`.trim()}
      data-size={size}
      data-disabled={disabled || undefined}
      data-unstyled={unstyled || undefined}
      dir={dir}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={clamped}
      aria-label={ariaLabel}
      aria-valuetext={computedAriaValueText}
    >
      <div
        className={`step-progress__track-wrap ${classNames?.trackWrap ?? ""}`.trim()}
      >
        <div
          className={`step-progress__track ${classNames?.track ?? ""}`.trim()}
          aria-hidden="true"
        >
          <div
            className={`step-progress__fill ${
              isLast ? "step-progress__fill--final" : ""
            } ${classNames?.fill ?? ""}`.trim()}
            data-final={isLast ? "true" : "false"}
            style={
              unstyled
                ? { width: `${progress}%` }
                : ({
                    width: `${progress}%`,
                    background: fillGradient,
                    WebkitMaskImage: isLast ? undefined : FILL_MASK,
                    maskImage: isLast ? undefined : FILL_MASK,
                  } as React.CSSProperties)
            }
          >
            {shimmer && (
              <div
                className={`step-progress__shimmer ${classNames?.shimmer ?? ""}`.trim()}
                style={{
                  backgroundImage: shimmerBackground,
                  animationDuration: `${shimmerDuration}s`,
                }}
              />
            )}
          </div>
        </div>

        <div
          className={`step-progress__nodes ${classNames?.nodes ?? ""}`.trim()}
        >
          {steps.map((label, index) => {
            const explicit = activeStatuses?.[index];
            const isActive = index === clamped;
            const isPast = index < clamped;
            const isFuture = index > clamped;

            const isFinal = index === count - 1;
            const isComplete = explicit
              ? explicit === "complete"
              : isPast || (isActive && isFinal);
            const isOngoing = explicit
              ? explicit === "ongoing"
              : isActive && !isFinal;
            const isUpcoming = explicit
              ? explicit === "upcoming"
              : isFuture;

            const currentStatus: StepStatus = explicit
              ? explicit
              : isComplete
                ? "complete"
                : isOngoing
                  ? "ongoing"
                  : "upcoming";

            const isReached = isComplete || isOngoing;
            const isInteractive = Boolean(onStepClick);

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onStepClick?.(index, label);
              }
            };

            return (
              <div
                key={`${label}-${index}`}
                className={`step-progress__node ${classNames?.node ?? ""}`.trim()}
                data-state={
                  isComplete
                    ? "completed"
                    : isOngoing
                      ? "current"
                      : "upcoming"
                }
                data-status={currentStatus}
                data-active={isOngoing || undefined}
                data-past={isComplete || undefined}
                data-future={isUpcoming || undefined}
                data-clickable={isInteractive || undefined}
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={isInteractive ? () => onStepClick?.(index, label) : undefined}
                onKeyDown={isInteractive ? handleKeyDown : undefined}
                aria-current={isActive ? "step" : undefined}
                aria-label={isInteractive ? `Step ${index + 1}: ${label}` : undefined}
              >
                <div className="step-progress__node-btn-wrap">
                  <div
                    className={`step-progress__node-marker ${classNames?.nodeMarker ?? ""}`.trim()}
                    style={
                      unstyled
                        ? undefined
                        : nodeMarkerStyle(isReached, isOngoing)
                    }
                    aria-hidden="true"
                  >
                    {isUpcoming ? (
                      <span
                        className={`step-progress__num ${classNames?.num ?? ""}`.trim()}
                      >
                        {index + 1}
                      </span>
                    ) : (
                      getAsset(currentStatus, icons, { index, label })
                    )}

                    {isOngoing && (
                      <span
                        className={`step-progress__badge ${classNames?.badge ?? ""}`.trim()}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>

                {showLabels && (
                  <span
                    className={`step-progress__label ${classNames?.label ?? ""}`.trim()}
                  >
                    {label}
                  </span>
                )}

                {showLabels && isOngoing && (
                  <span
                    className={`step-progress__underline ${classNames?.underline ?? ""}`.trim()}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Inline fallback styles matching original artifact for 100% visual parity */
function nodeMarkerStyle(
  isReached: boolean,
  isActive: boolean,
): React.CSSProperties {
  if (isReached) {
    if (isActive) {
      return {
        background: "var(--step-progress-node-bg-active, #FFFFFF)",
        border: "1.5px solid var(--step-progress-node-border-active, #FFFFFF)",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)",
      };
    }
    return {
      background: "var(--step-progress-node-bg-reached, #001535)",
      border: "1px solid var(--step-progress-node-border-reached, rgba(255,255,255,0.18))",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
    };
  }
  return {
    background: "var(--step-progress-node-bg-upcoming, #FFFFFF)",
    border: "1px solid var(--step-progress-node-border-upcoming, #DADADA)",
    boxShadow:
      "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
  };
}

StepProgress.displayName = "StepProgress";

/* ── Public Exports ────────────────────────────────────────── */

export { CheckIcon, SpinnerIcon, getAsset } from "./assets";
export { useStepProgress, useStepProgressStore } from "./hooks";
export {
  StepProgressObserver,
  createStepProgress,
  getStepProgressStore,
  stepProgress,
} from "./state";
export { getStepProgress } from "./progress";
export { buildLinearGradient } from "./gradient";
export { buildShimmerGradient, resolveShimmerBand } from "./shimmer";

export {
  DEFAULT_GRADIENT_COLORS,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_SHIMMER_ANGLE,
  DEFAULT_SHIMMER_BAND,
  DEFAULT_SHIMMER_DURATION,
} from "./types";

export type {
  StepProgressProps,
  StepProgressSize,
  ProgressStops,
  ShimmerBand,
  StepStatus,
  StepProgressIcons,
  StepProgressClassnames,
  StepProgressState,
  StepProgressStore,
  StepProgressPromiseOptions,
  UseStepProgressOptions,
  UseStepProgressReturn,
} from "./types";
