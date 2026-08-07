import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 3000, // 3-second background polling fallback
      refetchOnWindowFocus: true,
      staleTime: 1000,
    },
  },
});
