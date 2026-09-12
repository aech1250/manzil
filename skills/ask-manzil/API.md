# Manzil API Reference

Exact props, types, and defaults.

## `<StepProgress />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `string[]` | — | Required. Step labels; also defines segment count. |
| `value` | `number` | `0` | Current step index (0-based). Ignored when `store` is set. |
| `className` | `string` | – | Extra class on the outer wrapper. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track height and node size via CSS variables. |
| `showLabels` | `boolean` | `true` | Show labels under nodes. |
| `showShimmer` | `boolean` | `true` | Shimmer on the fill; auto-suppressed once complete unless a step is `"ongoing"`. |
| `progressStops` | `number[]` | front-loaded curve (`getStepProgress(steps.length)`) | Custom fill % per step index. |
| `disabled` | `boolean` | `false` | Dims the bar and blocks pointer events (visual only). |
| `gradientColors` | `string[]` | navy → ice palette (see below) | Fill gradient stops, start → end. Evenly spaced unless given full CSS stops (`"#006CF6 52%"`). |
| `gradientAngle` | `number` | `90` | Fill gradient angle in degrees. |
| `shimmerAngle` | `number` | `75` | Shimmer sweep angle in degrees. |
| `shimmerBand` | `ShimmerBand` | see `DEFAULT_SHIMMER_BAND` | Leading/highlight/trailing widths + intensity, applied to every segment. |
| `shimmerBands` | `ShimmerBand[]` | – | Per-segment override; index `i` used while `value === i`. Falls back to `shimmerBand`. |
| `shimmerDuration` | `number` | `1.7` | Shimmer sweep duration, seconds. |
| `statuses` | `StepStatus[]` | derived from `value` | Explicit per-step status (`"complete" \| "ongoing" \| "upcoming"`); fill width still follows `value`. |
| `icons` | `StepProgressIcons` | – | Custom icons for `complete`/`ongoing` nodes. Node or `(props: { index, label }) => node`. |
| `classNames` | `StepProgressClassnames` | – | Per-part class names (see below), Tailwind-friendly. |
| `store` | `StepProgressStore` | – | External store; when set, `value`/`statuses` come from it instead of props. |
| `unstyled` | `boolean` | `false` | Strips borders/background/shadow/gradient, keeps layout geometry. |
| `dir` | `"ltr" \| "rtl" \| "auto"` | `"ltr"` | Text/layout direction; flips fill side and rounding. |
| `onStepClick` | `(stepIndex: number, stepLabel: string) => void` | – | Makes nodes interactive (`role="button"`, keyboard support) when provided. |
| `aria-label` | `string` | `"Progress"` | ARIA label for the progressbar. |
| `aria-valuetext` | `string \| ((props: { current, total, label }) => string)` | `"Step {current} of {total}: {label}"` | ARIA value text. |

**`StepProgressClassnames` keys:** `root`, `trackWrap`, `track`, `fill`, `shimmer`, `nodes`, `node`, `nodeMarker`, `label`, `badge`, `underline`, `icon`, `num`.

**Default gradient colors** (`DEFAULT_GRADIENT_COLORS`): `#000A20 → #001535 → #002860 → #006CF6 → #73B3FF → #D3EAFF → #E8F7FF`.

**`ShimmerBand`:**

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `leading` | `number` | `1.6` | Soft ramp into the highlight (weight, not required to sum to 1). |
| `highlight` | `number` | `0.2` | Bright core width. |
| `trailing` | `number` | `1.6` | Soft ramp out of the highlight. |
| `intensity` | `number` | `0.9` | Peak highlight opacity, 0–1. |

## `useStepProgress(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `string[]` | — | Required. |
| `initialStep` | `number` | `0` | Starting step index. |
| `initialStatuses` | `StepStatus[]` | – | Starting per-step statuses. |
| `store` | `StepProgressStore` | – | Use an external store instead of lazily creating one. |

**Returns:**

| Field | Type | Description |
| --- | --- | --- |
| `step` | `number` | Current step index. |
| `statuses` | `StepStatus[] \| undefined` | Current per-step statuses. |
| `setStep` | `(step: number) => void` | Same as the store's `setValue`. |
| `setStatus` | `(stepIndex: number, status: StepStatus) => void` | Set one step's status. |
| `next` / `prev` / `goTo(i)` / `complete()` / `reset()` | `() => void` (goTo takes an index) | Navigation helpers. |
| `isFirst` / `isLast` | `boolean` | Derived from `step` vs. `steps.length`. |
| `isOngoing` / `isCompleted` | `boolean` | Derived from statuses (or `value` if no statuses). |
| `promise(promise, options?)` | `<T>(Promise<T> \| (() => Promise<T>), StepProgressPromiseOptions<T>) => Promise<T>` | Drives the current step through `ongoing → complete` (see below). |
| `props` | `{ steps, value, statuses }` | Spread onto `<StepProgress {...props} />`. |

## Store API (`StepProgressStore`)

Returned by `createStepProgress()`, matched by the `stepProgress` singleton, and accepted by both `useStepProgress({ store })` and `<StepProgress store={...} />`.

