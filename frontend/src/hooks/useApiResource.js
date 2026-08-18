import { useCallback, useEffect, useState } from 'react';

/**
 * Loads one API resource and exposes the three states every screen needs:
 * loading, error and data - plus a `retry` so error states can offer a way out.
 *
 * `fetcher` is called with no arguments. `deps` identifies the request, exactly
 * like a useEffect dependency list, so a new id triggers a refetch.
 *
 * In-flight results are discarded if the inputs change or the component
 * unmounts, which prevents a slow earlier request overwriting a newer one.
 */
export function useApiResource(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Starts true when the request will fire, so the very first render is a
  // loading state rather than a moment of "no data" that callers could
  // mistake for an empty or ready result.
  const [isLoading, setIsLoading] = useState(enabled);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally excluded: callers pass an inline closure, and
    // `deps` is the meaningful identity of the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, attempt]);

  return { data, error, isLoading, retry };
}
