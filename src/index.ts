import * as React from "react";

type Subscriber<T> = (val: T) => void;

class Observer<T> {
  subscribers: Set<Subscriber<T>>;
  value: T;

  constructor(val: T) {
    this.value = val;
    this.subscribers = new Set<Subscriber<T>>();
  }

  unsubscribe(fn: Subscriber<T>): () => void {
    return () => {
      this.subscribers.delete(fn);
    };
  }

  subscribe(fn: Subscriber<T>): () => void {
    this.subscribers.add(fn);
    return this.unsubscribe(fn);
  }

  update(value: T | ((oldValue: T) => T)): void {
    if (isFunction(value)) {
      const newVal = value(this.value);
      this.value = newVal;
    } else {
      this.value = value;
    }

    for (const sub of this.subscribers) {
      sub(this.value);
    }
  }
}

function isFunction(val: any): val is Function {
  return typeof val === "function";
}

type Setter<T> = (newValue: T | ((oldVal: T) => T)) => void;

/**
 * Returns a tuple of [0] a hook that works like useState, but for state across
 * components, [1] a setter that sets state, regardless on context, and [2] an
 * observer that accepts subscriptions to state updates.
 *
 * @param initialValue the default initial value the hook will receive
 */
export function createGalactic<T>(
  initialValue: T
): [() => [T, Setter<T>], Setter<T>, Observer<T>] {
  const observer = new Observer(initialValue);

  function useGalacticState(): [T, Setter<T>] {
    const [state, setState] = React.useState<T>(observer.value);

    React.useEffect(() => {
      return observer.subscribe(setState);
    }, []);

    return React.useMemo(() => [state, setGalacticState], [state]);
  }

  function setGalacticState(newVal: T | ((oldVal: T) => T)) {
    observer.update(newVal);
  }

  return [useGalacticState, setGalacticState, observer];
}
