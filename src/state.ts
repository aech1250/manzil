import type {
  StepProgressPromiseOptions,
  StepProgressState,
  StepProgressStore,
  StepProgressSubscriber,
  StepStatus,
} from "./types";

export interface CreateStepProgressConfig {
  id?: string;
  steps?: string[];
  initialStep?: number;
  initialStatuses?: StepStatus[];
}

export class StepProgressObserver implements StepProgressStore {
  private state: StepProgressState;
  private subscribers = new Set<StepProgressSubscriber>();
  private stepsCount: number;

  constructor(config: CreateStepProgressConfig = {}) {
    this.stepsCount = config.steps?.length ?? 4;
    const initialVal = Math.max(0, config.initialStep ?? 0);
    const hasOngoing = config.initialStatuses
      ? config.initialStatuses.some((s) => s === "ongoing")
      : false;
    const isCompleted = config.initialStatuses
      ? !hasOngoing && config.initialStatuses[this.stepsCount - 1] === "complete"
      : initialVal >= this.stepsCount - 1;

    this.state = {
      value: initialVal,
      statuses: config.initialStatuses,
      isOngoing: hasOngoing,
      isCompleted,
    };
  }

  getState = (): StepProgressState => {
    return this.state;
  };

  subscribe = (subscriber: StepProgressSubscriber): (() => void) => {
    this.subscribers.add(subscriber);
    subscriber(this.state);
    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  private notify = () => {
    for (const sub of this.subscribers) {
      sub(this.state);
    }
  };

  private recomputeFlags = (value: number, statuses?: StepStatus[]) => {
    const hasOngoing = statuses
      ? statuses.some((s) => s === "ongoing")
      : false;
    const isCompleted = statuses
      ? !hasOngoing && statuses[this.stepsCount - 1] === "complete"
      : value >= this.stepsCount - 1;

    return { isOngoing: hasOngoing, isCompleted };
  };

  setValue = (value: number) => {
    const clamped = Math.max(0, value);
    const { isOngoing, isCompleted } = this.recomputeFlags(
      clamped,
      this.state.statuses,
    );

    this.state = {
      ...this.state,
      value: clamped,
      isOngoing,
      isCompleted,
    };
    this.notify();
  };

  setStatus = (stepIndex: number, status: StepStatus) => {
    const currentStatuses = this.state.statuses
      ? [...this.state.statuses]
      : Array.from({ length: this.stepsCount }, (_, i) =>
          i < this.state.value
            ? ("complete" as StepStatus)
            : i === this.state.value
              ? ("ongoing" as StepStatus)
              : ("upcoming" as StepStatus),
        );

    currentStatuses[stepIndex] = status;
    const { isOngoing, isCompleted } = this.recomputeFlags(
      this.state.value,
      currentStatuses,
    );

    this.state = {
      ...this.state,
      statuses: currentStatuses,
      isOngoing,
      isCompleted,
    };
    this.notify();
  };

  setStatuses = (statuses: StepStatus[]) => {
    const { isOngoing, isCompleted } = this.recomputeFlags(
      this.state.value,
      statuses,
    );

    this.state = {
      ...this.state,
      statuses: [...statuses],
      isOngoing,
      isCompleted,
    };
    this.notify();
  };

  next = () => {
    this.setValue(this.state.value + 1);
  };

  prev = () => {
    this.setValue(Math.max(0, this.state.value - 1));
  };

  goTo = (stepIndex: number) => {
    this.setValue(stepIndex);
  };

  complete = () => {
    const allCompleted: StepStatus[] = Array(this.stepsCount).fill("complete");
    this.state = {
      value: this.stepsCount - 1,
      statuses: allCompleted,
      isOngoing: false,
      isCompleted: true,
    };
    this.notify();
  };

  reset = () => {
    this.state = {
      value: 0,
      statuses: undefined,
      isOngoing: false,
      isCompleted: false,
    };
    this.notify();
  };

  promise = async <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: StepProgressPromiseOptions<T> = {},
  ): Promise<T> => {
    const activeStep = this.state.value;
    this.setStatus(activeStep, "ongoing");

    try {
      const p = typeof promise === "function" ? promise() : promise;
      const data = await p;

      this.setStatus(activeStep, "complete");

      if (options.advanceOnSuccess !== false && activeStep < this.stepsCount - 1) {
        this.next();
      }

      return data;
    } catch (err) {
      this.notify();
      throw err;
    }
  };
}

const instances = new Map<string, StepProgressStore>();

export function createStepProgress(
  config: CreateStepProgressConfig = {},
): StepProgressStore {
  const store = new StepProgressObserver(config);
  if (config.id) {
    instances.set(config.id, store);
  }
  return store;
}

export function getStepProgressStore(id: string): StepProgressStore | undefined {
  return instances.get(id);
}

/** Global default stepProgress singleton (matching Sonner's `toast` pattern) */
const defaultStore = new StepProgressObserver();

export const stepProgress = {
  getState: defaultStore.getState,
  subscribe: defaultStore.subscribe,
  setValue: defaultStore.setValue,
  setStatus: defaultStore.setStatus,
  setStatuses: defaultStore.setStatuses,
  next: defaultStore.next,
  prev: defaultStore.prev,
  goTo: defaultStore.goTo,
  complete: defaultStore.complete,
  reset: defaultStore.reset,
  promise: defaultStore.promise,
  create: createStepProgress,
  get: getStepProgressStore,
};
