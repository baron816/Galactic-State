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

type HookPair<T> = [T, (val: T | ((oldVal: T) => T)) => void];

/**
 * Returns a hook similar to useState, but will share state across components
 * regardless of Context
 *
 * @param initialValue the default initial value the hook will receive
 * @param {function} [inclubserver] if true, function will return
 * a tuple which will include the hook in the first position and
 * the observer in the second. The observer can dispatch state
 * updates and can allow subscriptions to state updates.
 */
export function createGalactic<T, R extends boolean = false>(
  initialValue: T,
  includeObserver?: R
): R extends true ? [() => HookPair<T>, Observer<T>] : () => HookPair<T> {
  const observer = new Observer(initialValue);

  function useGalacticState() {
    const [state, setState] = React.useState<T>(observer.value);

    React.useEffect(() => {
      return observer.subscribe(setState);
    }, []);

    const setSubject = React.useCallback((val: T | ((oldVal: T) => T)) => {
      observer.update(val);
    }, []);

    return [state, setSubject];
  }

  // @ts-ignore
  return includeObserver ? [useGalacticState, observer] : useGalacticState;
}

function isFunction(val: any): val is Function {
  return typeof val === "function";
}
