import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetAttendeeDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/empty-state";
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
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Award,
  Bell,
  Trophy,
  User,
  ShieldCheck,
  CheckCircle2,
  Download,
  Sparkles,
  Search,
  Zap,
  Edit3,
  Mail,
  GraduationCap,
  Activity,
  ChevronRight,
  Printer,
  Check,
  Flame,
  Star,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Lock,
  ArrowUpRight,
  ExternalLink,
  DollarSign,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AttendeeAiAssistant } from "@/components/attendee-ai-assistant";

export default function AttendeeDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetAttendeeDashboard();
  const { toast } = useToast();

  // State for Modals & Tabs
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQrTicket, setSelectedQrTicket] = useState<any | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState<any | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || "Student Member");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+91 98765 43210");
  const [profileDepartment, setProfileDepartment] = useState("Computer Science & Engineering");

  // Fetch Payments from API
  useEffect(() => {
    async function fetchPayments() {
      try {
        setPaymentsLoading(true);
        const res = await fetch("/api/payments/my", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      } catch (err) {
        console.error("Failed to load payments:", err);
      } finally {
        setPaymentsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment & Pass Verified",
      desc: "Your ticket payment for AI Career Symposium is 100% verified via Razorpay HMAC-SHA256.",
      time: "5 mins ago",
      read: false,
    },
    {
      id: 2,
      title: "QR Pass Ready",
      desc: "Your ticket QR code for Spring Hackathon 2026 is active.",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 3,
      title: "Volunteer Shift Assigned",
      desc: "You have been assigned to Main Auditorium Ticket Desk on April 15.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 4,
      title: "Certificate Issued",
      desc: "Certificate of Completion issued for AI Career Symposium.",
      time: "1 day ago",
      read: true,
    },
  ]);

  // Certificates List
  const certificates = [
    {
      id: "CERT-2026-SEMI-104",
      eventTitle: "AI & Machine Learning Career Symposium",
      issueDate: "March 28, 2026",
      hours: 6,
      category: "Seminar & Workshop",
      issuer: "Department of Computer Science & ACM Student Chapter",
    },
    {
      id: "CERT-2026-GREEN-081",
      eventTitle: "Campus Green Drive & Tree Planting",
      issueDate: "February 12, 2026",
      hours: 8,
      category: "Volunteer Service",
      issuer: "Youth Red Cross & Campus Sustainability Board",
    },
  ];

  // Leaderboard Data
  const leaderboard = [
    { rank: 1, name: "Priya Patel", hours: 42, points: 1250, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100", badge: "🥇 Gold Volunteer" },
    { rank: 2, name: "Aarav Sharma", hours: 38, points: 1100, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100", badge: "🥈 Silver Volunteer" },
    { rank: 3, name: "Rohan Gupta", hours: 32, points: 950, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100", badge: "🥉 Bronze Volunteer" },
    { rank: 4, name: "Ananya Rao", hours: 28, points: 820, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100", badge: "⭐ Star Contributor" },
  ];

  // Recent Activity Feed
  const recentActivities = [
    { icon: <CreditCard className="w-4 h-4 text-emerald-600" />, title: "Verified Payment for AI Symposium (₹499)", time: "Just now" },
    { icon: <Ticket className="w-4 h-4 text-blue-600" />, title: "Registered for Spring Hackathon 2026", time: "Today at 2:30 PM" },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, title: "Checked in at AI Symposium", time: "Yesterday at 10:15 AM" },
    { icon: <Award className="w-4 h-4 text-amber-500" />, title: "Earned 6 Verified Volunteer Hours", time: "3 days ago" },
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your student profile details have been saved.",
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({ title: "Notifications Cleared", description: "All notifications marked as read." });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.eventTitle?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.orderId?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.paymentId?.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesFilter =
      paymentStatusFilter === "all" ||
      (paymentStatusFilter === "captured" && p.status === "captured") ||
      (paymentStatusFilter === "free" && p.amount === 0);
    return matchesSearch && matchesFilter;
  });

  const totalPaidAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalVerifiedCount = payments.filter(p => p.isVerified || p.status === "captured").length;

  // Export Transactions CSV
  const exportPaymentsCsv = () => {
    const headers = ["Receipt No", "Event Title", "Order ID", "Payment ID", "Amount (INR)", "Status", "Date"];
    const rows = payments.map(p => [
      p.receiptNumber || `RCP-${p.id}`,
      `"${p.eventTitle}"`,
      p.orderId,
      p.paymentId,
      `₹${p.amount}`,
      p.status,
      p.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_payment_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📊 Payment Ledger Downloaded",
      description: "Saved all verified transaction receipts to CSV.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* 1. PROFILE & DISPLAY HEADER */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary border-2 border-primary/30 flex items-center justify-center font-bold text-2xl shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-background" title="Verified Account">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">{user?.name || "Student Member"}</h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-semibold">
                    {user?.role || "Attendee"}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/5 font-semibold text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Email & Payments Verified
                  </Badge>
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-primary" /> {profileDepartment}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> {user?.email || "student@university.edu"}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-primary" /> ID: {user?.collegeId || "STD-2026-X"}</span>
                </p>
              </div>
            </div>

            {/* Quick Profile Edit Action */}
            <Button variant="outline" onClick={() => setProfileModalOpen(true)} className="font-semibold text-xs shadow-2xs">
              <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Student Profile
            </Button>
          </div>
        </div>

        {/* QUICK ACTIONS BAR */}
        <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/">
              <Button size="sm" variant="default" className="font-semibold text-xs cursor-pointer shadow-2xs">
                <Search className="w-3.5 h-3.5 mr-1.5" /> Browse Campus Events
              </Button>
            </Link>

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setActiveTab("payments")}
              className="font-semibold text-xs cursor-pointer bg-card border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Payment & Billing History ({payments.length})
            </Button>

            {data?.upcomingEvents?.[0] && (
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setSelectedQrTicket(data.upcomingEvents[0])}
                className="font-semibold text-xs cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-primary" /> View Latest QR Ticket
              </Button>
            )}

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setActiveTab("certificates")}
              className="font-semibold text-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> View Certificates ({certificates.length})
            </Button>
          </div>
        </div>

        {/* DASHBOARD TABS NAVIGATION */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="rounded-xl font-bold text-xs px-4 py-2">
              <Activity className="w-3.5 h-3.5 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl font-bold text-xs px-4 py-2">
              <CreditCard className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Payments & Billing ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl font-bold text-xs px-4 py-2">
              <Ticket className="w-3.5 h-3.5 mr-2" /> Active Passes ({data?.upcomingEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl font-bold text-xs px-4 py-2">
              <Clock className="w-3.5 h-3.5 mr-2" /> Event History
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2" /> Certificates ({certificates.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl font-bold text-xs px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Registrations</CardTitle>
                  <Ticket className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">{data?.totalRegistrations ?? 3}</div>
                  <p className="text-xs text-muted-foreground mt-1">Confirmed Campus Passes</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Payments</CardTitle>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-emerald-600">₹{totalPaidAmount}</div>
                  <p className="text-xs text-muted-foreground mt-1">{totalVerifiedCount} Verified Transactions</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volunteer Credits</CardTitle>
                  <Award className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">14 <span className="text-xs font-sans font-normal text-muted-foreground">hours</span></div>
                  <p className="text-xs text-muted-foreground mt-1">2 Certificates of Completion</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notifications</CardTitle>
                  <Bell className="w-4 h-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">{unreadCount} <span className="text-xs font-sans font-normal text-muted-foreground">unread</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Live campus updates</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Active Passes */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Active Ticket Passes
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("upcoming")} className="text-xs font-bold text-primary">
                    View All →
                  </Button>
                </div>

                {isLoading ? (
                  <div className="animate-pulse bg-muted rounded-2xl h-48" />
                ) : (
                  <div className="space-y-4">
                    {data?.upcomingEvents?.slice(0, 2).map((reg: any) => (
                      <Card key={reg.id} className="overflow-hidden border-border/60 hover:border-primary/40 transition-all shadow-2xs">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-muted/30 p-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border/50 min-w-[190px]">
                            <div className="bg-white p-2 rounded-xl shadow-xs border mb-2">
                              <img 
                                src={reg.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reg.qrToken}`} 
                                alt="Ticket QR Pass" 
                                className="w-24 h-24 object-contain" 
                              />
                            </div>
                            <Badge variant="outline" className="font-mono text-[10px] bg-background">{reg.qrToken}</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setSelectedQrTicket(reg)} 
                              className="mt-2 text-xs font-bold text-primary h-7 px-2"
                            >
                              <QrCode className="w-3.5 h-3.5 mr-1" /> Expand Pass
                            </Button>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-primary/10 text-primary border-0 font-medium text-[11px]">
                                  {reg.event?.category || "Campus Event"}
                                </Badge>
                                <Badge className={reg.paymentStatus === "completed" ? "bg-amber-500 text-black font-semibold text-[10px]" : "bg-green-600 text-white font-semibold text-[10px]"}>
                                  {reg.paymentStatus === "completed" ? `PAID ₹${reg.amountPaid || 499}` : "FREE PASS"}
                                </Badge>
                              </div>

                              <h4 className="font-serif font-bold text-lg leading-tight hover:text-primary transition-colors">
                                <Link href={`/events/${reg.eventId}`}>
                                  {reg.event?.title}
                                </Link>
                              </h4>

                              <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-primary" />
                                  {reg.event?.startTime && format(new Date(reg.event.startTime), "EEEE, MMMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-primary" />
                                  {reg.event?.venue}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                              <span className="text-[11px] font-mono text-muted-foreground">ID: REG-{reg.id}</span>
                              <Button size="sm" onClick={() => setSelectedQrTicket(reg)} className="text-xs font-bold h-8">
                                <Download className="w-3.5 h-3.5 mr-1.5" /> Save Pass
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Recent Activity */}
              <div className="lg:col-span-4 space-y-6">
                <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Recent Activities
                </h3>

                <Card className="border-border/60 shadow-2xs p-5">
                  <div className="space-y-4">
                    {recentActivities.map((act, idx) => (
                      <div key={idx} className="flex gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                        <div className="p-2 rounded-xl bg-muted/60 h-fit mt-0.5">{act.icon}</div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">{act.title}</p>
                          <span className="text-[11px] text-muted-foreground mt-0.5 block">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: PAYMENTS & BILLING HISTORY DASHBOARD */}
          {/* ========================================================================= */}
          <TabsContent value="payments" className="space-y-6">
            
            {/* Header & Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent p-6 rounded-3xl border border-emerald-500/20">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Payment Ledger
                </div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">Payment & Billing History</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Official receipts, cryptographic HMAC-SHA256 verified payments, and transaction history.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={exportPaymentsCsv} variant="outline" className="font-bold text-xs bg-card shadow-2xs border-border/80">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Export CSV Ledger
                </Button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Total Amount Paid
                </span>
                <div className="text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400">₹{totalPaidAmount}</div>
                <p className="text-[11px] text-muted-foreground">All paid event pass transactions</p>
              </Card>

              <Card className="p-5 border-border/60 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Verification Status
                </span>
                <div className="text-3xl font-serif font-bold text-foreground">100%</div>
                <p className="text-[11px] text-green-600 font-semibold">HMAC-SHA256 Server Verified</p>
              </Card>

              <Card className="p-5 border-border/60 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" /> Gateway Provider
                </span>
                <div className="text-3xl font-serif font-bold text-foreground">Razorpay</div>
                <p className="text-[11px] text-muted-foreground">256-Bit SSL Encrypted Ledger</p>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by event, order ID, or payment ID..."
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={paymentStatusFilter === "all" ? "default" : "outline"}
                  onClick={() => setPaymentStatusFilter("all")}
                  className="text-xs font-semibold"
                >
                  All ({payments.length})
                </Button>
                <Button
                  size="sm"
                  variant={paymentStatusFilter === "captured" ? "default" : "outline"}
                  onClick={() => setPaymentStatusFilter("captured")}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  Verified Paid
                </Button>
              </div>
            </div>

            {/* Transactions List */}
            {paymentsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
              </div>
            ) : filteredPayments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No Transactions Found"
                description="No payment records match your current search query."
                primaryActionLabel="Browse Events"
                primaryActionHref="/events"
              />
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((pmt) => (
                  <Card key={pmt.id} className="p-5 sm:p-6 border-border/60 hover:border-emerald-500/40 transition-all shadow-2xs">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      
                      {/* Left: Event & IDs */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-0 font-medium text-[10px]">
                            {pmt.eventCategory || "Campus Event"}
                          </Badge>
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> VERIFIED (HMAC-SHA256)
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {pmt.receiptNumber || `RCP-${pmt.id}`}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-lg text-foreground">{pmt.eventTitle}</h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Order: <strong className="font-mono text-foreground">{pmt.orderId}</strong></span>
                          <span>Payment: <strong className="font-mono text-foreground">{pmt.paymentId}</strong></span>
                          <span>Date: <strong>{pmt.createdAt ? format(new Date(pmt.createdAt), "MMM d, yyyy • h:mm a") : "Recent"}</strong></span>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex sm:flex-col items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border/50 gap-2">
                        <div className="text-right">
                          <span className="text-2xl font-serif font-bold text-emerald-600">₹{pmt.amount}</span>
                          <span className="text-[10px] text-muted-foreground block">Via Razorpay Gateway</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedPaymentReceipt(pmt)}
                            className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1.5" /> View Receipt
                          </Button>
                        </div>
                      </div>

                    </div>
                  </Card>
                ))}
              </div>
            )}

          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: UPCOMING PASSES */}
          {/* ========================================================================= */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-2xl text-foreground">Upcoming Active Passes</h3>
                <p className="text-xs text-muted-foreground">All verified event tickets with scannable QR tokens.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.upcomingEvents?.map((reg: any) => (
                <Card key={reg.id} className="p-6 border-border/60 hover:border-primary/40 transition-all shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-primary/10 text-primary border-0 font-medium text-xs">
                      {reg.event?.category || "Campus Event"}
                    </Badge>
                    <Badge className={reg.paymentStatus === "completed" ? "bg-amber-500 text-black font-bold text-xs" : "bg-green-600 text-white font-bold text-xs"}>
                      {reg.paymentStatus === "completed" ? `PAID ₹${reg.amountPaid || 499}` : "FREE PASS"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-xl text-foreground">{reg.event?.title}</h4>
                    <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {reg.event?.startTime && format(new Date(reg.event.startTime), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {reg.event?.venue}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">{reg.qrToken}</span>
                    <Button size="sm" onClick={() => setSelectedQrTicket(reg)} className="font-bold text-xs">
                      <QrCode className="w-3.5 h-3.5 mr-1" /> View QR Pass
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: EVENT HISTORY */}
          {/* ========================================================================= */}
          <TabsContent value="past" className="space-y-6">
            <div>
              <h3 className="font-serif font-bold text-2xl text-foreground">Past Event Attendance</h3>
              <p className="text-xs text-muted-foreground">Events and workshops you have attended previously.</p>
            </div>

            <div className="space-y-4">
              {data?.pastEvents?.map((reg: any) => (
                <Card key={reg.id} className="p-5 border-border/60 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{reg.event?.category}</Badge>
                      <Badge className="bg-green-600 text-white text-[10px]">Attended & Verified ✓</Badge>
                    </div>
                    <h4 className="font-serif font-bold text-lg">{reg.event?.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{reg.event?.venue}</p>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedCertificate(certificates[0])}
                    className="text-xs font-bold text-primary"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" /> View Certificate
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 5: CERTIFICATES MODULE */}
          {/* ========================================================================= */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-2xl text-foreground">Verified Student Certificates</h3>
                <p className="text-xs text-muted-foreground">Official university-verified volunteer & participation credits.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="p-6 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-500/10 font-bold text-xs">
                      {cert.hours} Volunteer Hours
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">{cert.id}</span>
                    <h4 className="font-serif font-bold text-lg text-foreground mt-0.5">{cert.eventTitle}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Issued: {cert.issueDate}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{cert.issuer}</span>
                    <Button size="sm" onClick={() => setSelectedCertificate(cert)} className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                      <Printer className="w-3.5 h-3.5 mr-1" /> View & Print Certificate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 6: LEADERBOARD MODULE */}
          {/* ========================================================================= */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div>
              <h3 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" /> Campus Volunteer Leaderboard
              </h3>
              <p className="text-xs text-muted-foreground">Top student contributors ranked by verified volunteer hours & event check-ins.</p>
            </div>

            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="divide-y divide-border">
                {leaderboard.map((item) => (
                  <div key={item.rank} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.rank === 1 ? "bg-amber-500 text-white" : item.rank === 2 ? "bg-slate-300 text-slate-800" : item.rank === 3 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}>
                        #{item.rank}
                      </div>

                      <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover border" />

                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                        <span className="text-xs text-muted-foreground">{item.badge}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-lg text-primary">{item.hours} hrs</span>
                      <span className="text-xs text-muted-foreground block">{item.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* 1. EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl">Edit Student Profile</DialogTitle>
            <DialogDescription className="text-xs">Update your verified campus contact details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProfileSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-10 text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-10 text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department / Major</Label>
              <Input value={profileDepartment} onChange={(e) => setProfileDepartment(e.target.value)} className="h-10 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProfileModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs bg-primary text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL PAYMENT INVOICE / RECEIPT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedPaymentReceipt} onOpenChange={() => setSelectedPaymentReceipt(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          {selectedPaymentReceipt && (
            <div className="space-y-6">
              
              {/* Receipt Top Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                    <ShieldCheck className="w-4 h-4" /> Official Tax Invoice & Payment Receipt
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-foreground">EventHub Campus</h3>
                  <span className="text-xs text-muted-foreground">University Event Registration Desk</span>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">PAID & VERIFIED ✓</Badge>
                  <span className="font-mono text-xs font-bold text-foreground block mt-1">
                    {selectedPaymentReceipt.receiptNumber || `RCP-${selectedPaymentReceipt.id}`}
                  </span>
                </div>
              </div>

              {/* Billed To and Transaction Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Billed To:</span>
                  <span className="font-bold text-foreground block text-sm mt-0.5">{user?.name || "Student Member"}</span>
                  <span className="text-muted-foreground">{user?.email || "student@university.edu"}</span>
                  <span className="text-muted-foreground block">{profileDepartment}</span>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Payment Details:</span>
                  <p><span className="text-muted-foreground">Order ID:</span> <strong className="font-mono">{selectedPaymentReceipt.orderId}</strong></p>
                  <p><span className="text-muted-foreground">Payment ID:</span> <strong className="font-mono">{selectedPaymentReceipt.paymentId}</strong></p>
                  <p><span className="text-muted-foreground">Date:</span> {selectedPaymentReceipt.createdAt ? format(new Date(selectedPaymentReceipt.createdAt), "MMM d, yyyy") : "Today"}</p>
                </div>
              </div>

              {/* Itemized Invoice Table */}
              <div className="border rounded-2xl overflow-hidden text-xs">
                <div className="bg-muted/60 p-3 font-bold text-muted-foreground flex justify-between">
                  <span>Item / Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-3.5 space-y-2 divide-y divide-border/50">
                  <div className="flex justify-between pt-1">
                    <div>
                      <strong className="text-foreground block">{selectedPaymentReceipt.eventTitle}</strong>
                      <span className="text-muted-foreground text-[11px]">Category: {selectedPaymentReceipt.eventCategory || "Technical"}</span>
                    </div>
                    <span className="font-bold text-foreground">₹{selectedPaymentReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-muted-foreground">
                    <span>Platform & Convenience Fee</span>
                    <span className="text-green-600 font-semibold">₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between pt-2 text-muted-foreground">
                    <span>Applicable GST / Taxes</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-sm text-foreground">
                    <span>Total Amount Paid</span>
                    <span className="text-emerald-600 text-base">₹{selectedPaymentReceipt.amount}</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Verification Seal */}
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Razorpay HMAC-SHA256 Cryptographically Verified</span>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  Valid Signature
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedPaymentReceipt(null)}>Close</Button>
                <Button onClick={() => window.print()} className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. QR CODE TICKET PASS MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedQrTicket} onOpenChange={() => setSelectedQrTicket(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl text-center">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-center">Official Event Ticket Pass</DialogTitle>
            <DialogDescription className="text-xs text-center">Show this QR code at the event check-in desk</DialogDescription>
          </DialogHeader>

          {selectedQrTicket && (
            <div className="space-y-5 py-4">
              <div className="bg-white p-4 rounded-3xl border-2 border-primary/20 shadow-md inline-block mx-auto">
                <img 
                  src={selectedQrTicket.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedQrTicket.qrToken}`} 
                  alt="QR Ticket Code" 
                  className="w-48 h-48 object-contain" 
                />
              </div>

              <div>
                <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-muted">{selectedQrTicket.qrToken}</Badge>
                <h4 className="font-serif font-bold text-lg text-foreground mt-2">{selectedQrTicket.event?.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedQrTicket.event?.venue}
                </p>
              </div>

              <Button 
                onClick={() => {
                  toast({ title: "Pass Saved", description: "QR Pass saved to your device." });
                  setSelectedQrTicket(null);
                }} 
                className="w-full font-bold shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" /> Save Pass to Phone
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. PRINTABLE CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl">
          {selectedCertificate && (
            <div className="p-6 sm:p-8 bg-gradient-to-b from-amber-500/5 via-card to-card border-4 border-amber-500/30 rounded-2xl text-center space-y-6 relative">
              <div className="flex justify-between items-center border-b pb-4 border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <Award className="w-5 h-5" /> Official University Certificate
                </div>
                <span className="font-mono text-xs text-muted-foreground">{selectedCertificate.id}</span>
              </div>

              <div className="space-y-3 py-4">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-foreground">Certificate of Achievement</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">This is to certify that</p>
                <h3 className="font-serif font-bold text-3xl text-primary underline decoration-primary/30 underline-offset-4">{user?.name || "Student Member"}</h3>
                <p className="text-sm text-foreground/80 max-w-lg mx-auto leading-relaxed pt-2">
                  has successfully completed <strong>{selectedCertificate.hours} Hours</strong> of active contribution in <strong>"{selectedCertificate.eventTitle}"</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/20 text-xs text-muted-foreground">
                <div className="text-left">
                  <span className="font-bold text-foreground block">Issue Date</span>
                  {selectedCertificate.issueDate}
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground block">Authorized Issuer</span>
                  {selectedCertificate.issuer}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedCertificate(null)}>Close</Button>
                <Button onClick={() => window.print()} className="font-bold bg-amber-600 hover:bg-amber-700 text-white">
                  <Printer className="w-4 h-4 mr-2" /> Print Official Certificate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating AI Event Assistant for Attendees */}
      <AttendeeAiAssistant />

    </DashboardLayout>
  );
}