| Method | Signature | Description |
| --- | --- | --- |
| `getState()` | `() => StepProgressState` | `{ value, statuses, isOngoing, isCompleted }`. |
| `subscribe(fn)` | `(subscriber) => unsubscribe` | Fires immediately with current state, then on every change. |
| `setValue(v)` | `(number) => void` | Clamped to `≥ 0`. |
| `setStatus(i, status)` | `(number, StepStatus) => void` | Sets one step; fills in the rest from `value` if `statuses` wasn't set yet. |
| `setStatuses(arr)` | `(StepStatus[]) => void` | Replaces the whole statuses array. |
| `next()` / `prev()` | `() => void` | `prev` clamps at `0`. |
| `goTo(i)` | `(number) => void` | Same as `setValue`. |
| `complete()` | `() => void` | Marks every step `"complete"`, jumps `value` to the last index. |
| `reset()` | `() => void` | Back to `value: 0`, statuses cleared. |
| `promise(p, opts?)` | see below | Ties the *current* step to a promise's lifecycle. |

**`createStepProgress(config?)`** — `{ id?, steps?, initialStep?, initialStatuses? }` → new `StepProgressStore` (a `StepProgressObserver` instance). Passing `id` also registers it for lookup.

**`getStepProgressStore(id)`** — returns the store registered under `id`, or `undefined`.

**`stepProgress`** — a ready-made global singleton store (same shape as above, plus `create` = `createStepProgress` and `get` = `getStepProgressStore`), for a Sonner-`toast`-style call-from-anywhere pattern.

### `promise(promise, options?)`

```ts
interface StepProgressPromiseOptions<T> {
  loading?: string;
  success?: string | ((data: T) => string | void);
  error?: string | ((err: any) => string | void);
  advanceOnSuccess?: boolean; // default true
}
```

Sets the *current* step to `"ongoing"`, awaits the promise (or promise-returning function), sets it to `"complete"` on resolve, and calls `next()` unless `advanceOnSuccess: false` or it's already the last step. On rejection, it notifies subscribers and re-throws — the step is left `"ongoing"`, so catch the rejection yourself and call `setStatus` if you want a distinct failure state.

`loading` / `success` / `error` are declared on the options type but are **not read** by the current implementation — they don't render any message. Only `advanceOnSuccess` has an effect.

## Utilities

| Export | Signature | Description |
| --- | --- | --- |
| `getStepProgress(count)` | `(number) => number[]` | The default front-loaded fill curve for `count` steps. |
| `buildLinearGradient(colors?, angle?)` | `(string[], number) => string` | Builds the CSS `linear-gradient(...)` used for the fill. |
| `buildShimmerGradient(angle?, band?)` | `(number, Required<ShimmerBand>) => string` | Builds the shimmer sweep gradient. |
| `resolveShimmerBand(value, band?, bands?)` | `(number, ShimmerBand?, ShimmerBand[]?) => Required<ShimmerBand>` | Resolves the effective band for a given step, filling in defaults. |
| `CheckIcon`, `SpinnerIcon` | `React.FC<{ className?: string }>` | The default complete/ongoing icons, exported for reuse. |
| `getAsset(status, icons?, meta?)` | `(StepStatus, StepProgressIcons?, { index, label }?) => ReactNode` | Resolves which icon to render for a status, honoring custom `icons`. |

## Constants

`DEFAULT_GRADIENT_COLORS`, `DEFAULT_GRADIENT_ANGLE` (`90`), `DEFAULT_SHIMMER_ANGLE` (`75`), `DEFAULT_SHIMMER_DURATION` (`1.7`), `DEFAULT_SHIMMER_BAND` (`{ leading: 1.6, highlight: 0.2, trailing: 1.6, intensity: 0.9 }`).

## CSS variables

Set on the `.step-progress` root (or an ancestor); `size` presets some of these automatically.

| Variable | Default (`md`) | `sm` | `lg` |
| --- | --- | --- | --- |
| `--step-progress-track-h` | `58px` | `44px` | `72px` |
| `--step-progress-node-size` | `36px` | `28px` | `44px` |
| `--step-progress-node-bg-reached` | `#001535` | | |
| `--step-progress-node-border-reached` | `rgba(255,255,255,0.18)` | | |
| `--step-progress-node-bg-active` | `#ffffff` | | |
| `--step-progress-node-border-active` | `#ffffff` | | |
| `--step-progress-node-bg-upcoming` | `#ffffff` | | |
| `--step-progress-node-border-upcoming` | `#dadada` | | |
| `--step-progress-transition` | `650ms cubic-bezier(0.16, 1, 0.3, 1)` | | |
| `--step-progress-node-transition` | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | | |

Dark mode is opt-in via a `data-theme="dark"` attribute on `.step-progress` or an ancestor (no `theme` prop, no automatic OS detection); it currently only affects label and border color, not the gradient palette. `prefers-reduced-motion: reduce` disables the shimmer/spinner animations and transitions automatically.

## Types

```ts
type StepProgressSize = "sm" | "md" | "lg";
type StepStatus = "complete" | "ongoing" | "upcoming";

interface ShimmerBand {
  leading?: number;
  highlight?: number;
  trailing?: number;
  intensity?: number;
}

type IconRenderer =
  | React.ReactNode
  | ((props: { index: number; label: string }) => React.ReactNode);

interface StepProgressIcons {
  complete?: IconRenderer;
  ongoing?: IconRenderer;
}

interface StepProgressState {
  value: number;
  statuses?: StepStatus[];
  isOngoing: boolean;
  isCompleted: boolean;
}
```
