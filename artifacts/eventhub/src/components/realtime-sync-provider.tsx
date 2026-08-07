import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const CHANNEL_NAME = "eventhub_realtime_sync";

export function broadcastDataMutation(type: string = "EVENT_MUTATED") {
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type, timestamp: Date.now() });
      bc.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel not supported:", err);
  }
}

export function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;

    const bc = new BroadcastChannel(CHANNEL_NAME);
    
    bc.onmessage = (event) => {
      if (event.data?.type === "EVENT_MUTATED" || event.data?.type === "DATA_CHANGED") {
        // Automatically invalidate all React Query caches instantly across all tabs
        queryClient.invalidateQueries();
      }
    };

    return () => {
      bc.close();
    };
  }, [queryClient]);

  return <>{children}</>;
}
