import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Pencil, Trash2, Eye, Copy, Search, CheckCircle2, Sparkles, Filter,
  ShieldCheck, Clock, Send, AlertTriangle, Check, RotateCcw, XCircle,
  Award, FileText, CheckCheck, UserCheck, RefreshCw, Layers
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";

export default function OrganizerEvents() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Rejection Reason Modal State
  const [viewingFeedbackEvent, setViewingFeedbackEvent] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Volunteer Recruitment Modal State
  const [volDeskEvent, setVolDeskEvent] = useState<any | null>(null);
  const [volDeskTab, setVolDeskTab] = useState("candidates");
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [runningAiMatching, setRunningAiMatching] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  // Add Requirement Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newReqSkills, setNewReqSkills] = useState("");
  const [newPrefSkills, setNewPrefSkills] = useState("");
  const [newResponsibilities, setNewResponsibilities] = useState("");
  const [newNumberRequired, setNewNumberRequired] = useState(2);
  const [addingRequirement, setAddingRequirement] = useState(false);

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events/my", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load organizer events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Realtime Socket.IO Listeners
    if (socket) {
      const handleSync = () => {
        loadEvents();
      };
      socket.on("event_approved", (payload) => {
        loadEvents();
        toast({
          title: "🎉 Event Approved!",
          description: `"${payload.title}" has been approved by admin. You can now publish it!`,
        });
      });
      socket.on("event_rejected", (payload) => {
        loadEvents();
        toast({
          title: "⚠️ Event Revision Requested",
          description: `Admin reviewed "${payload.title}": ${payload.rejectionReason}`,
          variant: "destructive",
        });
      });
      socket.on("event_changed", handleSync);
      socket.on("volunteer_applied", () => {
        if (volDeskEvent) loadVolunteerDeskData(volDeskEvent.id);
      });
      socket.on("volunteer_recommendations_ready", () => {
        if (volDeskEvent) loadVolunteerDeskData(volDeskEvent.id);
      });

      return () => {
        socket.off("event_approved");
        socket.off("event_rejected");
        socket.off("event_changed", handleSync);
        socket.off("volunteer_applied");
        socket.off("volunteer_recommendations_ready");
      };
    }
  }, [volDeskEvent]);

  // Submit for Approval Action
  const handleSubmitForApproval = async (eventId: number, title: string) => {
    try {
      setActionLoadingId(eventId);
      const res = await fetch(`/api/events/${eventId}/submit-approval`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });

      if (res.ok) {
        toast({
          title: "✅ Submitted for Review",
          description: `"${title}" has been submitted to Admin for approval.`,
        });
        loadEvents();
      } else {
        const err = await res.json();
        toast({ title: "Submission Failed", description: err.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit event.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Publish Event Action
  const handlePublishEvent = async (eventId: number, title: string) => {
    try {
      setActionLoadingId(eventId);
      const res = await fetch(`/api/events/${eventId}/publish`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });

      if (res.ok) {
        toast({
          title: "🎉 Event Published Live!",
          description: `"${title}" is now publicly visible and open for registrations!`,
        });
        loadEvents();
      } else {
        const err = await res.json();
        toast({
          title: "Publishing Blocked",
          description: err.error || "Event must be approved by admin before publishing.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to publish event.", variant: "destructive" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Draft Action
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/events/${deleteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        toast({ title: "Event Deleted", description: "Draft removed successfully." });
        loadEvents();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete draft.", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  // Load Volunteer Desk Data
  const loadVolunteerDeskData = async (eventId: number) => {
    setLoadingVolunteers(true);
    try {
      const token = localStorage.getItem("eventhub_token") || "";
      const [volRes, reqRes] = await Promise.all([
        fetch(`/api/events/${eventId}/volunteers`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`/api/events/${eventId}/volunteer-requirements`, { headers: { "Authorization": `Bearer ${token}` } }),
      ]);

      if (volRes.ok) {
        const volData = await volRes.json();
        setVolunteers(volData.volunteers || []);
      }
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequirements(reqData.requirements || []);
      }
    } catch (e) {
      console.error("Failed to load volunteer data:", e);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const openVolunteerDesk = (ev: any) => {
    setVolDeskEvent(ev);
    loadVolunteerDeskData(ev.id);
  };

  // Run AI Matching
  const handleRunAiMatching = async () => {
    if (!volDeskEvent) return;
    setRunningAiMatching(true);
    try {
      const res = await fetch(`/api/events/${volDeskEvent.id}/volunteers/match`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        toast({
          title: "🤖 AI Matching Complete!",
          description: "Candidate scores and explainable skill rankings updated.",
        });
        loadVolunteerDeskData(volDeskEvent.id);
      }
    } catch {
      toast({ title: "Error", description: "Failed to run AI matching engine.", variant: "destructive" });
    } finally {
      setRunningAiMatching(false);
    }
  };

  // Volunteer Actions
  const handleAssignVolunteer = async (applicationId: number, roleName: string) => {
    if (!volDeskEvent) return;
    try {
      const res = await fetch(`/api/events/${volDeskEvent.id}/volunteers/${applicationId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({ role: roleName }),
      });
      if (res.ok) {
        toast({ title: "Volunteer Assigned", description: `Assigned as ${roleName}. Notification sent to volunteer.` });
        loadVolunteerDeskData(volDeskEvent.id);
      }
    } catch {
      toast({ title: "Error", description: "Failed to assign volunteer.", variant: "destructive" });
    }
  };

  const handleShortlistVolunteer = async (applicationId: number) => {
    if (!volDeskEvent) return;
    try {
      await fetch(`/api/events/${volDeskEvent.id}/volunteers/${applicationId}/shortlist`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      toast({ title: "Candidate Shortlisted", description: "Candidate added to priority review list." });
      loadVolunteerDeskData(volDeskEvent.id);
    } catch {}
  };

  const handleRejectVolunteer = async (applicationId: number) => {
    if (!volDeskEvent) return;
    try {
      await fetch(`/api/events/${volDeskEvent.id}/volunteers/${applicationId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      toast({ title: "Status Updated", description: "Application marked as not selected." });
      loadVolunteerDeskData(volDeskEvent.id);
    } catch {}
  };

  // Add Requirement
  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volDeskEvent || !newRoleName.trim()) return;
    setAddingRequirement(true);
    try {
      const res = await fetch(`/api/events/${volDeskEvent.id}/volunteer-requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({
          role: newRoleName,
          requiredSkills: newReqSkills,
          preferredSkills: newPrefSkills,
          responsibilities: newResponsibilities,
          numberRequired: newNumberRequired,
        }),
      });

      if (res.ok) {
        toast({ title: "Role Requirement Added", description: `Added "${newRoleName}" requirement.` });
        setNewRoleName("");
        setNewReqSkills("");
        setNewPrefSkills("");
        setNewResponsibilities("");
        loadVolunteerDeskData(volDeskEvent.id);
        setVolDeskTab("candidates");
      }
    } catch {
      toast({ title: "Error", description: "Failed to add role requirement.", variant: "destructive" });
    } finally {
      setAddingRequirement(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title?.toLowerCase().includes(search.toLowerCase()) ||
      ev.category?.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground">Organizer Events Desk</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, review, publish, and manage AI volunteer recruitment for your campus events.
            </p>
          </div>

          <Link href="/dashboard/organizer/events/new">
            <Button className="font-bold text-xs shadow-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 rounded-2xl cursor-pointer">
              <PlusCircle className="w-4 h-4 mr-2" /> Create New Event
            </Button>
          </Link>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              placeholder="Search by title, category, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs rounded-2xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {["all", "draft", "pending_approval", "approved", "published", "rejected"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="text-xs font-semibold rounded-xl capitalize h-8 cursor-pointer"
              >
                {st === "all" ? "All Events" : st.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Listing */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 text-center border-dashed rounded-3xl space-y-3">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-serif font-bold text-xl text-foreground">No Events Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {statusFilter === "all" ? "You haven't created any events yet. Get started by creating your first event draft." : `No events match the "${statusFilter}" filter.`}
            </p>
            <Link href="/dashboard/organizer/events/new">
              <Button size="sm" className="font-bold text-xs mt-2">Create New Event Draft</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((ev) => (
              <Card key={ev.id} className="p-6 border-border/60 hover:border-primary/40 transition-all shadow-xs rounded-3xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  {/* Left: Event Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold">{ev.category}</Badge>
                      
                      {/* Lifecycle Status Badge */}
                      {ev.status === "draft" && (
                        <Badge className="bg-slate-500 text-white font-bold text-xs">
                          DRAFT
                        </Badge>
                      )}
                      {ev.status === "pending_approval" && (
                        <Badge className="bg-amber-500 text-white font-bold text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> PENDING ADMIN APPROVAL
                        </Badge>
                      )}
                      {ev.status === "approved" && (
                        <Badge className="bg-blue-600 text-white font-bold text-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> APPROVED BY ADMIN
                        </Badge>
                      )}
                      {ev.status === "published" && (
                        <Badge className="bg-green-600 text-white font-bold text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> LIVE / PUBLISHED
                        </Badge>
                      )}
                      {ev.status === "rejected" && (
                        <Badge className="bg-rose-600 text-white font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> REVISION REQUESTED
                        </Badge>
                      )}

                      <Badge variant="outline" className="text-[10px]">
                        {ev.price > 0 ? `₹${ev.price}` : "Free Pass"}
                      </Badge>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        ID: EVT-{ev.id}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-foreground">{ev.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{ev.startTime ? format(new Date(ev.startTime), "MMM d, yyyy • h:mm a") : "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{ev.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{ev.registeredCount || 0} / {ev.capacity} Registered</span>
                      </div>
                    </div>

                    {/* Rejection notice banner if applicable */}
                    {ev.status === "rejected" && ev.rejectionReason && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Admin Feedback:</strong> {ev.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                    
                    {/* AI VOLUNTEER DESK BUTTON */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openVolunteerDesk(ev)}
                      className="font-bold text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-xl"
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5 text-accent" /> AI Volunteer Desk
                    </Button>

                    {/* DRAFT STATE ACTIONS */}
                    {ev.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitForApproval(ev.id, ev.title)}
                          disabled={actionLoadingId === ev.id}
                          className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          {actionLoadingId === ev.id ? "Submitting..." : "Submit for Approval"}
                        </Button>

                        <Link href={`/dashboard/organizer/events/${ev.id}/edit`}>
                          <Button size="sm" variant="outline" className="font-semibold text-xs">
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* PENDING APPROVAL STATE ACTIONS */}
                    {ev.status === "pending_approval" && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> In Admin Review Desk
                      </div>
                    )}

                    {/* APPROVED STATE ACTIONS */}
                    {ev.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handlePublishEvent(ev.id, ev.title)}
                          disabled={actionLoadingId === ev.id}
                          className="font-bold text-xs bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer animate-pulse"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          {actionLoadingId === ev.id ? "Publishing..." : "Publish Event Live"}
                        </Button>

                        <Link href={`/dashboard/organizer/events/${ev.id}/edit`}>
                          <Button size="sm" variant="outline" className="font-semibold text-xs">
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* PUBLISHED STATE ACTIONS */}
                    {ev.status === "published" && (
                      <>
                        <Link href={`/events/${ev.id}`}>
                          <Button size="sm" variant="default" className="font-bold text-xs cursor-pointer shadow-2xs">
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Public Page
                          </Button>
                        </Link>

                        <Link href={`/dashboard/organizer/events/${ev.id}/attendance`}>
                          <Button size="sm" variant="outline" className="font-semibold text-xs cursor-pointer">
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-primary" /> Attendance & QR
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* REJECTED STATE ACTIONS */}
                    {ev.status === "rejected" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingFeedbackEvent(ev)}
                          className="font-bold text-xs text-rose-600 border-rose-500/40"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> View Feedback
                        </Button>

                        <Link href={`/dashboard/organizer/events/${ev.id}/edit`}>
                          <Button size="sm" className="font-bold text-xs bg-primary text-primary-foreground">
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit & Resubmit
                          </Button>
                        </Link>
                      </>
                    )}

                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* AI VOLUNTEER RECRUITMENT & SKILL MATCHING MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!volDeskEvent} onOpenChange={() => setVolDeskEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="font-serif font-bold text-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" /> AI Volunteer Recruitment & Skill Matching
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {volDeskEvent?.title} • Ranked candidates grounded in verified skills & experience
                </DialogDescription>
              </div>

              <Button
                onClick={handleRunAiMatching}
                disabled={runningAiMatching}
                className="font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-xl shadow-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${runningAiMatching ? "animate-spin" : ""}`} />
                {runningAiMatching ? "Running Engine..." : "Run AI Skill Matching"}
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="candidates" value={volDeskTab} onValueChange={setVolDeskTab} className="w-full space-y-4 pt-2">
            <TabsList className="bg-muted/60 p-1 rounded-2xl">
              <TabsTrigger value="candidates" className="rounded-xl font-bold text-xs px-4">
                <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Candidates & Match Scores ({volunteers.length})
              </TabsTrigger>
              <TabsTrigger value="requirements" className="rounded-xl font-bold text-xs px-4">
                <Layers className="w-3.5 h-3.5 mr-1.5" /> Event Role Requirements ({requirements.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CANDIDATES & MATCH SCORES */}
            <TabsContent value="candidates" className="space-y-4">
              {loadingVolunteers ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : volunteers.length === 0 ? (
                <Card className="p-8 text-center border-dashed rounded-3xl">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No candidate applications received yet for this event.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {volunteers.map((vol) => (
                    <Card key={vol.id} className="p-5 border-border/60 rounded-3xl shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-lg text-foreground">{vol.volunteerName || vol.fullName}</h4>
                            
                            {vol.status === "applied" && <Badge className="bg-blue-600 text-white font-bold text-[10px]">APPLIED</Badge>}
                            {vol.status === "shortlisted" && <Badge className="bg-purple-600 text-white font-bold text-[10px]">SHORTLISTED</Badge>}
                            {vol.status === "assigned" && <Badge className="bg-green-600 text-white font-bold text-[10px]">ASSIGNED: {vol.assignedRole || "Lead"}</Badge>}
                            {vol.status === "rejected" && <Badge className="bg-rose-600 text-white font-bold text-[10px]">REJECTED</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{vol.volunteerEmail || vol.email} • {vol.phone || "+91 98765 43210"}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">AI Match Score</span>
                            <span className={`font-serif font-bold text-lg ${vol.matchScore >= 85 ? "text-green-600" : vol.matchScore >= 70 ? "text-amber-600" : "text-purple-600"}`}>
                              {vol.matchScore || 85}%
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {vol.status !== "assigned" && (
                              <Button
                                size="sm"
                                onClick={() => handleAssignVolunteer(vol.id, (requirements[0]?.role || "Registration Coordinator"))}
                                className="font-bold text-xs bg-green-600 hover:bg-green-700 text-white rounded-xl h-8"
                              >
                                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Assign Role
                              </Button>
                            )}

                            {vol.status === "applied" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShortlistVolunteer(vol.id)}
                                className="font-bold text-xs text-purple-700 border-purple-500/30 rounded-xl h-8"
                              >
                                Shortlist
                              </Button>
                            )}

                            {vol.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRejectVolunteer(vol.id)}
                                className="font-bold text-xs text-rose-600 hover:bg-rose-50 rounded-xl h-8"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AI Explainable Details */}
                      <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/50 text-xs space-y-2">
                        {vol.matchReason && (
                          <p className="text-foreground leading-relaxed">
                            <strong>AI Reasoning:</strong> {vol.matchReason}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="font-bold text-muted-foreground text-[10px] uppercase">Matching Skills:</span>
                          {(Array.isArray(vol.matchingSkills) ? vol.matchingSkills : JSON.parse(vol.matchingSkills || '["Communication", "Crowd Management"]')).map((sk: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 text-[10px] font-semibold">
                              ✓ {sk}
                            </Badge>
                          ))}
                        </div>

                        {vol.experience && (
                          <p className="text-muted-foreground text-[11px]">
                            <strong>Experience:</strong> {vol.experience}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: ROLE REQUIREMENTS */}
            <TabsContent value="requirements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req) => (
                  <Card key={req.id} className="p-4 border-border/60 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-base text-foreground">{req.role}</h4>
                      <Badge variant="outline" className="text-xs font-semibold">{req.numberRequired} Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{req.responsibilities}</p>
                    <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
                      <div><strong>Required:</strong> {Array.isArray(req.requiredSkills) ? req.requiredSkills.join(", ") : req.requiredSkills}</div>
                      <div><strong>Preferred:</strong> {Array.isArray(req.preferredSkills) ? req.preferredSkills.join(", ") : req.preferredSkills}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Role Form */}
              <Card className="p-5 border-dashed rounded-3xl space-y-3">
                <h4 className="font-serif font-bold text-base text-foreground">Add New Volunteer Role</h4>
                <form onSubmit={handleAddRequirement} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Role Title</Label>
                      <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Stage Operations Lead" required className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Number Needed</Label>
                      <Input type="number" min={1} max={50} value={newNumberRequired} onChange={(e) => setNewNumberRequired(Number(e.target.value))} required className="text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Required Skills (comma-separated)</Label>
                      <Input value={newReqSkills} onChange={(e) => setNewReqSkills(e.target.value)} placeholder="e.g. Communication, Organization" required className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Preferred Skills</Label>
                      <Input value={newPrefSkills} onChange={(e) => setNewPrefSkills(e.target.value)} placeholder="e.g. QR Scanning, Audio AV" className="text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Responsibilities & Tasks</Label>
                    <Input value={newResponsibilities} onChange={(e) => setNewResponsibilities(e.target.value)} placeholder="Describe station duties and shifts..." className="text-xs" />
                  </div>

                  <Button type="submit" disabled={addingRequirement} className="font-bold text-xs bg-primary text-primary-foreground">
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> {addingRequirement ? "Adding..." : "Save Role Requirement"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* VIEW REJECTION FEEDBACK DIALOG */}
      <Dialog open={!!viewingFeedbackEvent} onOpenChange={() => setViewingFeedbackEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Revision Feedback from Admin
            </DialogTitle>
            <DialogDescription className="text-xs">
              Please address the following comments and resubmit the event for administrative approval.
            </DialogDescription>
          </DialogHeader>

          {viewingFeedbackEvent && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/60 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Event:</span>
                <p className="font-serif font-bold text-base text-foreground">{viewingFeedbackEvent.title}</p>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">Required Modifications:</span>
                <p className="text-xs text-foreground leading-relaxed">
                  "{viewingFeedbackEvent.rejectionReason || "Please verify venue capacity and update event details before resubmitting."}"
                </p>
              </div>

              <DialogFooter className="pt-2 flex gap-2">
                <Button variant="outline" onClick={() => setViewingFeedbackEvent(null)}>Close</Button>
                <Link href={`/dashboard/organizer/events/${viewingFeedbackEvent.id}/edit`}>
                  <Button className="font-bold text-xs bg-primary text-primary-foreground">
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Event Now
                  </Button>
                </Link>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DRAFT ALERT DIALOG */}
      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold">Delete Event Draft?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action cannot be undone. This draft will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-bold">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
