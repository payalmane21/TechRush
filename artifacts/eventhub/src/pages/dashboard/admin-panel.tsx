import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Server
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#22c55e", "#a855f7"];

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchUser, setSearchUser] = useState("");
  const [searchEvent, setSearchEvent] = useState("");

  // System Users State
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Priya Patel", email: "priya@university.edu", role: "volunteer", department: "Computer Science", verified: true, joined: "Jan 12, 2026" },
    { id: 2, name: "Aarav Sharma", email: "aarav@university.edu", role: "organizer", department: "Information Tech", verified: true, joined: "Feb 04, 2026" },
    { id: 3, name: "Rohan Gupta", email: "rohan@university.edu", role: "attendee", department: "Electrical Eng", verified: true, joined: "Mar 10, 2026" },
    { id: 4, name: "Ananya Rao", email: "ananya@university.edu", role: "attendee", department: "Business Admin", verified: false, joined: "Apr 01, 2026" },
    { id: 5, name: "Dr. Rajesh K. Verma", email: "admin@university.edu", role: "admin", department: "Student Affairs", verified: true, joined: "Jan 01, 2026" },
  ]);

  // System Events State
  const [eventsList, setEventsList] = useState([
    { id: 1, title: "Spring Annual Hackathon & Innovation Expo 2026", category: "Competition", organizer: "ACM Student Chapter", status: "published", registered: 380, capacity: 500, venue: "Main Auditorium" },
    { id: 2, title: "Grand Cultural Fest & Music Night", category: "Cultural", organizer: "Cultural Society", status: "published", registered: 950, capacity: 1200, venue: "Central Amphitheater" },
    { id: 3, title: "AI & Machine Learning Career Symposium", category: "Seminar", organizer: "IEEE Branch", status: "draft", registered: 45, capacity: 250, venue: "Engineering Hall 101" },
    { id: 4, title: "Campus Clean-up & Tree Planting Drive", category: "Volunteer Drive", organizer: "Youth Red Cross", status: "published", registered: 210, capacity: 300, venue: "Campus Grounds" },
  ]);

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState([
    { id: 101, title: "Inter-College E-Sports Championship", requester: "Gaming Club Council", type: "Event Proposal", submitted: "3 hours ago" },
    { id: 102, title: "Lead Volunteer Role Request", requester: "Ananya Rao", type: "Volunteer Promotion", submitted: "1 day ago" },
  ]);

  // System Audit Logs State
  const systemLogs = [
    { id: 1, type: "auth", message: "User Aarav Sharma authenticated via JWT Bearer", time: "10 mins ago", level: "info" },
    { id: 2, type: "event", message: "Event #1 'Spring Hackathon 2026' capacity updated to 500", time: "25 mins ago", level: "info" },
    { id: 3, type: "checkin", message: "Batch QR check-in recorded 120 attendees at Gate A Desk", time: "1 hour ago", level: "success" },
    { id: 4, type: "system", message: "Scheduled database backup & memory store sync completed", time: "3 hours ago", level: "system" },
  ];

  // Handle Role Change
  const handleRoleChange = (userId: number, newRole: string) => {
    setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({
      title: "Role Updated",
      description: `User role changed to ${newRole.toUpperCase()}.`,
    });
  };

  // Handle Event Status Change
  const handleEventStatusToggle = (eventId: number) => {
    setEventsList(eventsList.map(ev => {
      if (ev.id === eventId) {
        const newStatus = ev.status === "published" ? "draft" : "published";
        toast({ title: "Event Status Updated", description: `Event is now ${newStatus}.` });
        return { ...ev, status: newStatus };
      }
      return ev;
    }));
  };

  // Handle Request Approval
  const handleApproveRequest = (reqId: number) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== reqId));
    toast({ title: "✅ Request Approved", description: "The pending proposal has been approved." });
  };

  // Export Executive Summary CSV
  const exportExecutiveReportCsv = () => {
    const headers = ["Metric", "Value", "Notes"];
    const rows = [
      ["Total Campus Events", "42", "Published & Draft"],
      ["Total Users Registered", "15,480", "Students & Staff"],
      ["Total Revenue / Grants Raised", "$24,500", "Sponsorship & Fees"],
      ["Total QR Check-ins Recorded", "12,850", "99.9% Scan Accuracy"],
      ["Average Attendance Rate", "88.4%", "Campus Benchmark"],
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

  const filteredUsers = usersList.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredEvents = eventsList.filter(e => e.title.toLowerCase().includes(searchEvent.toLowerCase()) || e.organizer.toLowerCase().includes(searchEvent.toLowerCase()));

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
              Platform analytics, user moderation, role assignments, event moderation, budget ledger, and audit logs.
            </p>
          </div>

          <Button size="lg" onClick={exportExecutiveReportCsv} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg h-12 px-6 cursor-pointer">
            <Download className="w-5 h-5 mr-2" /> Export Executive CSV
          </Button>
        </div>

        {/* 1. STATISTICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Events</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">42</div>
              <span className="text-[10px] text-green-600 font-semibold">+6 this month</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Platform Users</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">15,480</div>
              <span className="text-[10px] text-primary font-semibold">Active Students</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue / Budget</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">$24,500</div>
              <span className="text-[10px] text-green-600 font-semibold">Sponsorship & Grants</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">12,850</div>
              <span className="text-[10px] text-purple-600 font-semibold">88.4% Attendance Rate</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-foreground">18,920</div>
              <span className="text-[10px] text-blue-600 font-semibold">Issued Ticket Passes</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-serif font-bold text-amber-600">{pendingRequests.length}</div>
              <span className="text-[10px] text-amber-600 font-semibold">Awaiting Approval</span>
            </CardContent>
          </Card>
        </div>

        {/* ADMIN TABS */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="rounded-xl font-bold text-xs px-4 py-2">
              <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics & Charts
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl font-bold text-xs px-4 py-2">
              <Users className="w-3.5 h-3.5 mr-2" /> User Management ({usersList.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl font-bold text-xs px-4 py-2">
              <Calendar className="w-3.5 h-3.5 mr-2" /> Event Moderation ({eventsList.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl font-bold text-xs px-4 py-2">
              <Clock className="w-3.5 h-3.5 mr-2 text-amber-500" /> Pending Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl font-bold text-xs px-4 py-2">
              <Server className="w-3.5 h-3.5 mr-2 text-blue-600" /> System Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ANALYTICS & CHARTS */}
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

            {/* Volunteer Hours & Revenue Trend Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Volunteer Hours Bar Chart */}
              <Card className="border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" /> Volunteer Service Hours by Dept (Bar Chart)
                  </CardTitle>
                  <CardDescription className="text-xs">Certified volunteer service hours completed</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[
                      { dept: "Computer Science", hours: 420 },
                      { dept: "Information Tech", hours: 350 },
                      { dept: "Electrical Eng", hours: 280 },
                      { dept: "Mechanical Eng", hours: 210 },
                      { dept: "Business Admin", hours: 190 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="hours" name="Service Hours" fill="#a855f7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Revenue Line Chart */}
              <Card className="border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" /> Platform Revenue & Sponsorship (Line Chart)
                  </CardTitle>
                  <CardDescription className="text-xs">Monthly ticket sales and sponsor grants ($)</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={[
                      { month: "Jan", revenue: 2500 },
                      { month: "Feb", revenue: 5800 },
                      { month: "Mar", revenue: 11200 },
                      { month: "Apr", revenue: 18500 },
                      { month: "May", revenue: 24500 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 2: USER MANAGEMENT */}
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

          {/* TAB 3: EVENT MODERATION */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-serif font-bold text-2xl text-foreground">Global Event Moderation</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search events or organizers..."
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold">{ev.category}</Badge>
                        <Badge className={ev.status === "published" ? "bg-green-600 text-white font-semibold text-[10px]" : "bg-amber-500 text-white text-[10px]"}>
                          {ev.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-foreground">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground">Organizer: <strong>{ev.organizer}</strong> • Venue: {ev.venue}</p>
                      <p className="text-xs text-foreground font-semibold pt-1">{ev.registered} / {ev.capacity} Registered</p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <Link href={`/events/${ev.id}`}>
                        <Button size="sm" variant="outline" className="text-xs font-semibold">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Event
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={ev.status === "published" ? "secondary" : "default"}
                        onClick={() => handleEventStatusToggle(ev.id)}
                        className="text-xs font-bold"
                      >
                        {ev.status === "published" ? "Save as Draft" : "Approve & Publish"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: PENDING REQUESTS */}
          <TabsContent value="requests" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Pending Approval Queue</h3>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <p className="text-sm text-muted-foreground">No pending requests awaiting administrator approval.</p>
                </Card>
              ) : (
                pendingRequests.map((req) => (
                  <Card key={req.id} className="p-6 border-border/60 shadow-xs flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Badge className="bg-amber-500 text-white font-bold text-[10px]">{req.type}</Badge>
                      <h4 className="font-serif font-bold text-lg text-foreground">{req.title}</h4>
                      <p className="text-xs text-muted-foreground">Submitted by <strong>{req.requester}</strong> • {req.submitted}</p>
                    </div>

                    <Button size="sm" onClick={() => handleApproveRequest(req.id)} className="font-bold text-xs bg-green-600 hover:bg-green-700 text-white shadow-2xs">
                      <Check className="w-3.5 h-3.5 mr-1" /> Approve Request
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 5: SYSTEM AUDIT LOGS */}
          <TabsContent value="logs" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">System Audit Logs</h3>
            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="divide-y divide-border font-mono text-xs">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary" />
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
    </DashboardLayout>
  );
}
