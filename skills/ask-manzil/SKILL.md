---
name: ask-manzil
description: Guide to Manzil, the React step-progress bar with node markers — install, render a controlled or store-backed bar, drive it with useStepProgress, granular per-step statuses, gradient/shimmer styling, dark mode, RTL, and accessibility. Use when working with Manzil or troubleshooting it — the bar not advancing, shimmer that never stops, dark mode not applying, uneven step spacing, or nodes that don't respond to clicks.
---

# Working With Manzil

A guide skill for [Manzil](https://github.com/aech1250/manzil), the step-progress bar for React. When a task involves Manzil — wiring it up, driving its state, styling it, or fixing it — answer from this file first. Full prop and type tables live in [API.md](API.md); read it when you need an exact prop name, type, or default.

## Setup

```bash
npm install manzil
```

Two pieces:

1. **`<StepProgress />`** — the visual bar. Give it `steps` (labels) and either a `value` (controlled) or a `store` (store-backed).
2. **State to drive it** — pick one of `useStepProgress`, a manual `createStepProgress` store, or the global `stepProgress` singleton (see "Picking the right approach" below).

```jsx
import { StepProgress, useStepProgress } from 'manzil';
```

Styles are bundled and inject automatically — no separate CSS import needed in a normal setup. If styles go missing (Astro-style environments, view-transition-heavy setups, shadow DOM), import them explicitly:

```js
import 'manzil/styles.css';
```

## Picking the right approach

| You want | Use |
| --- | --- |
| A bar with no navigation logic, driven by props you already track | `<StepProgress steps={[...]} value={i} />` — plain controlled component |
| Next/back navigation inside one component | `useStepProgress({ steps })` — returns `next`, `prev`, `goTo`, `props` to spread onto `<StepProgress {...props} />` |
| One progress bar shared across the whole app, no provider (same pattern as Sonner's `toast`) | The global `stepProgress` singleton — call `stepProgress.next()`, `stepProgress.setValue()`, etc. from anywhere |
| Several independent, named bars (e.g. one per modal/wizard) | `createStepProgress({ id, steps })` to make a store, `getStepProgressStore(id)` to fetch it elsewhere, pass it to `<StepProgress store={...} />` |
| Per-step icons that aren't just "done/in progress" (complete, ongoing, upcoming individually) | The `statuses` prop (or a store's `setStatus`/`setStatuses`) — overrides the value-derived state per step |
| Tie a step to an async operation | A store's `promise()` method — see Recipes |

When a `store` is passed to `<StepProgress />`, it subscribes to that store's state and `value`/`statuses` props are ignored — the store is the source of truth.

## Recipes

**Simple controlled bar:**

```jsx
<StepProgress steps={['Cart', 'Shipping', 'Payment']} value={1} />
```

**Hook-driven wizard:**

```jsx
const { props, next, prev, isFirst, isLast } = useStepProgress({ steps });

<StepProgress {...props} />
<button onClick={prev} disabled={isFirst}>Back</button>
<button onClick={next} disabled={isLast}>Next</button>
```

**Global singleton, called from anywhere (no props drilling):**

```jsx
import { stepProgress, StepProgress } from 'manzil';

// anywhere client-side
stepProgress.next();
stepProgress.setStatus(0, 'complete');

// once, wherever the bar renders
<StepProgress store={stepProgress} steps={steps} />
```

**Named store fetched elsewhere:**

```jsx
const checkoutStore = createStepProgress({ id: 'checkout', steps });
// later, in an unrelated file:
const store = getStepProgressStore('checkout');
store?.next();
```

**Tie a step to an async call:**

```jsx
const { promise, props } = useStepProgress({ steps });

async function submit() {
  await promise(() => saveOrder(data), { advanceOnSuccess: true });
}
```

The step goes `ongoing` while the promise is pending, `complete` on resolve, and auto-advances to the next step unless `advanceOnSuccess: false`. **Note:** the `loading` / `success` / `error` fields on `StepProgressPromiseOptions` are typed but not read by `promise()` in the current release — it only manages status transitions, it doesn't render any message. Pair it with your own toast/label if you need user-facing text for each phase.

**Explicit per-step statuses** (bypasses the value-derived complete/ongoing/upcoming order):

```jsx
<StepProgress steps={steps} value={1} statuses={['complete', 'ongoing', 'upcoming', 'upcoming']} />
```

Shimmer keeps animating as long as any step is `ongoing`, even on the last step.

**Custom step icons:**

```jsx
<StepProgress
  steps={steps}
  value={1}
  icons={{
    complete: <MyCheckIcon />,
    ongoing: ({ index, label }) => <Spinner aria-label={label} />,
  }}
/>
```

**Clickable steps:**

```jsx
<StepProgress steps={steps} value={step} onStepClick={(i, label) => setStep(i)} />
```

Passing `onStepClick` is what turns nodes into accessible, keyboard-operable buttons (`role="button"`, `tabIndex`, Enter/Space handling) — omit it and nodes stay static.

## Styling — the escalation ladder

Climb only as far as the change requires.

1. **CSS variables** — override on the wrapper or an ancestor: `--step-progress-track-h`, `--step-progress-node-size`, `--step-progress-node-bg-reached`, `--step-progress-node-border-reached`, `--step-progress-node-bg-active`, `--step-progress-node-border-active`, `--step-progress-node-bg-upcoming`, `--step-progress-node-border-upcoming`. Covers most rebranding without touching classes.
2. **`size` prop** — `"sm" | "md" | "lg"` swaps track height and node size via the variables above; use this before hand-rolling dimensions.
3. **Gradient/shimmer props** — `gradientColors` + `gradientAngle` for the fill; `shimmerBand` / `shimmerBands` (per-segment) + `shimmerAngle` + `shimmerDuration` for the sweep. `gradientColors` are evenly spaced unless you pass explicit stops (`"#006CF6 52%"`).
4. **`classNames`** — per-part class names (`root`, `track`, `fill`, `shimmer`, `node`, `nodeMarker`, `label`, `badge`, `icon`, `num`, …), Tailwind-friendly. Manzil's own styles still apply underneath, so classes here layer on top rather than replace.
5. **`unstyled`** — strips borders/background/shadow/gradient while keeping layout geometry (widths, flex structure, sizing). Pair with `classNames` or your own CSS for a fully custom look; you still get correct positioning and ARIA behavior for free.

## Troubleshooting

| Symptom | Cause → fix |
| --- | --- |
| Bar doesn't move when I call `next()`/`setValue()` | You're calling a *different* store than the one passed to `<StepProgress store={...} />` — `useStepProgress()` lazily creates its own store when you don't pass one, and the global `stepProgress` singleton is a separate instance again. Make sure the store reference is shared. |
| Shimmer never stops | `showShimmer` is suppressed only when the bar is complete *and* no step is `ongoing`. If any entry in `statuses` is `"ongoing"` (including the last step), shimmer keeps animating by design — set it to `"complete"` to stop it. |
| Steps don't look evenly spaced | Intentional: the default `progressStops` come from a front-loaded curve (e.g. 4 steps → 22/45/72/100) so early steps already read as progress. Pass your own `progressStops` (e.g. `[25, 50, 75, 100]`) for even spacing. |
| Dark mode doesn't apply | There's no `theme` prop — dark styling is driven purely by a `data-theme="dark"` attribute on the component or an ancestor element. Set that attribute (wire it to your theme state yourself); it isn't automatic and doesn't track `prefers-color-scheme`. |
| RTL layout looks wrong | Pass `dir="rtl"` on `<StepProgress />` itself, not just a CSS `direction` on a parent — the fill's rounding and origin side are driven by the component's own `dir` prop/attribute. |
| Nodes don't respond to clicks/keyboard | `onStepClick` wasn't passed — without it, nodes render as static (no `role`, no `tabIndex`, no key handling) by design, so partial styling won't make them interactive. |
| Custom `icons` show for every step, not just the one I meant | `icons.complete`/`icons.ongoing` apply to *every* step in that status, not a single index. For per-step control, pass a function (`(props) => node`) and branch on `index`/`label` inside it, or use `statuses` to keep a step out of that status entirely. |
| `promise()` isn't showing a loading/success message | Expected — see the async recipe above. It only drives `status`/`value`, it doesn't render text. Show your own message (e.g. via a toast) alongside it. |
| Styles missing entirely, or duplicated after a hot reload | Same class of issue as Sonner's Astro/shadow-DOM cases: the injected `<style>` tag was lost or duplicated. Import `manzil/styles.css` explicitly in your root layout as a fallback. |
| `size`/gradient/shimmer props have no visible effect | Check `unstyled` isn't set — it intentionally drops the gradient and default node backgrounds, and `classNames`/CSS variables are then the only thing driving the look. |
