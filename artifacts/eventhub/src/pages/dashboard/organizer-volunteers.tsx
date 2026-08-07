import React, { useState } from "react";
import { Link, useParams } from "wouter";
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
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ClipboardCheck,
  Award,
  Trophy,
  MessageSquare,
  Plus,
  Send,
  Star,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  QrCode,
  Zap,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function OrganizerVolunteers() {
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const eventId = params.id ? parseInt(params.id, 10) : 1;

  // Active Tab State
  const [activeTab, setActiveTab] = useState("applications");

  // Applications State
  const [volunteers, setVolunteers] = useState([
    {
      id: 1,
      userId: 101,
      name: "Priya Patel",
      email: "priya@university.edu",
      rolePreference: "Ticket Desk & QR Scanner",
      status: "approved",
      appliedAt: "2 days ago",
      performanceScore: 98,
      rating: 4.9,
      hoursLogged: 28,
      badge: "🥇 Gold Volunteer",
      assignedTask: "Main Entrance Ticket Scanner Desk",
      station: "Gate A Desk 1",
      shiftStatus: "Completed",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    },
    {
      id: 2,
      userId: 102,
      name: "Rohan Gupta",
      email: "rohan@university.edu",
      rolePreference: "Stage Hospitality & VIP Escort",
      status: "pending",
      appliedAt: "5 hours ago",
      performanceScore: 92,
      rating: 4.7,
      hoursLogged: 16,
      badge: "🥈 Silver Volunteer",
      assignedTask: "Unassigned",
      station: "Pending Station",
      shiftStatus: "Pending Approval",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    },
    {
      id: 3,
      userId: 103,
      name: "Aarav Sharma",
      email: "aarav@university.edu",
      rolePreference: "Technical & Audio Booth Assistant",
      status: "approved",
      appliedAt: "4 days ago",
      performanceScore: 96,
      rating: 4.9,
      hoursLogged: 32,
      badge: "⭐ Star Contributor",
      assignedTask: "Stage Sound & Video Control",
      station: "Control Room 2",
      shiftStatus: "In Progress",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    },
  ]);

  // Modals State
  const [assignModalVol, setAssignModalVol] = useState<any | null>(null);
  const [taskTitle, setTaskTitle] = useState("Main Entrance Ticket Scanner Desk");
  const [taskStation, setTaskStation] = useState("Gate A Desk 1");

  // Messaging Modal State
  const [chatModalVol, setChatModalVol] = useState<any | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Organizer Helpdesk", text: "Welcome to the Spring Hackathon Volunteer Team! Please report to Gate A at 8:30 AM.", time: "9:00 AM", isOrg: true },
    { id: 2, sender: "Priya Patel", text: "Got it! QR scanner app is ready on my device.", time: "9:05 AM", isOrg: false },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Handle Accept / Reject
  const handleUpdateStatus = (id: number, newStatus: "approved" | "rejected") => {
    setVolunteers(volunteers.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast({
      title: newStatus === "approved" ? "✅ Application Approved!" : "❌ Application Declined",
      description: `Volunteer status updated to ${newStatus}.`,
    });
  };

  // Handle Assign Task Save
  const handleAssignTaskSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalVol) return;

    setVolunteers(volunteers.map(v => v.id === assignModalVol.id ? {
      ...v,
      assignedTask: taskTitle,
      station: taskStation,
      status: "approved",
      shiftStatus: "Assigned",
    } : v));

    toast({
      title: "📋 Task Assigned!",
      description: `Assigned "${taskTitle}" to ${assignModalVol.name}.`,
    });
    setAssignModalVol(null);
  };

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([...messages, {
      id: Date.now(),
      sender: "Organizer Helpdesk",
      text: newMessage,
      time: "Just now",
      isOrg: true,
    }]);
    setNewMessage("");
    toast({ title: "Message Sent", description: "Direct message delivered to volunteer." });
  };

  const pendingCount = volunteers.filter(v => v.status === "pending").length;
  const approvedCount = volunteers.filter(v => v.status === "approved").length;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
          <div>
            <Link href="/dashboard/organizer/events">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Events
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground">Volunteer Management & Task Assignment</h1>
            <p className="text-muted-foreground text-sm mt-1">Review applications, assign shift stations, track attendance, and communicate with team members.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setChatModalVol(volunteers[0])} className="font-bold text-xs shadow-2xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Team Announcement
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved Volunteers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active on shift roster</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Certified Hours</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">76 <span className="text-xs font-sans font-normal text-muted-foreground">hrs</span></div>
              <p className="text-xs text-muted-foreground mt-1">Total verified shift credits</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Reliability</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">96%</div>
              <p className="text-xs text-muted-foreground mt-1">4.8 / 5.0 Star Team Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* VOLUNTEER TABS */}
        <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="applications" className="rounded-xl font-bold text-xs px-4 py-2">
              <Users className="w-3.5 h-3.5 mr-2" /> Applications & Roster ({volunteers.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl font-bold text-xs px-4 py-2">
              <ClipboardCheck className="w-3.5 h-3.5 mr-2 text-primary" /> Shift & Station Assignments
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: APPLICATIONS & ROSTER */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Student Volunteer Applications</h3>
            </div>

            <div className="space-y-4">
              {volunteers.map((vol) => (
                <Card key={vol.id} className="p-6 border-border/60 shadow-xs hover:border-primary/40 transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* Left: Volunteer Info & Badges */}
                    <div className="flex items-center gap-4">
                      <img src={vol.avatar} alt={vol.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-2xs" />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-lg text-foreground">{vol.name}</h4>
                          <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-500/10 font-bold text-[10px]">
                            {vol.badge}
                          </Badge>
                          <Badge className={vol.status === "approved" ? "bg-green-600 text-white font-semibold text-[10px]" : vol.status === "rejected" ? "bg-destructive text-white text-[10px]" : "bg-amber-500 text-white text-[10px]"}>
                            {vol.status.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3">
                          <span>📧 {vol.email}</span>
                          <span>⭐ Rating: {vol.rating} / 5.0</span>
                          <span>⏱️ {vol.hoursLogged} Certified Hrs</span>
                        </p>

                        <p className="text-xs text-foreground/80 italic pt-1">
                          "{vol.rolePreference}"
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border">
                      {vol.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(vol.id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(vol.id, "rejected")}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </>
                      )}

                      {vol.status === "approved" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setAssignModalVol(vol)}
                            className="font-bold text-xs cursor-pointer"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 mr-1 text-primary" /> Assign Task
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setChatModalVol(vol)}
                            className="font-bold text-xs cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-600" /> Chat
                          </Button>
                        </>
                      )}
                    </div>

                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: SHIFT & STATION ASSIGNMENTS */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Shift & Station Roster</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {volunteers.filter(v => v.status === "approved").map((vol) => (
                <Card key={vol.id} className="p-6 border-l-4 border-l-primary border-border/60 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{vol.name}</span>
                      <h4 className="font-serif font-bold text-xl text-foreground mt-0.5">{vol.assignedTask}</h4>
                    </div>
                    <Badge className="bg-green-600 text-white font-semibold text-xs">
                      {vol.shiftStatus}
                    </Badge>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-2xl space-y-2 border border-border/50 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      Station: {vol.station}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      Shift Duration: 8:30 AM – 1:30 PM (5 Hours)
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Performance Score: <strong>{vol.performanceScore}%</strong></span>
                    <Button size="sm" variant="outline" onClick={() => setChatModalVol(vol)} className="text-xs font-semibold">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message Volunteer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* 3. ASSIGN TASK MODAL */}
      <Dialog open={!!assignModalVol} onOpenChange={() => setAssignModalVol(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl">Assign Volunteer Shift Station</DialogTitle>
            <DialogDescription className="text-xs">
              Assign a shift role and station to <strong>{assignModalVol?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignTaskSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Shift Task Role</Label>
              <Select value={taskTitle} onValueChange={setTaskTitle}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Entrance Ticket Scanner Desk">Main Entrance Ticket Scanner Desk</SelectItem>
                  <SelectItem value="VIP Escort & Guest Ushering">VIP Escort & Guest Ushering</SelectItem>
                  <SelectItem value="Stage Sound & Video Control Booth">Stage Sound & Video Control Booth</SelectItem>
                  <SelectItem value="Certificate & Information Desk">Certificate & Information Desk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Station Location</Label>
              <Input value={taskStation} onChange={(e) => setTaskStation(e.target.value)} className="h-11" placeholder="e.g. Gate A Desk 1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignModalVol(null)}>Cancel</Button>
              <Button type="submit" className="font-bold">Confirm & Assign Shift</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 10. IN-APP MESSAGING MODAL */}
      <Dialog open={!!chatModalVol} onOpenChange={() => setChatModalVol(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Volunteer Messaging Channel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Direct chat with <strong>{chatModalVol?.name || "Volunteer Team"}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 h-64 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.isOrg ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] space-y-1 ${m.isOrg ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card border border-border text-foreground rounded-bl-none"}`}>
                    <span className="font-bold text-[10px] opacity-80 block">{m.sender}</span>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-60 text-right block">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type shift instruction or message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-10 text-xs flex-1"
              />
              <Button type="submit" size="sm" className="font-bold px-4">
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
