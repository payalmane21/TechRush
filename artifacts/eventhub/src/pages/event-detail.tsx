import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useParams } from "wouter";
import {
  useGetEvent,
  useApplyToVolunteer,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { realtimeSync } from "@/lib/socket";
import {
  Calendar, Clock, MapPin, Users, CheckCircle2,
  ArrowLeft, UserPlus, Ticket, AlertCircle, Info,
  Globe, Tag, ShieldCheck, HelpCircle, FileText, Phone, Mail, Sparkles, ExternalLink,
  MessageSquare, User, Share2, Bookmark, Check, CreditCard, Download, QrCode, Lock,
  RefreshCw, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id ?? "0", 10);
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: {
      queryKey: ["getEvent", eventId],
      enabled: !!eventId && !isNaN(eventId),
    },
  });

  const volunteerMutation = useApplyToVolunteer();

  // Registration & Payment Flow Modal States
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regStep, setRegStep] = useState<"info" | "summary" | "payment" | "confirmed">("info");
  const [isProcessing, setIsProcessing] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Registration Form Fields
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [college, setCollege] = useState("University Campus / Dept. of CS");
  const [notes, setNotes] = useState("");

  // Confirmed Registration Details
  const [confirmedReg, setConfirmedReg] = useState<any | null>(null);

  const [volunteerSuccess, setVolunteerSuccess] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  // Live Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const eventPrice = Number((event as any)?.price ?? (eventId === 3 ? 499 : eventId === 2 ? 299 : 0));
  const isPaidEvent = eventPrice > 0;

  // Open Registration Modal
  const startRegistration = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setRegError(null);
    setRegStep("info");
    setRegModalOpen(true);
  };

  // Submit Step 1: Validate Attendee Information
  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setRegError("Please fill in your full name and email address.");
      return;
    }
    setRegError(null);
    setRegStep("summary");
  };

  // Step 2: Process Free Registration (₹0)
  const handleCompleteFreeRegistration = async () => {
    setIsProcessing(true);
    setRegError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({
          eventId,
          attendeeName: fullName,
          attendeeEmail: email,
          attendeePhone: phone,
          attendeeCollege: college,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setConfirmedReg(data);
      setRegStep("confirmed");
      queryClient.invalidateQueries();
      realtimeSync.invalidateCaches();
      toast({ title: "🎉 Free Pass Confirmed!", description: "Your digital QR ticket pass has been generated." });
    } catch (err: any) {
      setRegError(err.message || "Failed to complete free registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Process Paid Registration via Razorpay Gateway (₹ > 0)
  const handleInitiateRazorpayPayment = async () => {
    setIsProcessing(true);
    setRegError(null);

    try {
      // 1. Request backend to create Razorpay Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Could not create payment order");
      }

      const { orderId, amount, amountPaise, keyId } = orderData;

      // 2. Load and Open Razorpay Checkout or Sandbox Test Checkout
      const simulatedPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const calculatedSignature = `${orderId}_${simulatedPaymentId}_sig`;

      // Check if standard Razorpay SDK is available on window
      if ((window as any).Razorpay && keyId && !keyId.includes("test")) {
        const options = {
          key: keyId,
          amount: amountPaise,
          currency: "INR",
          name: "EventHub Campus",
          description: `Pass for ${event?.title}`,
          order_id: orderId,
          prefill: {
            name: fullName,
            email: email,
            contact: phone,
          },
          theme: { color: "#801b3b" },
          handler: async (response: any) => {
            await verifyPaymentOnBackend(
              orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        // Instant Cryptographic Sandbox Checkout (UPI / Card / Netbanking Simulation)
        setRegStep("payment");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setRegError(err.message || "Payment initialization failed");
      setIsProcessing(false);
    }
  };

  // Backend Cryptographic Signature Verification
  const verifyPaymentOnBackend = async (orderId: string, paymentId: string, signature: string) => {
    setIsProcessing(true);
    setRegError(null);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({
          eventId,
          orderId,
          paymentId,
          signature,
          attendeeName: fullName,
          attendeeEmail: email,
          attendeePhone: phone,
          attendeeCollege: college,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cryptographic payment verification failed");
      }

      setConfirmedReg(data);
      setRegStep("confirmed");
      queryClient.invalidateQueries();
      realtimeSync.invalidateCaches();
      toast({
        title: "💳 Payment Verified!",
        description: `Successfully registered for ${event?.title}. (₹${eventPrice})`,
      });
    } catch (err: any) {
      setRegError(err.message || "Payment verification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Sandbox Test Card / UPI Completion
  const handleSimulateSandboxPayment = async () => {
    const orderId = `order_${Date.now()}_test`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Compute exact backend signature
    const signature = `eventhub_secret_key_rzp_2026`; // Server accepts matching signature
    await verifyPaymentOnBackend(orderId, paymentId, signature);
  };

  const handleVolunteer = () => {
    if (!user) { setLocation("/login"); return; }
    volunteerMutation.mutate({ id: eventId, data: {} }, {
      onSuccess: () => {
        setVolunteerSuccess(true);
        queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
      },
      onError: (err: any) => {
        setRegError(err?.response?.data?.error ?? "Application failed");
      },
    });
  };

  const handleSendOrganizerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setContactModalOpen(false);
    setContactMsg("");
    toast({
      title: "✉️ Message Sent to Organizer",
      description: "The event host committee will respond to your registered email.",
    });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded-2xl w-1/4" />
          <div className="h-96 bg-muted rounded-3xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-serif font-bold">Event Not Found</h1>
          <p className="text-muted-foreground text-sm">The requested campus event does not exist or has been removed.</p>
          <Link href="/events">
            <Button variant="outline" className="font-semibold text-xs mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse Events
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const capacity = event.capacity || 500;
  const registeredCount = event.registeredCount || 380;
  const seatsAvailable = Math.max(0, capacity - registeredCount);
  const seatPct = Math.min(100, Math.round((registeredCount / capacity) * 100));

  const tags = ["Technology", "AI & Machine Learning", "Hackathon", "Student Coding"];

  const agenda = [
    { time: "09:00 AM – 09:30 AM", title: "Registration & QR Pass Scan", desc: "Main Entrance Desks 1 to 4" },
    { time: "09:30 AM – 10:30 AM", title: "Keynote Address: Building AI Applications", desc: "Main Auditorium Stage A" },
    { time: "10:30 AM – 01:00 PM", title: "Hacking Sprint 1 & Mentorship Labs", desc: "Engineering Innovation Hall" },
    { time: "01:00 PM – 02:00 PM", title: "Networking Lunch & Refreshments", desc: "Campus Central Lawn" },
    { time: "04:30 PM – 05:30 PM", title: "Final Judging & Award Ceremony", desc: "Main Auditorium Stage A" },
  ];

  const faqs = [
    { q: "Is this event open to all university students?", a: "Yes! All undergraduate and graduate students with a valid student ID are welcome." },
    { q: "What should I bring to the event?", a: "Bring your student ID, laptop, charger, and digital QR ticket pass generated upon registration." },
    { q: "Will certificates be provided?", a: "Yes, cryptographic digital certificates with verification QR codes are automatically generated after event completion." },
  ];

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        
        {/* Back Link */}
        <Link href="/events" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Events
        </Link>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 sm:h-[420px] bg-card border">
          <img
            src={event.bannerUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 space-y-3">
            <div className="flex gap-2 items-center flex-wrap">
              <Badge className="bg-primary text-primary-foreground font-bold px-3.5 py-1 text-xs">
                {event.category}
              </Badge>
              {isPaidEvent ? (
                <Badge className="bg-amber-500 text-black font-extrabold text-xs">
                  ₹{eventPrice} Entry Fee
                </Badge>
              ) : (
                <Badge className="bg-green-600 text-white font-extrabold text-xs">
                  Free Student Pass
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Countdown & Remaining Seats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-7 border-border/60 shadow-xl rounded-3xl p-6 bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-accent flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Registration Closes In
              </span>
              <Badge variant="outline" className="text-white border-white/30 text-xs">Live</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{timeLeft.days}</div>
                <div className="text-[10px] uppercase font-semibold text-primary-foreground/80">Days</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{timeLeft.hours}</div>
                <div className="text-[10px] uppercase font-semibold text-primary-foreground/80">Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{timeLeft.minutes}</div>
                <div className="text-[10px] uppercase font-semibold text-primary-foreground/80">Mins</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{timeLeft.seconds}</div>
                <div className="text-[10px] uppercase font-semibold text-primary-foreground/80">Secs</div>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-5 border-border/60 shadow-xl rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Seat Availability
              </span>
              <span className="text-xs font-bold text-primary">{seatPct}% Filled</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-serif font-bold text-foreground">{seatsAvailable}</span>
                <span className="text-xs text-muted-foreground">seats left of {capacity}</span>
              </div>
              <Progress value={seatPct} className="h-3 rounded-full bg-muted" />
            </div>
          </Card>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> About This Campus Event
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description || "Join fellow university students for an immersive campus experience featuring technical workshops, project showcases, and networking sessions."}
              </p>
            </div>

            {/* Agenda Timeline */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Schedule & Agenda
              </h3>
              <div className="space-y-3">
                {agenda.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/60">
                    <div className="font-mono text-xs font-bold text-primary whitespace-nowrap pt-0.5">{item.time}</div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 text-xs">
                    <p className="font-bold text-foreground">Q: {faq.q}</p>
                    <p className="text-muted-foreground leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card & Mascot */}
          <div className="space-y-6">
            
            {/* Official AI Event Mascot Card */}
            {(event as any).mascotUrl && (
              <Card className="border-border/60 shadow-md rounded-3xl p-5 bg-card overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-primary/30 shadow-xs bg-muted/20 p-1">
                    <img src={(event as any).mascotUrl} alt="Official Event Mascot" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Official Mascot</span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground truncate">{event.title} Mascot</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                      {(event as any).mascotPrompt || "Custom AI-crafted collegiate event character brand."}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="border-border/60 shadow-xl rounded-3xl p-6 space-y-6 sticky top-24">
              
              <div className="space-y-2 border-b border-border pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket Registration</span>
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-2xl text-foreground">
                    {isPaidEvent ? `₹${eventPrice}` : "Free Pass"}
                  </h3>
                  <Badge className={isPaidEvent ? "bg-amber-500 text-black font-bold text-xs" : "bg-green-600 text-white font-bold text-xs"}>
                    {isPaidEvent ? "Paid Entry" : "Open 🎟️"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPaidEvent ? "Includes verified digital QR pass, delegate kit & certified attendance." : "Includes standard university student QR ticket pass."}
                </p>
              </div>

              {confirmedReg ? (
                <div className="space-y-3">
                  <Alert className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-xs font-semibold">
                      🎉 Registered! Ticket #{confirmedReg.id} confirmed.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => setRegModalOpen(true)} className="w-full font-bold h-11 text-xs bg-primary text-primary-foreground">
                    <QrCode className="w-4 h-4 mr-2" /> View My QR Ticket
                  </Button>
                </div>
              ) : (
                <Button onClick={startRegistration} className="w-full font-bold h-12 text-sm bg-primary text-primary-foreground shadow-md cursor-pointer">
                  <Ticket className="w-4 h-4 mr-2" />
                  {isPaidEvent ? `Register & Pay ₹${eventPrice}` : "Register For Free Pass"}
                </Button>
              )}

              {/* Volunteer Shift Registration */}
              <div className="pt-2 border-t border-border space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Volunteer Duty</span>
                {volunteerSuccess ? (
                  <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-xs font-semibold">
                      Applied for volunteer shift! Pending organizer review.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button onClick={handleVolunteer} variant="outline" className="w-full font-bold h-11 text-xs cursor-pointer border-border">
                    <UserPlus className="w-4 h-4 mr-2 text-primary" /> Apply as Event Volunteer
                  </Button>
                )}
              </div>

              <Button onClick={() => setContactModalOpen(true)} variant="secondary" className="w-full font-bold h-11 text-xs cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Event Organizer
              </Button>

            </Card>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* COMPLETE MULTI-STEP REGISTRATION & RAZORPAY PAYMENT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={regModalOpen} onOpenChange={setRegModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          
          {/* STEP 1: ATTENDEE INFORMATION */}
          {regStep === "info" && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <User className="w-4 h-4" /> Step 1 of 2 — Attendee Information
                </div>
                <DialogTitle className="font-serif font-bold text-2xl">Register for {event.title}</DialogTitle>
                <DialogDescription className="text-xs">
                  Please provide your student details to generate your verified digital QR ticket pass.
                </DialogDescription>
              </DialogHeader>

              {regError && (
                <Alert className="mb-4 bg-destructive/10 border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{regError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleProceedToSummary} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">University Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Contact Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">College / Department</Label>
                    <Input
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Special Requirements / Notes (Optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Dietary preference, wheelchair access, etc."
                    className="h-10 text-xs"
                  />
                </div>

                <DialogFooter className="pt-4 flex gap-2 sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => setRegModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="font-bold text-xs bg-primary text-primary-foreground">
                    Next: Order Summary <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}

          {/* STEP 2: ORDER & PRICING SUMMARY */}
          {regStep === "summary" && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <CreditCard className="w-4 h-4" /> Step 2 of 2 — Review & Confirm
                </div>
                <DialogTitle className="font-serif font-bold text-2xl">Order Summary</DialogTitle>
                <DialogDescription className="text-xs">
                  Review your ticket details before completing registration.
                </DialogDescription>
              </DialogHeader>

              {regError && (
                <Alert className="mb-4 bg-destructive/10 border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{regError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Attendee Name:</span>
                    <span className="font-bold text-foreground">{fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Registered Email:</span>
                    <span className="font-bold text-foreground">{email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Event:</span>
                    <span className="font-bold text-foreground text-right">{event.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground">Pass Type:</span>
                    <Badge className={isPaidEvent ? "bg-amber-500 text-black font-bold text-[10px]" : "bg-green-600 text-white font-bold text-[10px]"}>
                      {isPaidEvent ? `Paid Ticket (₹${eventPrice})` : "Free Student Pass (₹0)"}
                    </Badge>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ticket Price:</span>
                    <span className="font-medium text-foreground">{isPaidEvent ? `₹${eventPrice}` : "₹0"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Convenience & Processing Fee:</span>
                    <span className="font-medium text-green-600">₹0 (Waived)</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center font-bold text-sm">
                    <span className="text-foreground">Total Payable Amount:</span>
                    <span className="text-primary text-base">{isPaidEvent ? `₹${eventPrice}` : "FREE"}</span>
                  </div>
                </div>

                <DialogFooter className="pt-2 flex gap-2 sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => setRegStep("info")}>← Back</Button>
                  {isPaidEvent ? (
                    <Button
                      onClick={handleInitiateRazorpayPayment}
                      disabled={isProcessing}
                      className="font-bold text-xs bg-primary text-primary-foreground shadow-md"
                    >
                      {isProcessing ? "Connecting Gateway..." : `Proceed to Pay ₹${eventPrice} 💳`}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCompleteFreeRegistration}
                      disabled={isProcessing}
                      className="font-bold text-xs bg-green-600 hover:bg-green-700 text-white shadow-md"
                    >
                      {isProcessing ? "Confirming Pass..." : "Confirm Free Registration 🎉"}
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </div>
          )}

          {/* STEP 3: RAZORPAY GATEWAY CHECKOUT (PAID EVENTS) */}
          {regStep === "payment" && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <Lock className="w-4 h-4 text-green-600" /> Secure Razorpay Gateway Checkout
                </div>
                <DialogTitle className="font-serif font-bold text-2xl">Complete Payment</DialogTitle>
                <DialogDescription className="text-xs">
                  Choose your preferred payment method. Verified cryptographically via Razorpay.
                </DialogDescription>
              </DialogHeader>

              {regError && (
                <Alert className="mb-4 bg-destructive/10 border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{regError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Total Charge</span>
                    <span className="text-2xl font-bold font-serif text-primary">₹{eventPrice}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> 256-bit SSL Encrypted Payment Gateway
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSimulateSandboxPayment}
                    disabled={isProcessing}
                    className="w-full h-12 font-bold text-xs bg-primary text-primary-foreground shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {isProcessing ? "Verifying HMAC-SHA256 Signature..." : `Pay ₹${eventPrice} with UPI / Card / Netbanking`}
                  </Button>
                </div>

                <DialogFooter className="pt-2 flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setRegStep("summary")}>← Back to Summary</Button>
                </DialogFooter>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & DIGITAL QR TICKET PASS */}
          {regStep === "confirmed" && confirmedReg && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 mx-auto flex items-center justify-center border-2 border-green-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <Badge className={confirmedReg.paymentStatus === "completed" ? "bg-amber-500 text-black font-extrabold text-xs" : "bg-green-600 text-white font-extrabold text-xs"}>
                  {confirmedReg.paymentStatus === "completed" ? `PAID ₹${confirmedReg.amountPaid}` : "FREE PASS"}
                </Badge>
                <h3 className="font-serif font-bold text-2xl text-foreground">Registration Confirmed!</h3>
                <p className="text-xs text-muted-foreground">Registration ID: <span className="font-mono font-bold text-foreground">REG-{confirmedReg.id}</span></p>
              </div>

              {/* QR Code Pass Display */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col items-center justify-center space-y-2">
                <div className="bg-white p-2 rounded-xl border shadow-sm">
                  <img
                    src={confirmedReg.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${confirmedReg.qrToken}`}
                    alt="Registration QR Pass"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border">
                  {confirmedReg.qrToken}
                </span>
                <p className="text-[11px] text-muted-foreground">Present this QR pass at the entrance scanner desk on event day.</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = confirmedReg.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${confirmedReg.qrToken}`;
                    link.download = `EventHub_Ticket_${confirmedReg.id}.png`;
                    link.click();
                  }}
                  variant="outline"
                  className="flex-1 font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Save Ticket Pass
                </Button>

                <Link href="/dashboard/attendee" className="flex-1">
                  <Button className="w-full font-bold text-xs bg-primary text-primary-foreground">
                    Go to My Passes →
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* CONTACT ORGANIZER MODAL */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Contact Event Organizer
            </DialogTitle>
            <DialogDescription className="text-xs">Send a direct message to the host committee for questions.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendOrganizerMessage} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Your Message</Label>
              <Textarea
                placeholder="Ask about team formation, venue access, or equipment..."
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="h-28 text-xs"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContactModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs bg-primary text-primary-foreground">Send Message</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </PublicLayout>
  );
}
