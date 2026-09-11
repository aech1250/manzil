/**
 * Front-loaded progress curve so early steps already read as real progress.
 * e.g. 5 steps → 18 / 36 / 54 / 78 / 100
 */
export function getStepProgress(stepCount: number): number[] {
  if (stepCount === 5) return [18, 36, 54, 78, 100];
  if (stepCount === 4) return [22, 45, 72, 100];
  if (stepCount === 3) return [28, 62, 100];
  if (stepCount === 2) return [38, 100];
  if (stepCount <= 1) return [100];

  return Array.from({ length: stepCount }, (_, i) => {
    if (i === stepCount - 1) return 100;
    return Math.round(18 + (i / (stepCount - 1)) * 82);
  });
}
