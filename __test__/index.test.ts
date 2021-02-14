import { renderHook, act } from "@testing-library/react-hooks";
import { createGalactic } from "../src";

describe("GalacticState", () => {
  describe("without observer", () => {
    test("value update across components", () => {
      const useCounter = createGalactic(0);

      const { result: result1, rerender: rerender1 } = renderHook(() =>
        useCounter()
      );
      const { result: result2, rerender: rerender2 } = renderHook(() =>
        useCounter()
      );

      act(() => {
        result1.current[1](1);
      });

      rerender1();
      rerender2();

      expect(result1.current[0]).toBe(1);
      expect(result2.current[0]).toBe(1);
    });

    test("update value with callback", () => {
      const useCounter = createGalactic(0);
      const { result: result1, rerender: rerender1 } = renderHook(() =>
        useCounter()
      );
      const { result: result2, rerender: rerender2 } = renderHook(() =>
        useCounter()
      );

      act(() => {
        result1.current[1]((current) => current + 1);
      });

      rerender1();
      rerender2();

      expect(result1.current[0]).toBe(1);
      expect(result2.current[0]).toBe(1);
    });
  });

  describe("with observer", () => {
    test("observer receives state updates", () => {
      const [useCounter, counterObserver] = createGalactic(0, true);

      const { result: result1, rerender: rerender1 } = renderHook(() =>
        useCounter()
      );
      const { result: result2, rerender: rerender2 } = renderHook(() =>
        useCounter()
      );

      const counterSub = jest.fn();

      counterObserver.subscribe(counterSub);

      act(() => {
        result1.current[1](1);
      });

      rerender1();
      rerender2();

      expect(result1.current[0]).toBe(1);
      expect(result2.current[0]).toBe(1);
      expect(counterSub).toHaveBeenCalledWith(1);

      act(() => {
        result2.current[1](55);
      });

      rerender1();

      expect(result1.current[0]).toBe(55);
      expect(counterSub).toHaveBeenCalledWith(55);
    });

    test("observer updates component states", () => {
      const [useCounter, counterObserver] = createGalactic(0, true);

      const { result: result1, rerender: rerender1 } = renderHook(() =>
        useCounter()
      );
      const { result: result2, rerender: rerender2 } = renderHook(() =>
        useCounter()
      );

      act(() => {
        counterObserver.update(55);
      });

      rerender1();
      rerender2();

      expect(result1.current[0]).toBe(55);
      expect(result2.current[0]).toBe(55);
    });

    test("observer updates component states using callback", () => {
      const [useCounter, counterObserver] = createGalactic(0, true);

      const { result: result1, rerender: rerender1 } = renderHook(() =>
        useCounter()
      );
      const { result: result2, rerender: rerender2 } = renderHook(() =>
        useCounter()
      );

      act(() => {
        counterObserver.update((currentVal) => currentVal + 55);
      });

      rerender1();
      rerender2();

      expect(result1.current[0]).toBe(55);
      expect(result2.current[0]).toBe(55);
    });
  });
});
