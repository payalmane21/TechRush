import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetEventAnalytics, useGetEvent } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, CheckCheck, Clock, TrendingUp, ArrowLeft, BarChart3,
  DollarSign, Star, Download, Printer, PieChart as PieIcon,
  Flame, Award, ShieldCheck, FileSpreadsheet, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export default function EventAnalytics() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id ?? "1", 10);
  const { toast } = useToast();

  const { data: event } = useGetEvent(eventId);
  const { data: analytics, isLoading } = useGetEventAnalytics(eventId);

  const [activeTab, setActiveTab] = useState("overview");

  // Analytics Metrics State
  const totalReg = analytics?.totalRegistered || 380;
  const totalChecked = analytics?.totalCheckedIn || 120;
  const checkinPct = totalReg > 0 ? Math.round((totalChecked / totalReg) * 100) : 31;
  const totalRevenue = 24500;
  const ratingAvg = 4.9;

  // Chart Data
  const regTrendData = [
    { date: "Day 1", registrations: 45, checkins: 40 },
    { date: "Day 2", registrations: 90, checkins: 85 },
    { date: "Day 3", registrations: 180, checkins: 160 },
    { date: "Day 4", registrations: 290, checkins: 260 },
    { date: "Day 5", registrations: 380, checkins: 320 },
  ];

  const demographicsData = [
    { name: "Computer Science", value: 42 },
    { name: "Electrical Eng", value: 24 },
    { name: "Business Admin", value: 18 },
    { name: "Arts & Sports", value: 16 },
  ];

  const volunteerPerfData = [
    { volunteer: "Priya Patel", hours: 28, score: 98, tasks: "12 / 12" },
    { volunteer: "Aarav Sharma", hours: 32, score: 95, tasks: "15 / 15" },
    { volunteer: "Rohan Gupta", hours: 16, score: 92, tasks: "8 / 10" },
    { volunteer: "Ananya Rao", hours: 24, score: 96, tasks: "11 / 11" },
  ];

  // Peak Check-in Heatmap Data (24h)
  const heatmapHours = [
    { hour: "8 AM", intensity: 1, label: "Low Traffic" },
    { hour: "9 AM", intensity: 4, label: "Peak Entry" },
    { hour: "10 AM", intensity: 5, label: "Maximum Volume" },
    { hour: "11 AM", intensity: 3, label: "Moderate" },
    { hour: "12 PM", intensity: 2, label: "Lunch Break" },
    { hour: "1 PM", intensity: 3, label: "Midday Session" },
    { hour: "2 PM", intensity: 4, label: "Afternoon Workshop" },
    { hour: "3 PM", intensity: 2, label: "Closing Ceremony" },
  ];

  // Feedback Reviews
  const feedbackReviews = [
    { id: 1, student: "Rohan Gupta", rating: 5, comment: "Incredible hackathon setup! QR ticket scan at Gate A took under 3 seconds.", time: "2 hours ago" },
    { id: 2, student: "Priya Patel", rating: 5, comment: "Top-notch technical audio crew and seamless certificate issuing.", time: "4 hours ago" },
    { id: 3, student: "Aarav Sharma", rating: 4.8, comment: "Well-organized volunteer station layout and high energy crowd.", time: "1 day ago" },
  ];

  // 1-Click Export Excel CSV
  const exportExcelReport = () => {
    const headers = ["Metric", "Value", "Category"];
    const rows = [
      ["Total Registrations", totalReg.toString(), "Attendee Metrics"],
      ["Total Checked In", totalChecked.toString(), "Attendance"],
      ["Attendance Rate", `${checkinPct}%`, "Attendance"],
      ["Total Revenue Raised", `$${totalRevenue.toLocaleString()}`, "Financials"],
      ["Average Student Rating", `${ratingAvg} / 5.0`, "Satisfaction"],
      ["Volunteer Shift Completion Rate", "96%", "Operations"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_analytics_report_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📊 Excel (CSV) Report Exported!",
      description: "Downloaded complete event analytics dataset.",
    });
  };

  // 1-Click Export PDF
  const exportPdfReport = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12 print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6 print:hidden">
          <div>
            <Link href="/dashboard/organizer/events">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Events
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              {event?.title ?? "Event Analytics & Intelligence Suite"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Registration velocity, attendance check-in rate, volunteer performance, revenue, demographics, and student feedback.</p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" onClick={exportExcelReport} className="font-bold text-xs shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-green-600" /> Export Excel (CSV)
            </Button>
            <Button size="sm" onClick={exportPdfReport} className="font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Export PDF Report
            </Button>
          </div>
        </div>

        {/* TOP KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-foreground">{totalReg}</div>
              <span className="text-xs text-blue-600 font-semibold">+18% vs target</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attendance %</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-green-600">{checkinPct}%</div>
              <span className="text-xs text-muted-foreground">{totalChecked} Scanned</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Revenue & Grants</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
              <span className="text-xs text-green-600 font-semibold">100% Budget Funded</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volunteer Score</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-purple-600">96%</div>
              <span className="text-xs text-muted-foreground">100 Certified Hours</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feedback Rating</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-amber-500 flex items-center gap-1">
                {ratingAvg} <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">98% Positive Reviews</span>
            </CardContent>
          </Card>
        </div>

        {/* ANALYTICS TABS */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap print:hidden">
            <TabsTrigger value="overview" className="rounded-xl font-bold text-xs px-4 py-2">
              <TrendingUp className="w-3.5 h-3.5 mr-2" /> Registration & Attendance Trends
            </TabsTrigger>
            <TabsTrigger value="demographics" className="rounded-xl font-bold text-xs px-4 py-2">
              <PieIcon className="w-3.5 h-3.5 mr-2" /> Demographics & Breakdown
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2 text-purple-600" /> Volunteer Performance
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="rounded-xl font-bold text-xs px-4 py-2">
              <Flame className="w-3.5 h-3.5 mr-2 text-amber-500" /> Peak Hour Heatmap
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-bold text-xs px-4 py-2">
              <Star className="w-3.5 h-3.5 mr-2 text-amber-500" /> Student Feedback ({feedbackReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: REGISTRATION & ATTENDANCE TRENDS */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Registration Velocity vs Ticket Check-ins
                </CardTitle>
                <CardDescription className="text-xs">Cumulative ticket passes issued and verified gate scans</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={regTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="checkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="registrations" name="Pass Registrations" stroke="#6366f1" fill="url(#regGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="checkins" name="Verified Check-ins" stroke="#22c55e" fill="url(#checkGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: DEMOGRAPHICS & PIE CHARTS */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-primary" /> Department Demographics Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">Student enrollment share by academic department</CardDescription>
                </CardHeader>

                <CardContent className="p-0 pt-2">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={demographicsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demographicsData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Financials & Revenue Ledger */}
              <Card className="border-border/60 shadow-xs p-6 space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" /> Revenue & Budget Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">Sponsorship funds, ticket fees, and venue budget</CardDescription>
                </CardHeader>

                <CardContent className="p-0 pt-2 space-y-3">
                  {[
                    { label: "Corporate Sponsorship Grants", amount: "$15,000", pct: 61, color: "bg-green-600" },
                    { label: "Student Ticket Passes", amount: "$6,500", pct: 27, color: "bg-primary" },
                    { label: "University Innovation Grant", amount: "$3,000", pct: 12, color: "bg-purple-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-muted/40 rounded-2xl border border-border/50 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-foreground">
                        <span>{item.label}</span>
                        <span>{item.amount} ({item.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: VOLUNTEER PERFORMANCE */}
          <TabsContent value="volunteers" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Volunteer Shift & Reliability Performance</h3>
            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="divide-y divide-border">
                {volunteerPerfData.map((v, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground">{v.volunteer}</h4>
                      <p className="text-xs text-muted-foreground">Certified Hours: <strong>{v.hours} hrs</strong> • Tasks Completed: {v.tasks}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <Badge className="bg-purple-600 text-white font-bold text-xs">
                        {v.score}% Reliability Rating
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PEAK HOUR HEATMAP GRID */}
          <TabsContent value="heatmap" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" /> Hourly Check-in Density Heatmap
                </CardTitle>
                <CardDescription className="text-xs">Peak attendee arrival times for scanner station staffing</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {heatmapHours.map((h, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                        h.intensity >= 4
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold"
                          : "bg-muted/40 border-border/50 text-foreground"
                      }`}
                    >
                      <span className="text-xs font-mono block text-muted-foreground">{h.hour}</span>
                      <span className="text-lg font-serif font-bold block">{h.intensity * 24} scans</span>
                      <span className="text-[9px] block opacity-80">{h.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: STUDENT FEEDBACK & REVIEWS */}
          <TabsContent value="feedback" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Verified Student Feedback & Ratings</h3>
            <div className="space-y-4">
              {feedbackReviews.map((fb) => (
                <Card key={fb.id} className="p-6 border-border/60 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-foreground">{fb.student}</h4>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      {fb.rating} <Star className="w-4 h-4 fill-amber-500 text-amber-500 ml-1" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"{fb.comment}"</p>
                  <span className="text-[10px] text-muted-foreground block text-right">{fb.time}</span>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </DashboardLayout>
  );
}
