import { queryClient } from "@/lib/queryClient";

class RealtimeSyncEngine {
  private ws: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;

  constructor() {
    this.initBroadcastChannel();
    this.initWebSocket();
  }

  private initBroadcastChannel() {
    try {
      this.bc = new BroadcastChannel("eventhub_realtime_sync");
      this.bc.onmessage = (event) => {
        console.log("⚡ [RealtimeSync] BroadcastChannel message received:", event.data);
        this.invalidateCaches();
      };
    } catch (err) {}
  }

  private initWebSocket() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/socket.io/?EIO=4&transport=websocket`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("⚡ [RealtimeSync] WebSocket connected to real-time sync server");
      };

      this.ws.onmessage = (event) => {
        if (typeof event.data === "string" && (event.data.includes("event_changed") || event.data.includes("registration") || event.data.includes("checkin"))) {
          console.log("⚡ [RealtimeSync] WebSocket update message:", event.data);
          this.invalidateCaches();
        }
      };

      this.ws.onerror = () => {};
      this.ws.onclose = () => {
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (err) {}
  }

  public invalidateCaches() {
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/organizer"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/attendee"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/volunteer"] });
  }

  public notifyMutation(action: string, payload?: any) {
    this.invalidateCaches();
    if (this.bc) {
      try {
        this.bc.postMessage({ type: "REALTIME_MUTATION", action, payload, timestamp: Date.now() });
      } catch (err) {}
    }
  }
}

export const realtimeSync = new RealtimeSyncEngine();
