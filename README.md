# step-progress

A pill-shaped progress bar with step markers for React. The track fills with a soft navy-to-ice-blue gradient as you advance, with a shimmer that runs only while there's progress left — it disappears on the final step.

Includes zero-dependency state management, interactive hooks, Tailwind slot styling, and accessible keyboard navigation.

## Install

```bash
npm i @aech1250/step-progress
```

## Basic Usage

```tsx
import { StepProgress } from "@aech1250/step-progress";
import "@aech1250/step-progress/styles.css";

const steps = ["Create Project", "Add Media", "Set Goals", "Team", "Launch"];

function Wizard() {
  return <StepProgress steps={steps} value={1} />;
}
```

---

## Turnkey State Hook (`useStepProgress`)

Easily control steps without boilerplate state management:

```tsx
import { StepProgress, useStepProgress } from "@aech1250/step-progress";

const steps = ["Cart", "Shipping", "Payment", "Confirm"];

function Checkout() {
  const { props, next, prev, isFirst, isLast } = useStepProgress({ steps });

  return (
    <div>
      <StepProgress {...props} />
      <div className="flex gap-2 mt-4">
        <button onClick={prev} disabled={isFirst}>Back</button>
        <button onClick={next} disabled={isLast}>Next</button>
      </div>
    </div>
  );
}
```

---

## Async Operations (`stepProgress.promise`)

Automatically show loading spinner and shimmer while an async action is running:

```tsx
import { stepProgress } from "@aech1250/step-progress";

async function handlePayment() {
  await stepProgress.promise(submitPayment(), {
    loading: "Processing payment...", // sets current step to 'ongoing' with spinner & shimmer
    advanceOnSuccess: true           // advances to next step on resolve
  });
}
```

---

## Custom Icons & Tailwind Slots

Use custom icons (e.g. from Lucide or Heroicons) and granular Tailwind classes:

```tsx
import { StepProgress } from "@aech1250/step-progress";
import { Check, Loader2 } from "lucide-react";

<StepProgress
  steps={steps}
  value={1}
  icons={{
    complete: <Check className="w-4 h-4 text-emerald-500" />,
    ongoing: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
  }}
  classNames={{
    track: "bg-slate-100 dark:bg-slate-800",
    fill: "bg-gradient-to-r from-blue-500 to-indigo-600",
    label: "text-xs font-semibold text-slate-700 dark:text-slate-300"
  }}
/>
```

---

## Interactive Steps

Allow users to jump between steps:

```tsx
<StepProgress
  steps={steps}
  value={step}
  onStepClick={(index) => setStep(index)}
/>
```

---

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `string[]` | *required* | Array of step labels. |
| `value` | `number` | `0` | Current active step index (0-based). |
| `statuses` | `StepStatus[]` | from `value` | Per-step status: `"complete"`, `"ongoing"`, `"upcoming"`. |
| `icons` | `StepProgressIcons` | — | Custom complete and ongoing icon slots. |
| `classNames` | `StepProgressClassnames` | — | Granular Tailwind/CSS classes for every sub-element. |
| `onStepClick` | `(index, label) => void` | — | When provided, steps become interactive with keyboard support. |
| `store` | `StepProgressStore` | — | Bind to an external `stepProgress` or `createStepProgress()` store. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual sizing. |
| `showLabels` | `boolean` | `true` | Show step labels under nodes. |
| `showShimmer` | `boolean` | `true` | Show animated shimmer while in progress. |
| `gradientColors` | `string[]` | navy→ice | Fill gradient colors (start → end). |
| `gradientAngle` | `number` | `90` | Fill gradient angle in degrees. |
| `shimmerAngle` | `number` | `75` | Shimmer sweep angle in degrees. |
| `shimmerDuration` | `number` | `1.7` | Shimmer duration in seconds. |
| `shimmerBand` | `ShimmerBand` | balanced | Shimmer leading/highlight/trailing weights. |
| `shimmerBands` | `ShimmerBand[]` | — | Per-segment shimmer bands. |
| `progressStops` | `number[]` | curve | Custom fill percentage per step index. |
| `unstyled` | `boolean` | `false` | Strips default colors/shadows for headless styling. |
| `dir` | `"ltr" \| "rtl" \| "auto"` | `"ltr"` | Layout direction (supports RTL languages). |
| `disabled` | `boolean` | `false` | Dimmed non-interactive visual state. |
| `aria-label` | `string` | `"Progress"` | Accessible label. |
| `aria-valuetext` | `string \| function` | dynamic | Accessible text (e.g. `"Step 2 of 4: Shipping"`). |

## License

MIT
