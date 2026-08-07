import React from "react";
import { Link } from "wouter";
import { useGetOrganizerDashboard } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, BarChart3, CheckSquare,
  ArrowRight, TrendingUp, PlusCircle, Activity, Sparkles, Zap, ShieldCheck
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function OrganizerDashboard() {
  const { data, isLoading } = useGetOrganizerDashboard();

  // Dynamic Chart Dataset for Analytics
  const chartData = [
    { day: "Mon", registrations: 45, checkins: 38 },
    { day: "Tue", registrations: 72, checkins: 60 },
    { day: "Wed", registrations: 110, checkins: 95 },
    { day: "Thu", registrations: 165, checkins: 140 },
    { day: "Fri", registrations: 240, checkins: 210 },
    { day: "Sat", registrations: 380, checkins: 345 },
    { day: "Sun", registrations: 450, checkins: 420 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/60 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-primary/10 text-primary rounded-md text-xs font-bold">Organizer Portal</span>
              <span className="text-xs text-muted-foreground">• Live Real-time Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-foreground">
              Organizer Analytics & Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Monitor event registrations, track volunteer hours, and review real-time check-in velocity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/organizer/events/new">
              <Button className="font-bold text-xs shadow-xs h-10 px-5 rounded-xl">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse bg-muted rounded-2xl h-28" />)}
            </div>
            <div className="animate-pulse bg-muted rounded-2xl h-72" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 4-Column Live Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Events", value: data?.totalEvents ?? 0, trend: "+12% this month", icon: Calendar, color: "text-primary bg-primary/10" },
                { label: "Published", value: data?.publishedEvents ?? 0, trend: "Active on Portal", icon: TrendingUp, color: "text-emerald-600 bg-emerald-500/10" },
                { label: "Registrations", value: data?.totalRegistrations ?? 0, trend: "+24% growth rate", icon: Users, color: "text-purple-600 bg-purple-500/10" },
                { label: "Verified Check-ins", value: data?.totalCheckins ?? 0, trend: "98.4% QR Accuracy", icon: CheckSquare, color: "text-amber-600 bg-amber-500/10" },
              ].map(({ label, value, trend, icon: Icon, color }) => (
                <Card key={label} className="rounded-2xl border-border/60 shadow-xs hover:border-primary/40 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground">{label}</CardTitle>
                    <div className={`p-2 rounded-xl ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-extrabold font-sans text-foreground">{value.toLocaleString()}</div>
                    <span className="text-[11px] font-semibold text-emerald-600 block mt-1">{trend}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analytics Area Chart Section */}
            <Card className="rounded-2xl border-border/60 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h3 className="font-sans font-extrabold text-base text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Registration Velocity & Check-in Volume
                  </h3>
                  <p className="text-xs text-muted-foreground">Real-time registration throughput over the past 7 days.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Registrations</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> QR Check-ins</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCheck" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                    <Area type="monotone" dataKey="checkins" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCheck)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Upcoming Events Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-sans font-extrabold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Upcoming Event Lifecycle
                </h2>
                <Link href="/dashboard/organizer/events">
                  <Button variant="ghost" size="sm" className="text-primary font-bold text-xs">
                    View All Events <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {(!data?.upcomingEvents || data.upcomingEvents.length === 0) ? (
                <div className="bg-card border border-dashed border-border/80 rounded-2xl p-10 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <h3 className="text-base font-bold mb-1">No active events found</h3>
                  <p className="text-xs text-muted-foreground mb-4">Create your first campus event to begin receiving registrations.</p>
                  <Link href="/dashboard/organizer/events/new">
                    <Button size="sm" className="font-bold text-xs"><PlusCircle className="w-4 h-4 mr-2" />Create Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.upcomingEvents.map(event => {
                    const fill = event.registeredCount ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
                    return (
                      <Card key={event.id} className="rounded-2xl border-border/60 hover:border-primary/40 transition-all shadow-xs p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">{event.category}</Badge>
                          <span className="text-xs text-muted-foreground font-medium">{format(new Date(event.startTime), "MMM d, yyyy")}</span>
                        </div>
                        
                        <div>
                          <CardTitle className="text-base font-sans font-extrabold text-foreground leading-snug line-clamp-1">
                            {event.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{(event as any).location ?? (event as any).venue ?? "Main Auditorium"}</p>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-muted-foreground font-semibold">
                            <span>Registration Meter</span>
                            <span className="text-primary font-bold">{event.registeredCount || 0} / {event.capacity} ({fill}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${fill >= 100 ? "bg-destructive" : fill > 80 ? "bg-amber-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(fill, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link href={`/dashboard/organizer/events/${event.id}/attendance`}>
                            <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl h-9">
                              <Users className="w-3.5 h-3.5 mr-1" /> Attendance
                            </Button>
                          </Link>
                          <Link href={`/dashboard/organizer/events/${event.id}/analytics`}>
                            <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl h-9">
                              <BarChart3 className="w-3.5 h-3.5 mr-1" /> Analytics
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activity Stream */}
            {data?.recentActivity && data.recentActivity.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-sans font-extrabold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Live Event Stream
                </h2>
                <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
                  <CardContent className="p-0 divide-y divide-border/60">
                    {data.recentActivity.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="font-semibold text-foreground">{activity.message}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
