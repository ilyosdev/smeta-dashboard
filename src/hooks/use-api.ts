
import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  enabled?: boolean;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const { enabled = true } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });

  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err as Error });
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      refetch();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [...deps, enabled]);

  return { ...state, refetch };
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const result = await mutationFn(variables);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        setState({ data: null, loading: false, error: err as Error });
        throw err;
      }
    },
    [mutationFn]
  );

  return { ...state, mutate };
}
