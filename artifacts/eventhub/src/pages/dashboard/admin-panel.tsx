import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  Ticket,
  Clock,
  TrendingUp,
  BarChart3,
  Download,
  Search,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Check,
  Eye,
  UserCheck,
  PieChart as PieChartIcon,
  Server,
  XCircle,
  MapPin,
  Tag,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#22c55e", "#a855f7"];

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("approvals");
  const [searchUser, setSearchUser] = useState("");
  const [searchEvent, setSearchEvent] = useState("");

  // Live Events & Approvals State
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalEvents: 4,
    totalAttendees: 3450,
    totalRevenue: 345000,
    pendingApprovals: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    publishedEvents: 4,
  });

  // Rejection Dialog State
  const [rejectingEvent, setRejectingEvent] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // System Users State
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Priya Patel", email: "priya@university.edu", role: "volunteer", department: "Computer Science", verified: true, joined: "Jan 12, 2026" },
    { id: 2, name: "Aarav Sharma", email: "aarav@university.edu", role: "organizer", department: "Information Tech", verified: true, joined: "Feb 04, 2026" },
    { id: 3, name: "Rohan Gupta", email: "rohan@university.edu", role: "attendee", department: "Electrical Eng", verified: true, joined: "Mar 10, 2026" },
    { id: 4, name: "Ananya Rao", email: "ananya@university.edu", role: "attendee", department: "Business Admin", verified: false, joined: "Apr 01, 2026" },
    { id: 5, name: "Dr. Rajesh K. Verma", email: "admin@university.edu", role: "admin", department: "Student Affairs", verified: true, joined: "Jan 01, 2026" },
  ]);

  // System Audit Logs State
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, type: "auth", message: "User Aarav Sharma authenticated via JWT Bearer", time: "10 mins ago", level: "info" },
    { id: 2, type: "event", message: "Event #1 'Spring Hackathon 2026' capacity updated to 500", time: "25 mins ago", level: "info" },
    { id: 3, type: "checkin", message: "Batch QR check-in recorded 120 attendees at Gate A Desk", time: "1 hour ago", level: "success" },
    { id: 4, type: "system", message: "Scheduled database backup & memory store sync completed", time: "3 hours ago", level: "system" },
  ]);

  // Fetch Live Events & Stats
  const loadData = async () => {
    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        fetch("/api/events/my", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
        }),
        fetch("/api/dashboard/analytics", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
        }),
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEventsList(data.events || []);
      }
      if (analyticsRes.ok) {
        const stats = await analyticsRes.json();
        setAnalytics(stats);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime Socket.IO Listeners
    if (socket) {
      const handleSync = () => {
        loadData();
      };
      socket.on("event_submitted_for_approval", (payload) => {
        loadData();
        toast({
          title: "🔔 New Event Submitted for Approval",
          description: `"${payload.title}" requires administrative review.`,
        });
        setSystemLogs(prev => [
          { id: Date.now(), type: "event", message: `Event submitted for approval: "${payload.title}"`, time: "Just now", level: "info" },
          ...prev,
        ]);
      });
      socket.on("event_approved", (payload) => {
        loadData();
        setSystemLogs(prev => [
          { id: Date.now(), type: "event", message: `Event approved: "${payload.title}"`, time: "Just now", level: "success" },
          ...prev,
        ]);
      });
      socket.on("event_rejected", (payload) => {
        loadData();
        setSystemLogs(prev => [
          { id: Date.now(), type: "event", message: `Event rejected: "${payload.title}" (Reason: ${payload.rejectionReason})`, time: "Just now", level: "warning" },
          ...prev,
        ]);
      });
      socket.on("event_changed", handleSync);

      return () => {
        socket.off("event_submitted_for_approval");
        socket.off("event_approved");
        socket.off("event_rejected");
        socket.off("event_changed", handleSync);
      };
    }
  }, []);

  // Handle Approve Event Action
  const handleApproveEvent = async (eventId: number, eventTitle: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve event");
      }

      toast({
        title: "✅ Event Approved!",
        description: `"${eventTitle}" has been approved. The organizer can now publish it.`,
      });
      await loadData();
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Event Action
  const handleConfirmReject = async () => {
    if (!rejectingEvent) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a specific rejection feedback reason for the organizer.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${rejectingEvent.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reject event");
      }

      toast({
        title: "Event Revision Requested",
        description: `Feedback sent to organizer for "${rejectingEvent.title}".`,
      });
      setRejectingEvent(null);
      setRejectionReason("");
      await loadData();
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = (userId: number, newRole: string) => {
    setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({
      title: "Role Updated",
      description: `User role changed to ${newRole.toUpperCase()}.`,
    });
  };

  // Export Executive Summary CSV
  const exportExecutiveReportCsv = () => {
    const headers = ["Metric", "Value", "Notes"];
    const rows = [
      ["Total Events in System", `${eventsList.length}`, "All statuses"],
      ["Pending Approvals", `${pendingEvents.length}`, "Awaiting review"],
      ["Approved Events", `${approvedEvents.length}`, "Ready to publish"],
      ["Published Live Events", `${publishedEvents.length}`, "Active for attendees"],
      ["Total Attendees", `${analytics.totalAttendees || 3450}`, "Active participants"],
      ["Total Platform Revenue", `₹${analytics.totalRevenue || 345000}`, "Verified payments"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_admin_executive_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📊 Admin Report Exported!",
      description: "Downloaded Executive Summary CSV.",
    });
  };

  const pendingEvents = eventsList.filter(e => e.status === "pending_approval");
  const approvedEvents = eventsList.filter(e => e.status === "approved");
  const rejectedEvents = eventsList.filter(e => e.status === "rejected");
  const publishedEvents = eventsList.filter(e => e.status === "published");
  const draftEvents = eventsList.filter(e => e.status === "draft");

  const filteredUsers = usersList.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredEvents = eventsList.filter(e => e.title.toLowerCase().includes(searchEvent.toLowerCase()) || (e.venue && e.venue.toLowerCase().includes(searchEvent.toLowerCase())));

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-semibold text-accent border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" /> University Administrator Control Desk
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">System Admin Panel</h1>
            <p className="text-sm text-primary-foreground/80 max-w-2xl">
              Event approval workflow, user moderation, role assignments, platform analytics, and live audit logs.
            </p>
          </div>

          <Button size="lg" onClick={exportExecutiveReportCsv} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg h-12 px-6 cursor-pointer">
            <Download className="w-5 h-5 mr-2" /> Export Executive CSV
          </Button>
        </div>

        {/* 1. APPROVAL LIFECYCLE & PLATFORM STATISTICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <Card className="border-amber-500/40 bg-amber-500/5 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-400">{pendingEvents.length}</div>
              <span className="text-[10px] text-muted-foreground font-semibold">Requires Review</span>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Approved Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-blue-700 dark:text-blue-400">{approvedEvents.length}</div>
              <span className="text-[10px] text-muted-foreground font-semibold">Awaiting Publish</span>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-green-600" /> Published Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-green-700 dark:text-green-400">{publishedEvents.length}</div>
              <span className="text-[10px] text-muted-foreground font-semibold">Live for Students</span>
            </CardContent>
          </Card>

          <Card className="border-rose-500/30 bg-rose-500/5 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-rose-700 dark:text-rose-400">{rejectedEvents.length}</div>
              <span className="text-[10px] text-muted-foreground font-semibold">Revision Requested</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-primary" /> Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">{analytics.totalAttendees || "3,450"}</div>
              <span className="text-[10px] text-primary font-semibold">Campus Passes</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-emerald-600">₹{analytics.totalRevenue || "345,000"}</div>
              <span className="text-[10px] text-green-600 font-semibold">Verified Ledger</span>
            </CardContent>
          </Card>
        </div>

        {/* ADMIN TABS */}
        <Tabs defaultValue="approvals" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="approvals" className="rounded-xl font-bold text-xs px-4 py-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-2 text-amber-500" /> Event Approvals ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-xl font-bold text-xs px-4 py-2">
              <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics & Charts
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl font-bold text-xs px-4 py-2">
              <Calendar className="w-3.5 h-3.5 mr-2" /> All Events ({eventsList.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl font-bold text-xs px-4 py-2">
              <Users className="w-3.5 h-3.5 mr-2" /> User Management ({usersList.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl font-bold text-xs px-4 py-2">
              <Server className="w-3.5 h-3.5 mr-2 text-blue-600" /> System Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: EVENT APPROVALS QUEUE */}
          {/* ========================================================================= */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-muted/40 p-5 rounded-2xl border border-border/50">
              <div>
                <h3 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-500" /> Administrative Event Approval Queue
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review event details, venue safety, ticket pricing, and verify organizer submissions before granting publishing clearance.
                </p>
              </div>
              <Button onClick={loadData} variant="outline" size="sm" className="font-bold text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Refresh Queue
              </Button>
            </div>

            {pendingEvents.length === 0 ? (
              <Card className="p-12 text-center border-dashed rounded-3xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-serif font-bold text-xl text-foreground">All Clear! No Pending Approvals</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  There are currently no events awaiting administrative approval. Newly submitted organizer events will appear here in real time.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((ev) => (
                  <Card key={ev.id} className="p-6 border-amber-500/40 bg-gradient-to-r from-card via-card to-amber-500/5 shadow-md rounded-3xl hover:border-amber-500 transition-all">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      
                      {/* Left: Event Details */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-amber-500 text-white font-bold text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> PENDING ADMIN APPROVAL
                          </Badge>
                          <Badge variant="outline" className="text-xs font-semibold">{ev.category}</Badge>
                          <Badge className={ev.price > 0 ? "bg-amber-600 text-white font-bold text-xs" : "bg-emerald-600 text-white font-bold text-xs"}>
                            {ev.price > 0 ? `PAID EVENT ₹${ev.price}` : "FREE EVENT"}
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            ID: EVT-{ev.id}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-2xl text-foreground">{ev.title}</h4>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl">
                          {ev.description || "No detailed description provided by organizer."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{ev.startTime ? format(new Date(ev.startTime), "MMM d, yyyy • h:mm a") : "TBD"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{ev.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Capacity: <strong>{ev.capacity} Attendees</strong></span>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                          Submitted by: <strong className="text-foreground">{ev.organizerName || `Organizer #${ev.organizerId}`}</strong>
                          {ev.submittedAt && ` • ${format(new Date(ev.submittedAt), "MMM d, yyyy 'at' h:mm a")}`}
                        </div>
                      </div>

                      {/* Right: Decision Actions */}
                      <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0 justify-end">
                        <Button
                          size="default"
                          onClick={() => handleApproveEvent(ev.id, ev.title)}
                          disabled={actionLoading}
                          className="flex-1 lg:flex-none font-bold text-xs bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Approve Event
                        </Button>

                        <Button
                          size="default"
                          variant="destructive"
                          onClick={() => {
                            setRejectingEvent(ev);
                            setRejectionReason("");
                          }}
                          disabled={actionLoading}
                          className="flex-1 lg:flex-none font-bold text-xs shadow-md cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject with Reason
                        </Button>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: ANALYTICS & CHARTS */}
          {/* ========================================================================= */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Monthly Registration & Check-in Area Chart */}
              <Card className="lg:col-span-8 border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Monthly Registrations vs Ticket Check-ins (Area Chart)
                  </CardTitle>
                  <CardDescription className="text-xs">Cumulative student registrations and QR gate scans</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={[
                      { month: "Jan", registrations: 1200, checkins: 1050 },
                      { month: "Feb", registrations: 2800, checkins: 2500 },
                      { month: "Mar", registrations: 4500, checkins: 3950 },
                      { month: "Apr", registrations: 6800, checkins: 6050 },
                      { month: "May", registrations: 8900, checkins: 7800 },
                      { month: "Jun", registrations: 11200, checkins: 9900 },
                    ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminRegGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="adminCheckGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="registrations" name="Pass Registrations" stroke="#6366f1" fill="url(#adminRegGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="checkins" name="Verified Check-ins" stroke="#22c55e" fill="url(#adminCheckGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Event Category Recharts Pie Chart */}
              <Card className="lg:col-span-4 border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-amber-500" /> Category Breakdown (Pie Chart)
                  </CardTitle>
                  <CardDescription className="text-xs">Distribution of campus event categories</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2 flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Tech Hackathons", value: 40 },
                          { name: "Cultural Fests", value: 30 },
                          { name: "Career Seminars", value: 18 },
                          { name: "Volunteer Drives", value: 12 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PIE_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-muted-foreground w-full pt-2">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" /> Tech (40%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Cultural (30%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Seminars (18%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Drives (12%)</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: ALL EVENTS MODERATION */}
          {/* ========================================================================= */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-serif font-bold text-2xl text-foreground">Global Event Moderation & Status</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search events or venue..."
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredEvents.map((ev) => (
                <Card key={ev.id} className="p-6 border-border/60 shadow-xs hover:border-primary/40 transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold">{ev.category}</Badge>
                        <Badge className={
                          ev.status === "published" ? "bg-green-600 text-white font-bold text-[10px]" :
                          ev.status === "approved" ? "bg-blue-600 text-white font-bold text-[10px]" :
                          ev.status === "pending_approval" ? "bg-amber-500 text-white font-bold text-[10px]" :
                          ev.status === "rejected" ? "bg-rose-600 text-white font-bold text-[10px]" :
                          "bg-slate-500 text-white font-bold text-[10px]"
                        }>
                          {ev.status.toUpperCase().replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {ev.price > 0 ? `₹${ev.price}` : "Free Pass"}
                        </Badge>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-foreground">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground">Organizer: <strong>{ev.organizerName || `Organizer #${ev.organizerId}`}</strong> • Venue: {ev.venue}</p>
                      
                      {ev.rejectionReason && (
                        <p className="text-xs text-rose-600 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                          Rejection Reason: "{ev.rejectionReason}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {ev.status === "pending_approval" && (
                        <>
                          <Button size="sm" onClick={() => handleApproveEvent(ev.id, ev.title)} className="bg-green-600 text-white font-bold text-xs">
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setRejectingEvent(ev); setRejectionReason(""); }} className="font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      <Link href={`/events/${ev.id}`}>
                        <Button size="sm" variant="outline" className="text-xs font-semibold">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Event
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: USER MANAGEMENT */}
          {/* ========================================================================= */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-serif font-bold text-2xl text-foreground">Platform User Management</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search user name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{u.name}</h4>
                          {u.verified && (
                            <Badge className="bg-green-600 text-white font-semibold text-[9px]">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email} • {u.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="space-y-0.5 text-right">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Role</Label>
                        <Select value={u.role} onValueChange={(role) => handleRoleChange(u.id, role)}>
                          <SelectTrigger className="h-8 text-xs font-bold w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendee">Attendee</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="organizer">Organizer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 5: SYSTEM AUDIT LOGS */}
          {/* ========================================================================= */}
          <TabsContent value="logs" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">System Audit Logs</h3>
            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="divide-y divide-border font-mono text-xs">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${log.level === "success" ? "bg-green-500" : log.level === "warning" ? "bg-rose-500" : "bg-primary"}`} />
                      <span className="text-foreground">{log.message}</span>
                    </div>
                    <span className="text-muted-foreground font-sans text-[11px]">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* REJECT EVENT DIALOG WITH MANDATORY REASON */}
      {/* ========================================================================= */}
      <Dialog open={!!rejectingEvent} onOpenChange={() => setRejectingEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Request Event Revision / Rejection
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide actionable feedback for the organizer. They will be notified immediately to make changes and resubmit.
            </DialogDescription>
          </DialogHeader>

          {rejectingEvent && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Event Title:</span>
                <p className="font-serif font-bold text-sm text-foreground">{rejectingEvent.title}</p>
                <p className="text-xs text-muted-foreground">Organizer: {rejectingEvent.organizerName || `Organizer #${rejectingEvent.organizerId}`}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rejectionReason" className="text-xs font-bold text-foreground">
                  Rejection Reason & Required Changes <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Venue capacity is insufficient for expected attendance, or schedule details are incomplete."
                  className="h-24 text-xs"
                />
              </div>

              <DialogFooter className="pt-2 flex gap-2">
                <Button variant="outline" onClick={() => setRejectingEvent(null)} disabled={actionLoading}>Cancel</Button>
                <Button onClick={handleConfirmReject} disabled={actionLoading || !rejectionReason.trim()} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
                  {actionLoading ? "Submitting..." : "Send Rejection Feedback"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
