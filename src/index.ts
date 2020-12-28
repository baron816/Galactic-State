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

  update(newVal: T): void {
    this.value = newVal;

    for (const sub of this.subscribers) {
      sub(this.value);
    }
  }
}

type NotFunction<T> = T extends Function ? never : T;

/**
 * Returns a hook similar to useState, but will share state across components
 * regardless of Context
 * 
 * @param initialValue the default initial value the hook will receive
 * @param {function} [debugSubscriber] a callback function that will receive all updates.
 * Use only for debugging.
*/
export function createGalactic<S, T extends NotFunction<S>>(
  initialValue: T,
  debugSubscriber?: (hookState: T) => void
) {
  if (typeof initialValue === "function" && process.env.NODE_ENV !== "production") {
      throw Error("initial value must not be a function");
  }

  const observer = new Observer(initialValue);

  if (
    typeof debugSubscriber === "function" &&
    process.env.NODE_ENV !== "production"
  ) {
    observer.subscribe(debugSubscriber);
  }

  return function useGalacticState(): [T, (val: T | ((oldVal: T) => T)) => void] {
    const [state, setState] = React.useState<T>(observer.value);

    React.useEffect(() => {
      return observer.subscribe(setState);
    }, []);

    const setSubject = React.useCallback((val: T | ((oldVal: T) => T)) => {
      if (isFunction(val)) {
        const newVal = val(observer.value);
        observer.update(newVal);
      } else {
        observer.update(val as Exclude<T, Function>);
      }
    }, []);

    return [state, setSubject];
  };
}

function isFunction(val: any): val is Function {
    return typeof val === 'function';
}