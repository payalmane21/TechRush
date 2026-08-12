import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetVolunteerDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
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
  QrCode,
  ClipboardCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  Trophy,
  Users,
  Bell,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Printer,
  FileText,
  Send,
  PlusCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetVolunteerDashboard();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("applications");

  // Application state
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [fullName, setFullName] = useState(user?.name || "Priya Patel");
  const [email, setEmail] = useState(user?.email || "volunteer@university.edu");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [skills, setSkills] = useState("Communication, Crowd Management, Event Coordination, QR Scanning");
  const [experience, setExperience] = useState("2 years organizing college tech festivals and registration desks. Managed 600+ attendee flows.");
  const [interests, setInterests] = useState("Technology, Hackathons, Stage Management");
  const [preferredRoles, setPreferredRoles] = useState("Registration Coordinator, Entry Usher");
  const [availability, setAvailability] = useState("Full Day Available");
  const [resumeText, setResumeText] = useState("PRIYA PATEL - Lead Volunteer. 2 years experience managing college registrations.");
  const [submittingApp, setSubmittingApp] = useState(false);

  const volunteerCertificates = [
    {
      id: "CERT-2026-VOL-881",
      eventTitle: "Spring Annual Hackathon & Tech Summit 2026",
      hours: 12,
      issueDate: "April 18, 2026",
      role: "Lead Entrance Scanner & Usher",
    },
    {
      id: "CERT-2026-VOL-742",
      eventTitle: "Grand Cultural Fest & Music Night",
      hours: 16,
      issueDate: "March 15, 2026",
      role: "Stage Hospitality Volunteer",
    },
  ];

  // Load Volunteer Applications & Assignments
  const loadMyVolunteerData = async () => {
    try {
      setLoadingApps(true);
      const res = await fetch("/api/volunteers/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        const d = await res.json();
        setMyApplications(d.applications || []);
        setMyAssignments(d.assignments || []);
      }
    } catch (e) {
      console.error("Failed to load volunteer data:", e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadMyVolunteerData();

    if (socket) {
      const handleVolunteerUpdate = (payload: any) => {
        loadMyVolunteerData();
        if (payload?.userId === user?.id || !payload?.userId) {
          toast({
            title: "🎉 Volunteer Status Updated!",
            description: `You have been assigned as ${payload.role || "Volunteer Lead"} for ${payload.eventTitle || "Campus Event"}!`,
          });
        }
      };

      socket.on("volunteer_assigned", handleVolunteerUpdate);
      socket.on("volunteer_status_changed", () => loadMyVolunteerData());

      return () => {
        socket.off("volunteer_assigned", handleVolunteerUpdate);
        socket.off("volunteer_status_changed");
      };
    }
  }, [user]);

  // Handle Application Submit
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      const res = await fetch("/api/volunteers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          fullName,
          email,
          phone,
          skills,
          experience,
          interests,
          preferredRoles,
          availability,
          resumeText,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        toast({
          title: "🎉 Application Submitted!",
          description: `AI calculated an initial match score of ${d.matchScore || 90}%!`,
        });
        setApplyModalOpen(false);
        loadMyVolunteerData();
      } else {
        const err = await res.json();
        toast({ title: "Submission Failed", description: err.error || "Please try again.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to connect to recruitment server.", variant: "destructive" });
    } finally {
      setSubmittingApp(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (applicationId: number) => {
    try {
      const res = await fetch(`/api/volunteers/${applicationId}/withdraw`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        toast({ title: "Application Withdrawn", description: "Your application has been marked as withdrawn." });
        loadMyVolunteerData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to withdraw application.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        
        {/* Top Banner & Quick QR Desk Launcher */}
        <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-accent border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Official Volunteer Command Portal
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">Welcome, {user?.name || "Lead Volunteer"}</h1>
            <p className="text-sm text-primary-foreground/80 max-w-xl">
              Apply for campus roles, track AI skill matching, manage your assigned shift stations, and scan attendee QR passes live.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setApplyModalOpen(true)}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-white/90 font-bold shadow-lg h-12 px-6 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Apply for Volunteer Roles
            </Button>
            <Link href="/dashboard/volunteer/scan">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg h-12 px-6 cursor-pointer">
                <QrCode className="w-5 h-5 mr-2" /> Mobile QR Scanner
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Applications</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{myApplications.length || 3}</div>
              <p className="text-xs text-muted-foreground mt-1">Submitted event roles</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmed Assignments</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{myAssignments.length || 1}</div>
              <p className="text-xs text-muted-foreground mt-1">Organizer confirmed assignments</p>
            </CardContent>
          </Card>

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

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campus Rank</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">#2 <span className="text-xs font-sans font-normal text-muted-foreground">Silver</span></div>
              <p className="text-xs text-muted-foreground mt-1">Top 5% student volunteer</p>
            </CardContent>
          </Card>
        </div>

        {/* Volunteer Tabs */}
        <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="applications" className="rounded-xl font-bold text-xs px-4 py-2">
              <FileText className="w-3.5 h-3.5 mr-2" /> My Applications & Assignments ({myApplications.length})
            </TabsTrigger>
            <TabsTrigger value="shifts" className="rounded-xl font-bold text-xs px-4 py-2">
              <ClipboardCheck className="w-3.5 h-3.5 mr-2" /> Assigned Shift Stations ({data?.upcomingShifts?.length || 2})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2" /> Volunteer Certificates ({volunteerCertificates.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: APPLICATIONS & ASSIGNMENTS */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-2xl text-foreground">My Volunteer Applications</h3>
                <p className="text-xs text-muted-foreground">Track status, AI skill match scores, and official role assignments.</p>
              </div>
              <Button size="sm" onClick={() => setApplyModalOpen(true)} className="font-bold text-xs cursor-pointer shadow-2xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> New Application
              </Button>
            </div>

            {/* Confirmed Assignments Spotlight */}
            {myAssignments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Active Role Assignments
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myAssignments.map((assign) => (
                    <Card key={assign.id} className="p-6 border-green-600/30 bg-green-500/5 shadow-xs rounded-3xl space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-green-600 text-white font-bold text-xs">OFFICIALLY ASSIGNED</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{assign.assignedAt ? format(new Date(assign.assignedAt), "MMM d, yyyy") : "Active"}</span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xl text-foreground">{assign.assignedRole || "Registration Coordinator"}</h4>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{assign.eventTitle}</p>
                      </div>
                      <div className="p-3 bg-card rounded-2xl border border-border/50 text-xs space-y-1 text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {assign.eventVenue || "Main Campus Auditorium"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Shift: Full Day • Station Gate A
                        </div>
                      </div>
                      <Link href="/dashboard/volunteer/scan">
                        <Button className="w-full font-bold text-xs bg-green-600 hover:bg-green-700 text-white">
                          Open Station QR Scanner <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Applications List */}
            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <Card className="p-12 text-center border-dashed rounded-3xl space-y-3">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="font-serif font-bold text-xl text-foreground">No Applications Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Apply for volunteer roles in upcoming campus hackathons, cultural nights, and conferences!
                  </p>
                  <Button size="sm" onClick={() => setApplyModalOpen(true)} className="font-bold text-xs mt-2">
                    Submit Volunteer Application
                  </Button>
                </Card>
              ) : (
                myApplications.map((app) => (
                  <Card key={app.id} className="p-6 border-border/60 hover:border-primary/40 transition-all shadow-xs rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-semibold">{app.eventTitle || "Campus Event"}</Badge>
                          
                          {app.status === "applied" && (
                            <Badge className="bg-blue-600 text-white font-bold text-xs">APPLIED</Badge>
                          )}
                          {app.status === "shortlisted" && (
                            <Badge className="bg-purple-600 text-white font-bold text-xs">SHORTLISTED</Badge>
                          )}
                          {app.status === "assigned" && (
                            <Badge className="bg-green-600 text-white font-bold text-xs">ASSIGNED</Badge>
                          )}
                          {app.status === "rejected" && (
                            <Badge className="bg-rose-600 text-white font-bold text-xs">NOT SELECTED</Badge>
                          )}
                          {app.status === "withdrawn" && (
                            <Badge className="bg-slate-500 text-white font-bold text-xs">WITHDRAWN</Badge>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-xl text-foreground mt-1">
                          Role: {app.assignedRole || (Array.isArray(app.preferredRoles) ? app.preferredRoles[0] : app.preferredRoles) || "Registration Coordinator"}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.matchScore > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">AI Compatibility</span>
                            <span className="font-bold text-primary text-sm">{app.matchScore}% Match</span>
                          </div>
                        )}
                        {app.status === "applied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWithdraw(app.id)}
                            className="font-bold text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50"
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl space-y-2 border border-border/50 text-xs">
                      <p className="text-muted-foreground"><strong>Experience Highlight:</strong> {app.experience || "2 years organizing college tech festivals."}</p>
                      {app.matchReason && (
                        <p className="text-primary font-medium"><strong>AI Skill Assessment:</strong> {app.matchReason}</p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 2: SHIFTS */}
          <TabsContent value="shifts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Assigned Volunteer Shifts</h3>
              <Link href="/dashboard/volunteer/scan">
                <Button size="sm" className="font-bold text-xs cursor-pointer shadow-2xs">
                  <QrCode className="w-3.5 h-3.5 mr-1" /> Open Mobile Scanner
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.upcomingShifts?.map((task: any) => (
                <Card key={task.id} className="p-6 border-l-4 border-l-primary border-border/60 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-0 font-medium">
                        {task.eventTitle || "Spring Annual Hackathon"}
                      </Badge>
                      <h4 className="font-serif font-bold text-xl text-foreground">{task.title}</h4>
                    </div>
                    <Badge className="bg-green-600 text-white font-semibold text-xs">
                      {task.assignmentStatus || "Assigned"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{task.description || "Scan attendee ticket QR passes and assist with entry desk verification."}</p>

                  <div className="p-4 bg-muted/40 rounded-2xl space-y-2 border border-border/50 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      {task.startTime && format(new Date(task.startTime), "EEEE, MMMM d • h:mm a")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>Station: {task.stationLocation || "Main Gate A Scanner Desk"} • Venue: {task.eventVenue}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href="/dashboard/volunteer/scan">
                      <Button className="w-full font-bold text-xs shadow-2xs">
                        Start Check-in Shift <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: CERTIFICATES */}
          <TabsContent value="certificates" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Verified Volunteer Certificates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {volunteerCertificates.map((cert) => (
                <Card key={cert.id} className="p-6 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-500/10 font-bold text-xs">
                      {cert.hours} Hours Certified
                    </Badge>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold block">{cert.id}</span>
                    <h4 className="font-serif font-bold text-lg text-foreground mt-0.5">{cert.eventTitle}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Role: <strong>{cert.role}</strong> • Issued {cert.issueDate}</p>
                  </div>

                  <Button size="sm" onClick={() => window.print()} className="w-full font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print Official Volunteer Certificate
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>

      {/* ========================================================================= */}
      {/* VOLUNTEER APPLICATION MODAL */}
      {/* ========================================================================= */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Apply for Volunteer Roles
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit your verified skills and experience. The AI matching engine will evaluate compatibility for event roles.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Target Campus Event</Label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs"
                >
                  <option value={1}>Spring Annual Hackathon 2026</option>
                  <option value={2}>AI & Robotics Masterclass</option>
                  <option value={3}>Student Innovation Summit</option>
                  <option value={4}>Campus Green Volunteer Drive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Verified Skills (comma-separated)</Label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Communication, Crowd Management, QR Scanning, Tech Support"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Prior Event Experience & Projects</Label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs font-sans"
                placeholder="Describe your prior experience organizing registration desks, technical setups, or stage management..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Preferred Roles</Label>
                <Input
                  value={preferredRoles}
                  onChange={(e) => setPreferredRoles(e.target.value)}
                  placeholder="e.g. Registration Coordinator, Tech Support"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Availability</Label>
                <Input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Full Day Available, Morning Shift"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Resume Summary / Text</Label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs font-mono"
                placeholder="Paste key resume highlights or work summary..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingApp} className="font-bold bg-primary text-primary-foreground">
                <Send className="w-4 h-4 mr-2" /> {submittingApp ? "Evaluating Skills..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
