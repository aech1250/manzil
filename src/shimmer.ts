import type { ShimmerBand } from "./types";
import { DEFAULT_SHIMMER_ANGLE, DEFAULT_SHIMMER_BAND } from "./types";

export function resolveShimmerBand(
  value: number,
  band?: ShimmerBand,
  bands?: ShimmerBand[],
): Required<ShimmerBand> {
  const fromList =
    bands && bands.length
      ? bands[Math.max(0, Math.min(value, bands.length - 1))]
      : undefined;
  const src = fromList ?? band ?? {};
  return {
    leading: Math.max(0, src.leading ?? DEFAULT_SHIMMER_BAND.leading),
    highlight: Math.max(0.0001, src.highlight ?? DEFAULT_SHIMMER_BAND.highlight),
    trailing: Math.max(0, src.trailing ?? DEFAULT_SHIMMER_BAND.trailing),
    intensity: clamp01(src.intensity ?? DEFAULT_SHIMMER_BAND.intensity),
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Build the shimmer stripe gradient.
 * Structure: transparent → leading ramp → highlight → trailing ramp → transparent
 * (same low → bright → low model as the original artifact).
 */
export function buildShimmerGradient(
  angle: number = DEFAULT_SHIMMER_ANGLE,
  band: Required<ShimmerBand> = DEFAULT_SHIMMER_BAND,
): string {
  const { leading, highlight, trailing, intensity } = band;
  const total = leading + highlight + trailing || 1;
  // Band occupies the middle 40% of the gradient image (original: 30%–70%)
  const bandSpan = 40;
  const margin = (100 - bandSpan) / 2;
  const leadEnd = margin + (leading / total) * bandSpan;
  const highEnd = margin + ((leading + highlight) / total) * bandSpan;
  const trailEnd = margin + bandSpan;
  const c = `rgba(255, 255, 255, ${intensity})`;

  return [
    `linear-gradient(${angle}deg,`,
    `transparent ${round(margin)}%,`,
    `${c} ${round(leadEnd)}%,`,
    `${c} ${round(highEnd)}%,`,
    `transparent ${round(trailEnd)}%)`,
  ].join(" ");
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
