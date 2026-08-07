import React, { useState } from "react";
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
  Star
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AttendeeDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetAttendeeDashboard();
  const { toast } = useToast();

  // State for Modals & Tabs
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQrTicket, setSelectedQrTicket] = useState<any | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || "Student Member");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+1 555-0199");
  const [profileDepartment, setProfileDepartment] = useState("Computer Science & Engineering");

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "QR Pass Ready",
      desc: "Your ticket QR code for Spring Hackathon 2026 is active.",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      title: "Volunteer Shift Assigned",
      desc: "You have been assigned to Main Auditorium Ticket Desk on April 15.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
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
    { icon: <Ticket className="w-4 h-4 text-blue-600" />, title: "Registered for Spring Hackathon 2026", time: "Today at 2:30 PM" },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, title: "Checked in at AI Symposium", time: "Yesterday at 10:15 AM" },
    { icon: <Award className="w-4 h-4 text-amber-500" />, title: "Earned 6 Verified Volunteer Hours", time: "3 days ago" },
    { icon: <ShieldCheck className="w-4 h-4 text-purple-600" />, title: "University Email Account Verified", time: "1 week ago" },
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
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Email Verified
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

        {/* 11. QUICK ACTIONS BAR */}
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
              <Activity className="w-3.5 h-3.5 mr-2" /> Dashboard Overview
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl font-bold text-xs px-4 py-2">
              <Ticket className="w-3.5 h-3.5 mr-2" /> Upcoming Events ({data?.upcomingEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl font-bold text-xs px-4 py-2">
              <Clock className="w-3.5 h-3.5 mr-2" /> Event History
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2" /> Certificates ({certificates.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl font-bold text-xs px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Volunteer Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Top 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Card 1: Total Registrations */}
              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Registrations</CardTitle>
                  <Ticket className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">{data?.totalRegistrations || 3}</div>
                  <p className="text-xs text-muted-foreground mt-1">Confirmed event tickets</p>
                </CardContent>
              </Card>

              {/* Card 8: Volunteer Hours */}
              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volunteer Hours</CardTitle>
                  <Award className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">28 / 40 <span className="text-xs font-sans font-normal text-muted-foreground">hrs</span></div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-amber-500 rounded-full w-[70%]" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 6: Notifications */}
              <Card className="border-border/60 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alerts & Messages</CardTitle>
                  <Bell className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">{unreadCount} <span className="text-xs font-sans font-normal text-muted-foreground">unread</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Live campus notifications</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: 2. Upcoming Events Preview & 5. QR Codes */}
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
                ) : data?.upcomingEvents?.length === 0 ? (
                  <EmptyState
                    icon={Ticket}
                    title="No Active Ticket Passes Found"
                    description="You haven't registered for any campus events yet. Explore upcoming hackathons, workshops, and cultural summits to get your instant QR ticket pass."
                    primaryActionLabel="Explore Campus Events"
                    primaryActionHref="/events"
                    secondaryActionLabel="Browse All Categories"
                    secondaryActionHref="/events"
                  />
                ) : (
                  <div className="space-y-4">
                    {data?.upcomingEvents?.slice(0, 2).map((reg: any) => (
                      <Card key={reg.id} className="overflow-hidden border-border/60 hover:border-primary/40 transition-all shadow-2xs">
                        <div className="flex flex-col sm:flex-row">
                          {/* QR Code Pass Box */}
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

                          {/* Event Info */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-primary/10 text-primary border-0 font-medium text-[11px]">
                                  {reg.event?.category || "Campus Event"}
                                </Badge>
                                <Badge className="bg-green-600 text-white font-semibold text-[10px]">
                                  Confirmed Ticket
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
                                  <span>{reg.event?.venue}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Presenter: University Student Council</span>
                              <Link href={`/events/${reg.eventId}`}>
                                <Button size="sm" variant="outline" className="text-xs font-semibold">
                                  Event Page →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: 6. Notifications & 10. Recent Activity */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 6. Live Notifications */}
                <Card className="border-border/60 shadow-2xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" /> Notifications
                      </CardTitle>
                      <CardDescription className="text-xs">Live updates & shift reminders</CardDescription>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-[11px] text-primary font-semibold hover:underline">
                        Mark read
                      </button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${n.read ? "bg-card border-border/40" : "bg-primary/5 border-primary/20"}`}>
                        <div className="flex items-center justify-between font-semibold text-foreground">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">{n.time}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 10. Recent Activity Feed */}
                <Card className="border-border/60 shadow-2xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {recentActivities.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                        <div className="p-1.5 bg-muted rounded-lg shrink-0 mt-0.5">{act.icon}</div>
                        <div>
                          <p className="font-semibold text-foreground leading-snug">{act.title}</p>
                          <span className="text-[10px] text-muted-foreground">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          {/* TAB 2: UPCOMING EVENTS */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">My Upcoming Event Passes</h3>
              <Link href="/">
                <Button size="sm" className="font-semibold text-xs">
                  <Search className="w-3.5 h-3.5 mr-1" /> Discover More Events
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.upcomingEvents?.map((reg: any) => (
                <Card key={reg.id} className="p-6 border-border/60 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-primary/10 text-primary border-0 font-medium text-xs">
                      {reg.event?.category}
                    </Badge>
                    <Badge className="bg-green-600 text-white font-semibold text-xs">
                      Confirmed Pass
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-xl text-foreground">{reg.event?.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {reg.event?.venue}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-2xl flex items-center justify-between border border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Ticket Token</span>
                      <code className="font-mono text-sm font-bold text-primary">{reg.qrToken}</code>
                    </div>
                    <Button size="sm" onClick={() => setSelectedQrTicket(reg)} className="font-semibold text-xs">
                      <QrCode className="w-3.5 h-3.5 mr-1" /> Show QR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: PAST EVENTS */}
          <TabsContent value="past" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Event Attendance History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.pastEvents?.map((reg: any) => (
                <Card key={reg.id} className="p-5 border-border/60 shadow-xs space-y-3">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {reg.event?.category}
                  </Badge>
                  <h4 className="font-serif font-bold text-base text-foreground">{reg.event?.title}</h4>
                  <p className="text-xs text-muted-foreground">Attended on {format(new Date(reg.event?.startTime || Date.now()), "MMMM d, yyyy")}</p>
                  
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <Badge className="bg-green-600 text-white font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Checked In
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedCertificate(certificates[0])}
                      className="text-xs font-bold text-primary"
                    >
                      <Award className="w-3.5 h-3.5 mr-1" /> View Certificate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: CERTIFICATES MODULE */}
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

          {/* TAB 5: LEADERBOARD MODULE */}
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

      {/* 1. EDIT PROFILE MODAL */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl">Edit Student Profile</DialogTitle>
            <DialogDescription className="text-xs">Update your verified campus contact details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProfileSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department / Major</Label>
              <Input value={profileDepartment} onChange={(e) => setProfileDepartment(e.target.value)} className="h-10" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProfileModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. QR CODE TICKET PASS MODAL */}
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

      {/* 4. PRINTABLE CERTIFICATE MODAL */}
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

    </DashboardLayout>
  );
}
