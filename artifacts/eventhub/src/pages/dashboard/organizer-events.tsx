import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListMyEvents,
  useDeleteEvent,
  useUpdateEvent,
  useCreateEvent,
  getListMyEventsQueryKey,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle, Calendar, MapPin, Users, BarChart3,
  Pencil, Trash2, Eye, EyeOff, Copy, Search, CheckCircle2, Sparkles, Filter
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { broadcastDataMutation } from "@/components/realtime-sync-provider";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300",
};

export default function OrganizerEvents() {
  const { data, isLoading } = useListMyEvents();
  const deleteMutation = useDeleteEvent();
  const updateMutation = useUpdateEvent();
  const createMutation = useCreateEvent();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        broadcastDataMutation("EVENT_DELETED");
        toast({ title: "Event Deleted", description: "The event has been permanently removed." });
        setDeleteId(null);
      },
    });
  };

  const togglePublish = (event: { id: number; title: string; status: string }) => {
    const newStatus = event.status === "published" ? "draft" : "published";
    updateMutation.mutate({ id: event.id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        broadcastDataMutation("EVENT_STATUS_CHANGED");
        toast({
          title: newStatus === "published" ? "🎉 Event Published" : "📝 Event Saved as Draft",
          description: `"${event.title}" is now ${newStatus}.`,
        });
      },
    });
  };

  // 1-Click Duplicate Event Action
  const handleDuplicate = (event: any) => {
    const duplicateData = {
      title: `Copy of ${event.title}`,
      description: event.description || "",
      category: event.category || "Technology",
      venue: event.venue || "Campus Main Hall",
      startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
      capacity: event.capacity || 100,
      bannerUrl: event.bannerUrl,
      status: "draft" as const,
    };

    createMutation.mutate({ data: duplicateData }, {
      onSuccess: (newEvent: any) => {
        queryClient.invalidateQueries({ queryKey: getListMyEventsQueryKey() });
        toast({
          title: "📋 Event Duplicated!",
          description: `Created "Copy of ${event.title}" as a draft.`,
        });
        setLocation(`/dashboard/organizer/events/${newEvent.id}/edit`);
      },
    });
  };

  const events = data?.events ?? [];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase()) || ev.venue.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Event Management & Control</h1>
            <p className="text-muted-foreground text-sm mt-1">Create, edit, duplicate, draft, publish, and monitor your campus activities.</p>
          </div>
          <Link href="/dashboard/organizer/events/new">
            <Button size="lg" className="font-bold shadow-md cursor-pointer">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search your events by title or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["all", "published", "draft"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="capitalize text-xs font-semibold"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-muted rounded-2xl h-40" />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-card border border-dashed rounded-3xl p-16 text-center space-y-4">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-xl font-bold font-serif">No Events Found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Create a new event or adjust search filters to view your existing events.</p>
            <Link href="/dashboard/organizer/events/new">
              <Button size="lg" className="font-bold shadow-sm">
                <PlusCircle className="w-5 h-5 mr-2" /> Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => {
              const fill = event.registeredCount ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
              const isPast = new Date(event.endTime) < new Date();

              return (
                <Card key={event.id} className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2 flex-wrap items-center">
                          <Badge className={STATUS_COLORS[event.status] ?? ""} variant="outline">
                            {event.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-medium">{event.category}</Badge>
                          {isPast && <Badge variant="outline" className="text-xs text-muted-foreground">Past Event</Badge>}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground font-semibold">ID: #{event.id}</span>
                      </div>

                      <h3 className="text-xl font-serif font-bold leading-snug text-foreground hover:text-primary transition-colors">
                        <Link href={`/events/${event.id}`}>{event.title}</Link>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          {format(new Date(event.startTime), "MMM d, yyyy • h:mm a")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                          {event.registeredCount || 0} / {event.capacity} ({fill}% full)
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden w-full max-w-md">
                          <div
                            className={`h-full rounded-full transition-all ${fill >= 100 ? "bg-destructive" : fill > 80 ? "bg-orange-500" : "bg-green-600"}`}
                            style={{ width: `${Math.min(fill, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="md:w-64 border-t md:border-t-0 md:border-l border-border p-4 flex md:flex-col gap-2 bg-muted/20 justify-center">
                      <Link href={`/dashboard/organizer/events/${event.id}/attendance`} className="flex-1 md:flex-none">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold">
                          <Users className="w-3.5 h-3.5 mr-2 text-primary" /> Attendance ({event.registeredCount || 0})
                        </Button>
                      </Link>

                      <Link href={`/dashboard/organizer/events/${event.id}/analytics`} className="flex-1 md:flex-none">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold">
                          <BarChart3 className="w-3.5 h-3.5 mr-2 text-purple-600" /> Analytics & Reports
                        </Button>
                      </Link>

                      <Link href={`/dashboard/organizer/events/${event.id}/edit`} className="flex-1 md:flex-none">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold">
                          <Pencil className="w-3.5 h-3.5 mr-2 text-blue-600" /> Edit Event
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold flex-1 md:flex-none"
                        onClick={() => handleDuplicate(event)}
                        disabled={createMutation.isPending}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Duplicate Event
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold flex-1 md:flex-none"
                        onClick={() => togglePublish(event)}
                        disabled={updateMutation.isPending}
                      >
                        {event.status === "published"
                          ? <><EyeOff className="w-3.5 h-3.5 mr-2 text-amber-600" /> Unpublish</>
                          : <><Eye className="w-3.5 h-3.5 mr-2 text-green-600" /> Publish Event</>
                        }
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold text-destructive hover:bg-destructive/10 flex-1 md:flex-none"
                        onClick={() => setDeleteId(event.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Alert */}
        <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif font-bold text-xl">Delete Event?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                This will permanently delete the event, attendee registration records, and check-in history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                onClick={handleDelete}
              >
                Permanently Delete Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
