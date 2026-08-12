import { queryClient } from "@/lib/queryClient";

type CheckinListener = (data: any) => void;
type EventListener = (data: any) => void;
type GenericListener = (data: any) => void;

class RealtimeSyncEngine {
  private socket: any = null;
  private bc: BroadcastChannel | null = null;
  private checkinListeners: Set<CheckinListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();
  private genericListeners: Map<string, Set<GenericListener>> = new Map();

  constructor() {
    this.initBroadcastChannel();
    this.initSocketIo();
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.bc = new BroadcastChannel("eventhub_realtime_sync");
        this.bc.onmessage = (event) => {
          this.invalidateCaches();
          if (event.data?.type === "CHECKIN_COMPLETED") {
            this.checkinListeners.forEach((fn) => fn(event.data.payload));
          }
          if (event.data?.type === "EVENT_CHANGED") {
            this.eventListeners.forEach((fn) => fn(event.data.payload));
          }
        };
      }
    } catch (err) {}
  }

  private async initSocketIo() {
    if (typeof window === "undefined") return;

    try {
      // Dynamic import prevents Rollup build-time dependency resolution issues in CI/Vercel
      const socketModule = await import("socket.io-client");
      const ioFunc = (socketModule as any).io || (socketModule as any).default || socketModule;
      const socketUrl = window.location.origin;

      this.socket = ioFunc(socketUrl, {
        path: "/api/socket.io",
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
      });

      this.socket.on("connect", () => {
        console.log("⚡ [RealtimeSync] Socket.IO connected:", this.socket?.id);
      });

      // Replay all registered listeners onto the live socket instance
      this.genericListeners.forEach((callbacks, eventName) => {
        callbacks.forEach((cb) => {
          this.socket.on(eventName, cb);
        });
      });

      // Real-time Check-in Event
      this.socket.on("checkin_completed", (data: any) => {
        this.invalidateCaches();
        this.checkinListeners.forEach((fn) => fn(data));
        this.broadcastLocal("CHECKIN_COMPLETED", data);
      });

      // Real-time Attendance Count Update
      this.socket.on("attendance_updated", (data: any) => {
        this.invalidateCaches();
      });

      // Real-time Event Created / Updated / Published / Deleted
      this.socket.on("event_changed", (data: any) => {
        this.invalidateCaches();
        this.eventListeners.forEach((fn) => fn(data));
        this.broadcastLocal("EVENT_CHANGED", data);
      });

      // Real-time Volunteer Applications & Tasks
      this.socket.on("volunteer_applied", (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["/api/volunteers/applications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/organizer"] });
        this.dispatchGeneric("volunteer_applied", data);
      });

      this.socket.on("volunteer_assigned", (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["/api/volunteers/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/volunteer"] });
        this.dispatchGeneric("volunteer_assigned", data);
      });

      this.socket.on("event_approved", (data: any) => {
        this.invalidateCaches();
        this.dispatchGeneric("event_approved", data);
      });

      this.socket.on("event_rejected", (data: any) => {
        this.invalidateCaches();
        this.dispatchGeneric("event_rejected", data);
      });

      this.socket.on("registration_created", () => {
        this.invalidateCaches();
      });
      this.socket.on("registration_cancelled", () => {
        this.invalidateCaches();
      });
    } catch (err) {
      console.warn("⚠️ [RealtimeSync] Socket.IO initialization note:", err);
    }
  }

  private dispatchGeneric(eventName: string, data: any) {
    const set = this.genericListeners.get(eventName);
    if (set) {
      set.forEach((fn) => fn(data));
    }
  }

  private broadcastLocal(type: string, payload: any) {
    if (this.bc) {
      try {
        this.bc.postMessage({ type, payload, timestamp: Date.now() });
      } catch (err) {}
    }
  }

  public invalidateCaches() {
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/organizer"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/attendee"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/volunteer"] });
    queryClient.invalidateQueries({ queryKey: ["/api/registrations/me"] });
    queryClient.invalidateQueries({ queryKey: ["/api/registrations/my"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/attendance"] });
  }

  public joinEventRoom(eventId: number | string) {
    this.socket?.emit("join_event_room", String(eventId));
  }

  public onCheckin(callback: CheckinListener): () => void {
    this.checkinListeners.add(callback);
    return () => this.checkinListeners.delete(callback);
  }

  public onEventChanged(callback: EventListener): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  public on(eventName: string, callback: GenericListener) {
    if (!this.genericListeners.has(eventName)) {
      this.genericListeners.set(eventName, new Set());
    }
    this.genericListeners.get(eventName)!.add(callback);
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  public off(eventName: string, callback?: GenericListener) {
    if (callback) {
      this.genericListeners.get(eventName)?.delete(callback);
      if (this.socket) {
        this.socket.off(eventName, callback);
      }
    } else {
      this.genericListeners.delete(eventName);
      if (this.socket) {
        this.socket.off(eventName);
      }
    }
  }

  public emit(eventName: string, ...args: any[]) {
    if (this.socket) {
      this.socket.emit(eventName, ...args);
    }
  }

  public getSocket(): any {
    return this;
  }

  public notifyMutation(action: string, payload?: any) {
    this.invalidateCaches();
    this.broadcastLocal("REALTIME_MUTATION", { action, payload });
  }
}

export const realtimeSync = new RealtimeSyncEngine();
export const socket = realtimeSync;
