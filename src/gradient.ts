import {
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_COLORS,
} from "./types";

/**
 * Build a CSS `linear-gradient(...)` from an angle and color list.
 *
 * - Plain color values are evenly spaced across 0–100%.
 * - Strings that already include a stop (e.g. `"#006CF6 52%"`) are used as-is.
 */
export function buildLinearGradient(
  colors: readonly string[] = DEFAULT_GRADIENT_COLORS,
  angle: number = DEFAULT_GRADIENT_ANGLE,
): string {
  const list = colors.length ? colors : DEFAULT_GRADIENT_COLORS;

  const stops = list.map((color, i) => {
    const trimmed = color.trim();
    // Already a full stop: "color 52%"
    if (/\s-?\d+(\.\d+)?%\s*$/.test(trimmed)) {
      return trimmed;
    }
    if (list.length === 1) return trimmed;
    const pct = Math.round((i / (list.length - 1)) * 100);
    return `${trimmed} ${pct}%`;
  });

  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}
