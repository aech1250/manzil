
https://github.com/user-attachments/assets/0dd5617f-3261-4a7c-b8c0-be2b140b6382

[Manzil](https://github.com/aech1250/manzil) is a progress bar with steps for React.

## Usage

To start using the library, install it in your project:

```bash
npm install manzil
```

Alternatively you can use the `/ask-manzil` skill to do it for you and help you with any other Manzil-related questions.

```bash
npx skills add https://github.com/aech1250/manzil --skill ask-manzil
```

Add `<StepProgress />` to your app, it will be the place where your step progress will be rendered.
After that you can use `useStepProgress` to easily manage and navigate between steps.

```jsx
import { StepProgress, useStepProgress } from "manzil";

const steps = ["Cart", "Shipping", "Payment", "Confirm"];

function App() {
  const { props, next, prev, isFirst, isLast } = useStepProgress({ steps });

  return (
    <div>
      <StepProgress {...props} />
      <button onClick={prev} disabled={isFirst}>
        Back
      </button>
      <button onClick={next} disabled={isLast}>
        Next
      </button>
    </div>
  );
}
```

You can also use it as a simple controlled component:

```jsx
import { StepProgress } from "manzil";

function App() {
  return <StepProgress steps={["Cart", "Shipping", "Payment"]} value={1} />;
}
```

## Documentation

Find the full API reference in the [documentation](https://github.com/aech1250/manzil).
