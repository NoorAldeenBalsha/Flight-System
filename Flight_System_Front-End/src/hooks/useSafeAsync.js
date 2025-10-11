import { useEffect, useRef } from "react";

export default function useSafeAsync() {
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const run = (fn) => (...args) => {
    const maybePromise = fn(...args);
    if (maybePromise?.then) {
      return maybePromise.then(
        (v) => (mounted.current ? v : undefined),
        (e) => { if (mounted.current) throw e; }
      );
    }
    return maybePromise;
  };
  return { mounted, run };
}