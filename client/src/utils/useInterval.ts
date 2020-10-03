// source: https://github.com/use-hooks/react-hooks-interval
import { useRef, useEffect } from "preact/hooks";

// Ref: https://overreacted.io/making-setinterval-declarative-with-react-hooks/

/**
 * Params
 * @param {function} callback - Custom logic function
 * @param {number|null} delay - Delayed millisecond, stop if null
 */

type f = () => void;

export default (callback: f, delay: number): void => {
  const savedCallback = useRef<f>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    tick();
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }

    return undefined;
  }, [delay]);
};
