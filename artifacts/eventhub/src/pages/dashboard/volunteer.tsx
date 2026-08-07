import React, { useState } from "react";
import { Link } from "wouter";
import { useGetVolunteerDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetVolunteerDashboard();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("shifts");

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
              Manage your assigned shift stations, scan ticket QR passes live, and track your certified volunteer hours.
            </p>
          </div>

          <Link href="/dashboard/volunteer/scan">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg h-12 px-6 cursor-pointer">
              <QrCode className="w-5 h-5 mr-2" /> Launch Mobile QR Scanner
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Shifts</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{data?.assignedTasks || 6}</div>
              <p className="text-xs text-muted-foreground mt-1">Confirmed volunteer stations</p>
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
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved Roles</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-foreground">{data?.approvedApplications || 4}</div>
              <p className="text-xs text-muted-foreground mt-1">Active committee approvals</p>
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
        <Tabs defaultValue="shifts" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="shifts" className="rounded-xl font-bold text-xs px-4 py-2">
              <ClipboardCheck className="w-3.5 h-3.5 mr-2" /> My Upcoming Shifts ({data?.upcomingShifts?.length || 2})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2" /> Volunteer Certificates ({volunteerCertificates.length})
            </TabsTrigger>
            <TabsTrigger value="scanner" className="rounded-xl font-bold text-xs px-4 py-2">
              <QrCode className="w-3.5 h-3.5 mr-2 text-primary" /> Live QR Scanner Desk
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SHIFTS */}
          <TabsContent value="shifts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Assigned Volunteer Shifts</h3>
              <Link href="/dashboard/volunteer/scan">
                <Button size="sm" className="font-bold text-xs cursor-pointer shadow-2xs">
                  <QrCode className="w-3.5 h-3.5 mr-1" /> Open Mobile Scanner
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="animate-pulse bg-muted rounded-2xl h-48 w-full" />
            ) : (
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
            )}
          </TabsContent>

          {/* TAB 2: CERTIFICATES */}
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

          {/* TAB 3: LIVE SCANNER TRIGGER */}
          <TabsContent value="scanner" className="space-y-6">
            <Card className="p-8 text-center border-primary/30 shadow-md space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-foreground">Mobile QR Pass Scanner Desk</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open the interactive camera/manual scanner to verify student tickets and record attendance in real-time.
              </p>
              <Link href="/dashboard/volunteer/scan">
                <Button size="lg" className="w-full font-bold shadow-md cursor-pointer">
                  Launch Live Scanner <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
