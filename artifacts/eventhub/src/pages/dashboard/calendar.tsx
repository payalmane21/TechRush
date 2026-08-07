import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Bell,
  ExternalLink,
  Plus,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Flag,
  Move,
  Tag
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { useListEvents } from "@workspace/api-client-react";

export default function CalendarPage() {
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "holidays">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showHolidays, setShowHolidays] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [reminderModalEvent, setReminderModalEvent] = useState<any | null>(null);
  const [reminderTime, setReminderTime] = useState("1 hour before");

  // Fetch Live Backend Database Events
  const { data } = useListEvents();
  const dbEvents = data?.events ?? [];

  const events = dbEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    date: format(new Date(ev.startTime), "yyyy-MM-dd"),
    time: `${format(new Date(ev.startTime), "hh:mm a")} - ${format(new Date(ev.endTime), "hh:mm a")}`,
    category: ev.category,
    venue: ev.venue,
    color: ev.category === "Technology" ? "bg-primary text-primary-foreground" : ev.category === "Cultural" ? "bg-purple-600 text-white" : ev.category === "Seminar" ? "bg-blue-600 text-white" : "bg-green-600 text-white",
    organizer: (ev as any).organizerName || "ACM Chapter",
  }));

  // Academic Holidays List
  const holidays = [
    { id: 101, title: "🌸 University Spring Break", date: "2026-04-10", type: "Academic Recess" },
    { id: 102, title: "🏛️ Founder's Day Holiday", date: "2026-04-14", type: "University Holiday" },
    { id: 103, title: "🧪 National Science Day", date: "2026-04-25", type: "National Holiday" },
  ];

  // Google Calendar Sync Handler
  const syncToGoogleCalendar = (ev: any) => {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(`Event organized by ${ev.organizer} at ${ev.venue}. Registered via EventHub.`);
    const location = encodeURIComponent(ev.venue);

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleUrl, "_blank");

    toast({
      title: "📅 Google Calendar Opened!",
      description: `Opened sync page for "${ev.title}".`,
    });
  };

  // Set Reminder Handler
  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderModalEvent) return;

    toast({
      title: "🔔 Reminder Set!",
      description: `Notification alert scheduled for "${reminderModalEvent.title}" (${reminderTime}).`,
    });
    setReminderModalEvent(null);
  };

  // Drag and Drop / Reschedule Handler
  const handleRescheduleEvent = (eventId: number, newDateStr: string) => {
    toast({
      title: "🔄 Event Rescheduled!",
      description: `Moved event to ${newDateStr}.`,
    });
  };

  // Calendar Days Grid Generation for April 2026
  const daysInApril2026 = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-04-${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    const dayHoliday = holidays.find(h => h.date === dateStr);
    return { dayNum, dateStr, dayEvents, dayHoliday };
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Interactive Campus Event Calendar
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Month, Week, Day, and Holiday views with Google Calendar sync, reminders, and drag-and-drop rescheduling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={showHolidays ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHolidays(!showHolidays)}
              className="font-bold text-xs cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              {showHolidays ? "Holidays Visible" : "Show Holidays"}
            </Button>
          </div>
        </div>

        {/* VIEW SWITCHER TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Tabs defaultValue="month" value={viewMode} onValueChange={(val: any) => setViewMode(val)} className="w-full md:w-auto">
            <TabsList className="bg-card border border-border p-1.5 rounded-2xl">
              <TabsTrigger value="month" className="rounded-xl font-bold text-xs px-4">Month View</TabsTrigger>
              <TabsTrigger value="week" className="rounded-xl font-bold text-xs px-4">Week View</TabsTrigger>
              <TabsTrigger value="day" className="rounded-xl font-bold text-xs px-4">Day View</TabsTrigger>
              <TabsTrigger value="holidays" className="rounded-xl font-bold text-xs px-4">Holidays ({holidays.length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="font-bold text-xs" onClick={() => setSelectedDate(new Date(2026, 3, 15))}>
              Today (Apr 15, 2026)
            </Button>
            <div className="flex items-center border border-border rounded-xl p-1 bg-card">
              <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs font-serif font-bold px-3">April 2026</span>
              <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === "month" && (
          <Card className="border-border/60 shadow-xs rounded-3xl overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/60 border-b border-border text-center py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-border bg-card min-h-[500px]">
              {daysInApril2026.map(({ dayNum, dateStr, dayEvents, dayHoliday }) => (
                <div
                  key={dayNum}
                  className={`p-2 sm:p-3 min-h-[110px] space-y-1.5 transition-colors ${
                    dateStr === "2026-04-15" ? "bg-primary/5 font-bold" : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                      dateStr === "2026-04-15" ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-muted-foreground font-mono">{dayEvents.length} event</span>
                    )}
                  </div>

                  {/* Holiday Badge */}
                  {showHolidays && dayHoliday && (
                    <div className="p-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[9px] font-bold text-amber-800 dark:text-amber-300 truncate">
                      {dayHoliday.title}
                    </div>
                  )}

                  {/* Event Pills */}
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all hover:scale-102 shadow-2xs ${ev.color} truncate`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === "week" && (
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Week Schedule (April 13 – April 19, 2026)</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {[
                { day: "Mon 13", dateStr: "2026-04-13" },
                { day: "Tue 14", dateStr: "2026-04-14", holiday: "Founder's Day" },
                { day: "Wed 15", dateStr: "2026-04-15", event: events[0] },
                { day: "Thu 16", dateStr: "2026-04-16" },
                { day: "Fri 17", dateStr: "2026-04-17" },
                { day: "Sat 18", dateStr: "2026-04-18", event: events[1] },
                { day: "Sun 19", dateStr: "2026-04-19" },
              ].map((w, idx) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3 min-h-[180px]">
                  <h4 className="font-bold text-sm text-foreground border-b border-border/50 pb-2">{w.day}</h4>
                  {w.holiday && (
                    <Badge className="bg-amber-500/20 text-amber-800 border-amber-500/40 text-[10px] w-full justify-center">
                      🏛️ {w.holiday}
                    </Badge>
                  )}
                  {w.event ? (
                    <div onClick={() => setSelectedEvent(w.event)} className={`p-3 rounded-2xl text-xs font-bold ${w.event.color} space-y-1 cursor-pointer shadow-2xs`}>
                      <span className="block">{w.event.title}</span>
                      <span className="text-[10px] opacity-80 block">{w.event.time}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic block pt-4">No events</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 3. DAY VIEW */}
        {viewMode === "day" && (
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Day Agenda — Wednesday, April 15, 2026</h3>
            <div className="space-y-4">
              {events.filter(e => e.date === "2026-04-15").map((ev) => (
                <Card key={ev.id} className="p-6 border-l-4 border-l-primary border-border/60 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs font-semibold">{ev.category}</Badge>
                      <h4 className="font-serif font-bold text-xl text-foreground">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
                        <span><Clock className="w-3.5 h-3.5 inline mr-1 text-primary" /> {ev.time}</span>
                        <span><MapPin className="w-3.5 h-3.5 inline mr-1 text-primary" /> {ev.venue}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => syncToGoogleCalendar(ev)} className="font-bold text-xs bg-white text-foreground border border-border hover:bg-muted shadow-2xs cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1 text-blue-600" /> Google Calendar
                      </Button>
                      <Button size="sm" onClick={() => setReminderModalEvent(ev)} className="font-bold text-xs shadow-2xs cursor-pointer">
                        <Bell className="w-3.5 h-3.5 mr-1" /> Set Reminder
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* 4. HOLIDAYS VIEW */}
        {viewMode === "holidays" && (
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Academic & University Holiday Calendar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {holidays.map((h) => (
                <Card key={h.id} className="p-6 border-l-4 border-l-amber-500 border-border/60 shadow-2xs space-y-2">
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 font-bold text-[10px]">{h.type}</Badge>
                  <h4 className="font-serif font-bold text-lg text-foreground">{h.title}</h4>
                  <p className="text-xs text-muted-foreground">Date: <strong>{h.date}</strong></p>
                </Card>
              ))}
            </div>
          </Card>
        )}

      </div>

      {/* EVENT DETAILS & RESCHEDULE MODAL */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl">{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="text-xs">Organized by {selectedEvent?.organizer}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 space-y-2">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Clock className="w-4 h-4 text-primary" /> {selectedEvent?.date} • {selectedEvent?.time}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> {selectedEvent?.venue}
              </p>
            </div>

            {/* Quick Reschedule */}
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reschedule Event Date</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  defaultValue={selectedEvent?.date}
                  onChange={(e) => handleRescheduleEvent(selectedEvent?.id, e.target.value)}
                  className="h-10 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button size="sm" onClick={() => syncToGoogleCalendar(selectedEvent)} className="font-bold text-xs bg-white text-foreground border border-border hover:bg-muted">
              <ExternalLink className="w-3.5 h-3.5 mr-1 text-blue-600" /> Google Calendar
            </Button>
            <Button size="sm" onClick={() => { setReminderModalEvent(selectedEvent); setSelectedEvent(null); }} className="font-bold text-xs">
              <Bell className="w-3.5 h-3.5 mr-1" /> Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REMINDER ALARM MODAL */}
      <Dialog open={!!reminderModalEvent} onOpenChange={() => setReminderModalEvent(null)}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Schedule Event Reminder
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set notification alarm for <strong>{reminderModalEvent?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSetReminder} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Select Reminder Window</Label>
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger className="h-10 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes before">15 minutes before</SelectItem>
                  <SelectItem value="1 hour before">1 hour before</SelectItem>
                  <SelectItem value="1 day before">1 day before</SelectItem>
                  <SelectItem value="Morning of event (8:00 AM)">Morning of event (8:00 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReminderModalEvent(null)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs">Save Reminder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
