import { io, Socket } from "socket.io-client";
import { queryClient } from "@/lib/queryClient";

type CheckinListener = (data: any) => void;
type EventListener = (data: any) => void;

class RealtimeSyncEngine {
  private socket: Socket | null = null;
  private bc: BroadcastChannel | null = null;
  private checkinListeners: Set<CheckinListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.initSocketIo();
  }

  private initBroadcastChannel() {
    try {
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
    } catch (err) {}
  }

  private initSocketIo() {
    try {
      const socketUrl = window.location.origin;

      this.socket = io(socketUrl, {
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

      // Real-time Check-in Event
      this.socket.on("checkin_completed", (data) => {
        console.log("⚡ [RealtimeSync] Check-in event received:", data);
        this.invalidateCaches();
        this.checkinListeners.forEach((fn) => fn(data));
        this.broadcastLocal("CHECKIN_COMPLETED", data);
      });

      // Real-time Attendance Count Update
      this.socket.on("attendance_updated", (data) => {
        console.log("⚡ [RealtimeSync] Attendance updated:", data);
        this.invalidateCaches();
      });

      // Real-time Event Created / Updated / Published / Deleted
      this.socket.on("event_changed", (data) => {
        console.log("⚡ [RealtimeSync] Event changed:", data);
        this.invalidateCaches();
        this.eventListeners.forEach((fn) => fn(data));
        this.broadcastLocal("EVENT_CHANGED", data);
      });

      // Real-time Registration Created / Cancelled
      this.socket.on("registration_created", () => {
        this.invalidateCaches();
      });
      this.socket.on("registration_cancelled", () => {
        this.invalidateCaches();
      });

      // Real-time Volunteer Applications & Tasks
      this.socket.on("volunteer_applied", () => {
        queryClient.invalidateQueries({ queryKey: ["/api/volunteers/applications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/organizer"] });
      });

      this.socket.on("task_created", () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/organizer"] });
      });

      this.socket.on("task_assigned", () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/volunteer"] });
      });
    } catch (err) {
      console.warn("⚠️ [RealtimeSync] Socket initialization warning:", err);
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

  public getSocket(): Socket | null {
    return this.socket;
  }

  public notifyMutation(action: string, payload?: any) {
    this.invalidateCaches();
    this.broadcastLocal("REALTIME_MUTATION", { action, payload });
  }
}

export const realtimeSync = new RealtimeSyncEngine();
export const socket = realtimeSync.getSocket();
