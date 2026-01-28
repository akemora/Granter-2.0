import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for debouncing a callback function
 * @param callback Function to debounce
 * @param delay Debounce delay in milliseconds
 * @param dependencies Dependency array for the callback
 */
export function useDebounce(
  callback: () => void,
  delay: number,
  dependencies: unknown[] = [],
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    debouncedCallback();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return debouncedCallback;
}
