import { useState, useCallback } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export function useAPI<T>(initialData: T | null = null) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const fetch = useCallback(
    async (
      url: string,
      options?: {
        method?: string;
        body?: any;
      },
    ) => {
      setState({ data: state.data, loading: true, error: null });

      try {
        const response = await window.fetch(url, {
          method: options?.method || "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const result: APIResponse<T> = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || "API request failed");
        }

        setState({ data: result.data || null, loading: false, error: null });
        return result.data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        setState({ data: state.data, loading: false, error: err });
        throw err;
      }
    },
    [state.data],
  );

  return { ...state, fetch };
}
