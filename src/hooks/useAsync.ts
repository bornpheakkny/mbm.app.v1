import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/api/client';

interface State<T> {
  data: T | null;
  error: string | null;
  /** which request (deps key + reload tick) the state belongs to */
  key: string | null;
}

/**
 * Runs `loader` whenever `deps` change and exposes { data, loading, error, reload }.
 * Previous data stays visible while the next request loads; stale responses are ignored.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const depsKey = JSON.stringify(deps);
  const [state, setState] = useState<State<T>>({ data: null, error: null, key: null });

  useEffect(() => {
    let cancelled = false;
    loaderRef.current().then(
      (data) => !cancelled && setState({ data, error: null, key: depsKey }),
      (err) => !cancelled && setState((s) => ({ ...s, error: errorMessage(err), key: depsKey })),
    );
    return () => {
      cancelled = true;
    };
  }, [depsKey]);

  /** Re-fetch now; resolves once the new data is in state. */
  const reload = useCallback(async () => {
    try {
      const data = await loaderRef.current();
      setState({ data, error: null, key: depsKey });
    } catch (err) {
      setState((s) => ({ ...s, error: errorMessage(err) }));
    }
  }, [depsKey]);

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== depsKey,
    reload,
  };
}
