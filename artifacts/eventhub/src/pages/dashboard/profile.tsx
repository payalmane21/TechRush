import React, { useState, useEffect } from "react";
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
  Share2,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Printer,
  Check,
  Lock,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "Student Member",
    email: user?.email || "student@university.edu",
    department: "Computer Science & Engineering",
    role: user?.role || "attendee",
    bio: "Passionate campus member exploring hackathons, career symposiums, and volunteer leadership. Active attendee with verified digital passes.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    volunteerHours: 38,
    maxHoursGoal: 50,
    skills: ["Event Management", "QR Ticket Scanning", "Audio/Video Booth", "Public Speaking", "Cybersecurity", "UI Design"],
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com",
      website: "https://university.edu",
    },
  });

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");

  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    async function loadPayments() {
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
        console.error("Failed to load payments", err);
      } finally {
        setPaymentsLoading(false);
      }
    }
    loadPayments();
  }, []);

  // Verified Certificates List
  const userCertificates = [
    {
      id: "CERT-2026-HACK-9842",
      eventTitle: "Spring Annual Hackathon 2026",
      role: "Participant Pass & Innovator",
      issueDate: "April 15, 2026",
    },
    {
      id: "CERT-2026-CULT-4410",
      eventTitle: "Grand Cultural Fest 2026",
      role: "VIP Pass Holder",
      issueDate: "April 18, 2026",
    },
  ];

  // Achievements Badges List
  const userBadges = [
    { id: 1, title: "🥇 Verified Member", description: "Cryptographically verified university account", icon: "🥇" },
    { id: 2, title: "⚡ Instant Pass", description: "Generated instant digital QR ticket pass", icon: "⚡" },
    { id: 3, title: "💳 Secure Pay", description: "Verified payments processed via Razorpay 256-bit SSL", icon: "💳" },
    { id: 4, title: "🚀 Early Bird", description: "Checked in early for campus events", icon: "🚀" },
  ];

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setEditModalOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your campus member profile has been saved.",
    });
  };

  // Add Skill Tag
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (editForm.skills.includes(newSkill.trim())) return;
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
  const totalSpent = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

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
                <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 shadow-md uppercase">
                  {user?.role || profile.role}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Verified Student
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-primary-foreground/80 flex items-center justify-center md:justify-start gap-2">
                <Building2 className="w-4 h-4 text-accent shrink-0" />
                {profile.department} • <Mail className="w-4 h-4 text-accent shrink-0 inline ml-1" /> {user?.email || profile.email}
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

        {/* 2. STATS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <Card className="border-border/60 shadow-xs p-6 space-y-2 rounded-3xl">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Total Verified Purchases
            </span>
            <div className="text-3xl font-serif font-bold text-emerald-600">₹{totalSpent}</div>
            <span className="text-xs text-muted-foreground">{payments.length} Verified Transactions</span>
          </Card>

          <Card className="border-border/60 shadow-xs p-6 space-y-2 rounded-3xl">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Certified Volunteer Hours
            </span>
            <div className="text-3xl font-serif font-bold text-foreground">{profile.volunteerHours} hrs</div>
            <span className="text-xs text-muted-foreground">{hoursProgress}% of annual goal</span>
          </Card>

          <Card className="border-border/60 shadow-xs p-6 space-y-2 rounded-3xl">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Gateway Status
            </span>
            <div className="text-3xl font-serif font-bold text-foreground">Razorpay</div>
            <span className="text-xs text-green-600 font-semibold">256-Bit SSL Encrypted</span>
          </Card>

        </div>

        {/* 3. ACHIEVEMENTS, CERTIFICATES & PAYMENTS TABS */}
        <Tabs defaultValue="payments" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="payments" className="rounded-xl font-bold text-xs px-4 py-2">
              <CreditCard className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Verified Payments & Invoices ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl font-bold text-xs px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Earned Badges ({userBadges.length})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl font-bold text-xs px-4 py-2">
              <Award className="w-3.5 h-3.5 mr-2 text-primary" /> Certificates ({userCertificates.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PAYMENTS & INVOICES */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" /> Verified Payment Receipts
                </h3>
                <p className="text-xs text-muted-foreground">All event pass payments verified via Razorpay HMAC-SHA256.</p>
              </div>

              <Link href="/dashboard/payments">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Full Payment Dashboard →
                </Button>
              </Link>
            </div>

            {paymentsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
              </div>
            ) : payments.length === 0 ? (
              <Card className="p-8 text-center space-y-2 border-border/60">
                <CreditCard className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-base">No Payments Yet</h4>
                <p className="text-xs text-muted-foreground">When you register for paid campus events, your receipts will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map((pmt) => (
                  <Card key={pmt.id} className="p-5 border-border/60 hover:border-emerald-500/40 transition-all shadow-2xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-0 font-medium text-[10px]">
                            {pmt.eventCategory || "Campus Event"}
                          </Badge>
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                            <Check className="w-3 h-3 mr-0.5 inline" /> VERIFIED (HMAC-SHA256)
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {pmt.receiptNumber || `RCP-${pmt.id}`}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-foreground">{pmt.eventTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          Order: <strong className="font-mono text-foreground">{pmt.orderId}</strong> • Payment: <strong className="font-mono text-foreground">{pmt.paymentId}</strong>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                        <div className="text-right">
                          <span className="text-2xl font-serif font-bold text-emerald-600">₹{pmt.amount}</span>
                          <span className="text-[10px] text-muted-foreground block">Via Razorpay</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedReceipt(pmt)}
                          className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Receipt className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ACHIEVEMENTS BADGES */}
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

          {/* TAB 3: CERTIFICATES GRID */}
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
        <DialogContent className="sm:max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl">Edit Campus Profile</DialogTitle>
            <DialogDescription className="text-xs">Update your student information.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-10 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="h-10 text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bio</Label>
              <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="h-20 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs bg-primary text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* OFFICIAL RECEIPT MODAL */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          {selectedReceipt && (
            <div className="space-y-6">
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
                    {selectedReceipt.receiptNumber || `RCP-${selectedReceipt.id}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Billed To:</span>
                  <span className="font-bold text-foreground block text-sm mt-0.5">{user?.name || profile.name}</span>
                  <span className="text-muted-foreground">{user?.email || profile.email}</span>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Payment Details:</span>
                  <p><span className="text-muted-foreground">Order ID:</span> <strong className="font-mono">{selectedReceipt.orderId}</strong></p>
                  <p><span className="text-muted-foreground">Payment ID:</span> <strong className="font-mono">{selectedReceipt.paymentId}</strong></p>
                  <p><span className="text-muted-foreground">Date:</span> {selectedReceipt.createdAt ? format(new Date(selectedReceipt.createdAt), "MMM d, yyyy") : "Today"}</p>
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden text-xs">
                <div className="bg-muted/60 p-3 font-bold text-muted-foreground flex justify-between">
                  <span>Item / Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-3.5 space-y-2 divide-y divide-border/50">
                  <div className="flex justify-between pt-1">
                    <div>
                      <strong className="text-foreground block">{selectedReceipt.eventTitle}</strong>
                      <span className="text-muted-foreground text-[11px]">Category: {selectedReceipt.eventCategory || "Technical"}</span>
                    </div>
                    <span className="font-bold text-foreground">₹{selectedReceipt.amount}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-muted-foreground">
                    <span>Convenience Fee</span>
                    <span className="text-green-600 font-semibold">₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-sm text-foreground">
                    <span>Total Amount Paid</span>
                    <span className="text-emerald-600 text-base">₹{selectedReceipt.amount}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Razorpay HMAC-SHA256 Verified</span>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  Valid Signature
                </Badge>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedReceipt(null)}>Close</Button>
                <Button onClick={() => window.print()} className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
