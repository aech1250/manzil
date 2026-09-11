"use client";

import * as React from "react";
import { createStepProgress, stepProgress } from "./state";
import type {
  StepProgressPromiseOptions,
  StepProgressState,
  StepProgressStore,
  UseStepProgressOptions,
  UseStepProgressReturn,
} from "./types";

export function useStepProgressStore(
  store: StepProgressStore,
): StepProgressState;
export function useStepProgressStore(
  store?: StepProgressStore,
): StepProgressState | null;
export function useStepProgressStore(
  store?: StepProgressStore,
): StepProgressState | null {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (!store) return () => {};
      return store.subscribe(callback);
    },
    [store],
  );

  const getSnapshot = React.useCallback(() => {
    return store ? store.getState() : null;
  }, [store]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useStepProgress(
  options: UseStepProgressOptions,
): UseStepProgressReturn {
  const { steps, initialStep = 0, initialStatuses, store: customStore } = options;

  // Lazily instantiate a store if not provided
  const storeRef = React.useRef<StepProgressStore | null>(null);
  if (!customStore && !storeRef.current) {
    storeRef.current = createStepProgress({
      steps,
      initialStep,
      initialStatuses,
    });
  }

  const activeStore = customStore ?? storeRef.current ?? stepProgress;
  const state = useStepProgressStore(activeStore);

  const stepsCount = steps?.length ?? 4;
  const isFirst = state.value === 0;
  const isLast = state.value >= stepsCount - 1;

  return {
    step: state.value,
    statuses: state.statuses,
    setStep: activeStore.setValue,
    setStatus: activeStore.setStatus,
    next: activeStore.next,
    prev: activeStore.prev,
    goTo: activeStore.goTo,
    complete: activeStore.complete,
    reset: activeStore.reset,
    isFirst,
    isLast,
    isOngoing: state.isOngoing,
    isCompleted: state.isCompleted,
    promise: <T,>(
      promise: Promise<T> | (() => Promise<T>),
      promiseOptions?: StepProgressPromiseOptions<T>,
    ) => activeStore.promise(promise, promiseOptions),
    props: {
      steps,
      value: state.value,
      statuses: state.statuses,
    },
  };
}
