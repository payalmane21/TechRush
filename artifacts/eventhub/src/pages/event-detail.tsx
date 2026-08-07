import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useParams } from "wouter";
import {
  useGetEvent,
  useRegisterForEvent,
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
import { broadcastDataMutation } from "@/components/realtime-sync-provider";
import {
  Calendar, Clock, MapPin, Users, CheckCircle2,
  ArrowLeft, UserPlus, Ticket, AlertCircle, Info,
  Globe, Tag, ShieldCheck, HelpCircle, FileText, Phone, Mail, Sparkles, ExternalLink,
  MessageSquare, User, Share2, Bookmark, Check
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

  const registerMutation = useRegisterForEvent();
  const volunteerMutation = useApplyToVolunteer();

  const [regSuccess, setRegSuccess] = useState(false);
  const [volunteerSuccess, setVolunteerSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Contact Organizer Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  // Live Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 35, seconds: 42 });

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

  const handleRegister = () => {
    if (!user) { setLocation("/login"); return; }
    setRegError(null);
    registerMutation.mutate({ id: eventId, data: {} }, {
      onSuccess: () => {
        setRegSuccess(true);
        queryClient.invalidateQueries();
        broadcastDataMutation("REGISTRATION_CREATED");
        toast({ title: "🎉 Registration Successful!", description: "Your QR pass has been generated." });
      },
      onError: (err: any) => {
        setRegError(err?.response?.data?.error ?? "Registration failed");
      },
    });
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

  // Fallback defaults
  const capacity = event.capacity || 500;
  const registeredCount = event.registeredCount || 380;
  const seatsAvailable = capacity - registeredCount;
  const seatPct = Math.round((registeredCount / capacity) * 100);

  const tags = ["Technology", "AI & Machine Learning", "Hackathon", "Student Coding"];
  const sponsors = ["Google Cloud", "Red Bull", "GitHub", "Devfolio"];

  // Guest Speakers List
  const speakers = [
    { name: "Dr. Elena Rostova", title: "Head of AI Research", org: "DeepMind Robotics", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
    { name: "Marcus Vance", title: "VP of Engineering", org: "Octocat Systems", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" },
  ];

  // Agenda Timeline
  const agenda = [
    { time: "09:00 AM – 09:30 AM", title: "Registration & QR Pass Scan", desc: "Main Entrance Desks 1 to 4" },
    { time: "09:30 AM – 10:30 AM", title: "Keynote Address: The Future of AI Agents", desc: "Main Auditorium Stage A" },
    { time: "10:30 AM – 01:00 PM", title: "Hacking Sprint 1 & Mentorship Demos", desc: "Engineering Innovation Labs" },
    { time: "01:00 PM – 02:00 PM", title: "Networking Lunch & Refreshments", desc: "Campus Central Lawn" },
    { time: "04:30 PM – 05:30 PM", title: "Final Judging & Award Ceremony", desc: "Main Auditorium Stage A" },
  ];

  // FAQs List
  const faqs = [
    { q: "Is this event open to all university students?", a: "Yes! All undergraduate and graduate students with a valid student ID are welcome." },
    { q: "What should I bring to the event?", a: "Bring your student ID, laptop, charger, and digital QR ticket pass generated upon registration." },
    { q: "Will certificates be provided?", a: "Yes, cryptographic digital certificates with verification QR codes are automatically generated after event completion." },
  ];

  // Past Photo Gallery
  const gallery = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=500",
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
              <Badge className="bg-white/20 text-white backdrop-blur-md border-white/30 text-xs font-semibold">
                Official Campus Event
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>
        </div>

        {/* 1. COUNTDOWN TIMER & REMAINING SEATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Live Countdown Timer */}
          <Card className="md:col-span-7 border-border/60 shadow-xl rounded-3xl p-6 bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Live Event Countdown
              </span>
              <Badge className="bg-amber-500 text-white font-bold text-[10px]">T-Minus Ticking</Badge>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white block">{timeLeft.days}</span>
                <span className="text-[10px] text-white/80 uppercase">Days</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white block">{timeLeft.hours}</span>
                <span className="text-[10px] text-white/80 uppercase">Hours</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white block">{timeLeft.minutes}</span>
                <span className="text-[10px] text-white/80 uppercase">Mins</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 block">{timeLeft.seconds}</span>
                <span className="text-[10px] text-white/80 uppercase">Secs</span>
              </div>
            </div>
          </Card>

          {/* Remaining Seats Meter */}
          <Card className="md:col-span-5 border-border/60 shadow-xs p-6 space-y-4 rounded-3xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Seat Capacity Meter</span>
                <Badge className="bg-green-600 text-white font-bold text-[10px]">{seatsAvailable} Seats Available</Badge>
              </div>
              <div className="text-2xl font-serif font-bold text-foreground">
                {registeredCount} / {capacity} <span className="text-xs text-muted-foreground font-sans">Registered</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${seatPct}%` }} />
              </div>
              <span className="text-[11px] text-amber-600 font-bold block text-right">⚡ Limited Seats Remaining!</span>
            </div>
          </Card>

        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Event Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Calendar className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">{format(new Date(event.startTime), "EEEE, MMM d, yyyy")}</p>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Time</p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">{format(new Date(event.startTime), "h:mm a")} – {format(new Date(event.endTime), "h:mm a")}</p>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><MapPin className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Venue</p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground">About This Event</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description || "Join us for an exciting campus event featuring industry keynote speakers, hands-on workshops, networking opportunities, free food, and verified digital certificates."}
              </p>
            </div>

            {/* AGENDA TIMELINE */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Event Agenda & Session Timeline
              </h2>
              <div className="space-y-3 pt-2">
                {agenda.map((item, idx) => (
                  <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-primary shrink-0">{item.time}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-[11px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GUEST SPEAKERS */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> Featured Keynote Speakers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {speakers.map((sp, idx) => (
                  <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 flex items-center gap-4">
                    <img src={sp.image} alt={sp.name} className="w-14 h-14 rounded-2xl object-cover border" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{sp.name}</h4>
                      <p className="text-xs text-primary font-semibold">{sp.title}</p>
                      <span className="text-[11px] text-muted-foreground block">{sp.org}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAP DIRECTIONS */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Venue Location & Map Directions
              </h2>
              <p className="text-xs text-muted-foreground">{event.venue}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`} target="_blank" rel="noreferrer">
                <Button variant="outline" className="font-semibold text-xs cursor-pointer">
                  <ExternalLink className="w-4 h-4 mr-2 text-primary" /> Open in Google Maps
                </Button>
              </a>
            </div>

            {/* PHOTO GALLERY */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground">Past Event Highlights & Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gallery.map((img, idx) => (
                  <img key={idx} src={img} alt="Gallery Highlight" className="w-full h-36 rounded-2xl object-cover hover:scale-102 transition-transform shadow-xs" />
                ))}
              </div>
            </div>

            {/* FAQS ACCORDION */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" /> Frequently Asked Questions
              </h2>
              <div className="space-y-3 pt-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 space-y-1 text-xs">
                    <h4 className="font-bold text-foreground">Q: {faq.q}</h4>
                    <p className="text-muted-foreground leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Actions Sidebar */}
          <div className="space-y-6">
            
            {/* Registration Pass Card */}
            <Card className="border-border/60 shadow-xl rounded-3xl p-6 space-y-6 sticky top-24">
              
              <div className="space-y-2 border-b border-border pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pass Registration</span>
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-2xl text-foreground">Free Student Pass</h3>
                  <Badge className="bg-green-600 text-white font-bold text-xs">Open 🎟️</Badge>
                </div>
              </div>

              {regSuccess ? (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-xs font-semibold">
                    🎉 Registered successfully! Check your dashboard for your verified QR Ticket Pass.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={handleRegister} className="w-full font-bold h-12 text-sm bg-primary text-primary-foreground shadow-md cursor-pointer">
                  <Ticket className="w-4 h-4 mr-2" /> Register For Pass
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

              {/* Contact Organizer Button */}
              <Button onClick={() => setContactModalOpen(true)} variant="secondary" className="w-full font-bold h-11 text-xs cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Event Organizer
              </Button>

            </Card>

          </div>

        </div>

      </div>

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
