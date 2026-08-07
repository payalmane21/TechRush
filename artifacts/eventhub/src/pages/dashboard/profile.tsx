import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  User,
  Mail,
  Building2,
  Award,
  Clock,
  Sparkles,
  Edit,
  Camera,
  Linkedin,
  Github,
  Globe,
  Twitter,
  CheckCircle2,
  Star,
  Trophy,
  ShieldCheck,
  Plus,
  X,
  ExternalLink,
  Download,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "Priya Patel",
    email: user?.email || "priya@university.edu",
    department: "Computer Science & Engineering",
    role: user?.role || "volunteer",
    bio: "Senior CS undergrad passionate about student event management, hackathons, and volunteer leadership. Lead QR ticket scanner for campus tech events.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    volunteerHours: 38,
    maxHoursGoal: 50,
    skills: ["Event Management", "QR Ticket Scanning", "Audio/Video Booth", "Public Speaking", "Cybersecurity", "UI Design"],
    social: {
      linkedin: "https://linkedin.com/in/priya-patel",
      github: "https://github.com/priyapatel",
      twitter: "https://twitter.com/priya_tech",
      website: "https://priyapatel.dev",
    },
  });

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");

  // Verified Certificates List
  const userCertificates = [
    {
      id: "CERT-2026-HACK-9842",
      eventTitle: "Spring Annual Hackathon 2026",
      role: "First Place Winner",
      issueDate: "April 15, 2026",
    },
    {
      id: "CERT-2026-CULT-4410",
      eventTitle: "Grand Cultural Fest 2026",
      role: "Lead Event Usher & Volunteer",
      issueDate: "April 18, 2026",
    },
  ];

  // Achievements Badges List
  const userBadges = [
    { id: 1, title: "🥇 Gold Volunteer", description: "Completed 35+ verified service hours", icon: "🥇" },
    { id: 2, title: "⚡ Speed Scanner", description: "Scanned 50+ QR tickets in under 10 mins", icon: "⚡" },
    { id: 3, title: "⭐ 50+ Hours Shield", description: "50+ hours of verified volunteer service", icon: "⭐" },
    { id: 4, title: "🚀 Early Bird", description: "Checked in early for 5 consecutive events", icon: "🚀" },
  ];

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setEditModalOpen(false);

    toast({
      title: "✅ Profile Updated!",
      description: "Your public profile changes have been saved.",
    });
  };

  // Handle Avatar Upload Simulation
  const handleAvatarUpload = () => {
    const avatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    ];
    const newAv = avatars[Math.floor(Math.random() * avatars.length)];
    setEditForm({ ...editForm, avatar: newAv });
    toast({ title: "📸 Avatar Updated", description: "Selected new profile photo." });
  };

  // Add Skill Tag
  const handleAddSkill = () => {
    if (!newSkill.trim() || editForm.skills.includes(newSkill.trim())) return;
    setEditForm({
      ...editForm,
      skills: [...editForm.skills, newSkill.trim()],
    });
    setNewSkill("");
  };

  // Remove Skill Tag
  const handleRemoveSkill = (skillToRemove: string) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skillToRemove),
    });
  };

  const hoursProgress = Math.round((profile.volunteerHours / profile.maxHoursGoal) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* PROFILE BANNER CARD */}
        <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground p-6 sm:p-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            
            {/* Avatar Photo with Upload Badge */}
            <div className="relative group shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white/20 shadow-2xl transition-transform group-hover:scale-102"
              />
              <button
                onClick={() => { setEditForm({ ...profile }); setEditModalOpen(true); }}
                className="absolute bottom-2 right-2 bg-accent text-accent-foreground p-2 rounded-2xl shadow-lg border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                title="Change Avatar Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name, Role & Bio Details */}
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">{profile.name}</h1>
                <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 shadow-md">
                  {profile.role.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 text-xs">
                  Verified Student
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-primary-foreground/80 flex items-center justify-center md:justify-start gap-2">
                <Building2 className="w-4 h-4 text-accent shrink-0" />
                {profile.department} • <Mail className="w-4 h-4 text-accent shrink-0 inline ml-1" /> {profile.email}
              </p>

              <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed italic bg-white/10 p-4 rounded-2xl border border-white/20">
                "{profile.bio}"
              </p>

              {/* Social Links Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                {profile.social.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors" title="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.social.github && (
                  <a href={profile.social.github} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.social.twitter && (
                  <a href={profile.social.twitter} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors" title="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.social.website && (
                  <a href={profile.social.website} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors" title="Portfolio Website">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Edit Profile Action Button */}
            <div className="shrink-0 pt-4 md:pt-0">
              <Button onClick={() => { setEditForm({ ...profile }); setEditModalOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg h-11 px-6 cursor-pointer">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>

          </div>
        </Card>

        {/* 2. STATS & VOLUNTEER HOURS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Volunteer Hours Counter */}
          <Card className="md:col-span-6 border-border/60 shadow-xs p-6 space-y-4 rounded-3xl">
            <CardHeader className="p-0">
              <CardTitle className="font-serif font-bold text-xl flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Certified Volunteer Service Hours
                </span>
                <span className="text-2xl font-bold text-primary">{profile.volunteerHours} / {profile.maxHoursGoal} hrs</span>
              </CardTitle>
              <CardDescription className="text-xs">University certified volunteer service progress</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 space-y-2">
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${hoursProgress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold block text-right">{hoursProgress}% of annual goal completed</span>
            </CardContent>
          </Card>

          {/* SKILLS BADGES MANAGER */}
          <Card className="md:col-span-6 border-border/60 shadow-xs p-6 space-y-4 rounded-3xl">
            <CardHeader className="p-0">
              <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Event & Technical Skills
              </CardTitle>
              <CardDescription className="text-xs">Verified campus roles & competencies</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-muted/60 text-foreground border border-border">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 3. ACHIEVEMENTS & CERTIFICATES TABS */}
        <Tabs defaultValue="achievements" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="achievements" className="rounded-xl font-bold text-xs px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Earned Badges & Achievements ({userBadges.length})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2 text-primary" /> Verified Certificates ({userCertificates.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ACHIEVEMENTS BADGES */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userBadges.map((b) => (
                <Card key={b.id} className="p-6 border-border/60 shadow-xs space-y-3 rounded-3xl hover:border-amber-500/50 transition-all">
                  <span className="text-4xl block">{b.icon}</span>
                  <div>
                    <h4 className="font-bold text-base text-foreground">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                  </div>
                  <Badge className="bg-green-600 text-white font-bold text-[10px]">
                    ✓ Verified Badge
                  </Badge>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: CERTIFICATES GRID */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userCertificates.map((cert) => (
                <Card key={cert.id} className="p-6 border-l-4 border-l-amber-500 border-border/60 shadow-xs space-y-4 rounded-3xl">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{cert.id}</span>
                      <h4 className="font-serif font-bold text-lg text-foreground">{cert.eventTitle}</h4>
                      <p className="text-xs text-muted-foreground">Award: <strong className="text-primary">{cert.role}</strong></p>
                      <span className="text-[10px] text-muted-foreground block">Issued on {cert.issueDate}</span>
                    </div>
                    <Badge className="bg-amber-500 text-white font-bold text-[10px]">Verified 🛡️</Badge>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Link href={`/verify-certificate/${cert.id}`}>
                      <Button size="sm" variant="outline" className="font-bold text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Verify Certificate
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>

      </div>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" /> Edit User Profile & Skills
            </DialogTitle>
            <DialogDescription className="text-xs">Update your public student profile, bio, department, and social links.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            
            {/* Avatar Upload Button */}
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl border border-border/50">
              <img src={editForm.avatar} alt="Avatar Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary" />
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">Profile Picture Photo</Label>
                <p className="text-[10px] text-muted-foreground">Upload or choose a new avatar preview.</p>
                <Button type="button" size="sm" variant="outline" onClick={handleAvatarUpload} className="font-bold text-xs h-8">
                  <Camera className="w-3.5 h-3.5 mr-1" /> Change Photo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-10 text-xs font-semibold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Department / Major</Label>
                <Input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="h-10 text-xs font-semibold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Bio / About Me</Label>
              <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="h-20 text-xs" />
            </div>

            {/* Skills Tag Editor */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Skills & Competencies</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. Graphic Design)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                  className="h-10 text-xs"
                />
                <Button type="button" onClick={handleAddSkill} className="font-bold text-xs h-10 px-4">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {editForm.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Social Profile Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="LinkedIn URL" value={editForm.social.linkedin} onChange={(e) => setEditForm({ ...editForm, social: { ...editForm.social, linkedin: e.target.value } })} className="h-9 text-xs" />
                <Input placeholder="GitHub URL" value={editForm.social.github} onChange={(e) => setEditForm({ ...editForm, social: { ...editForm.social, github: e.target.value } })} className="h-9 text-xs" />
                <Input placeholder="Twitter URL" value={editForm.social.twitter} onChange={(e) => setEditForm({ ...editForm, social: { ...editForm.social, twitter: e.target.value } })} className="h-9 text-xs" />
                <Input placeholder="Website URL" value={editForm.social.website} onChange={(e) => setEditForm({ ...editForm, social: { ...editForm.social, website: e.target.value } })} className="h-9 text-xs" />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs bg-primary text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
