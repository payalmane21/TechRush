import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListEvents } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/public-layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Clock, 
  ShieldCheck, 
  GraduationCap,
  Star,
  Award,
  Zap,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [_, setLocation] = useLocation();

  const { data, isLoading } = useListEvents({ search });
  const events = data?.events ?? [];

  // Filter events by selected category
  const filteredEvents = events.filter((event) => {
    if (selectedCategory === "All") return true;
    return event.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = [
    "All",
    "Workshop",
    "Cultural",
    "Seminar",
    "Competition",
    "Volunteer",
  ];

  const statistics = [
    {
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      value: "50+",
      label: "Campus Clubs & Chapters",
      description: "ACM, IEEE, Cultural & Sports Societies",
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      value: "15,000+",
      label: "Student Registrations",
      description: "Active participants across all departments",
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      value: "4,500+",
      label: "Volunteer Hours Logged",
      description: "Verified certificates issued automatically",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      value: "99.9%",
      label: "QR Scan Accuracy",
      description: "Instant check-in desk verification",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Student Council President",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      quote: "EventHub transformed how we manage our 3-day annual campus fest. Real-time attendance tracking and volunteer coordination became seamless!",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Lead Student Volunteer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      quote: "The volunteer QR scanner allowed our team to check in over 800 attendees per hour without long queues. Plus, getting verified certificates instantly is amazing!",
      rating: 5,
    },
    {
      name: "Dr. Rajesh K. Verma",
      role: "Dean of Student Affairs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      quote: "A modern, trustworthy platform for university activities. Gives administrators clear analytics and audit trails for all campus events.",
      rating: 5,
    },
  ];

  const sponsors = [
    { name: "ACM Student Chapter", code: "ACM" },
    { name: "IEEE Student Branch", code: "IEEE" },
    { name: "Google Developer Student Clubs", code: "GDSC" },
    { name: "Youth Red Cross", code: "YRC" },
    { name: "College Sports Board", code: "CSB" },
    { name: "Fine Arts & Dramatics Society", code: "FADS" },
  ];

  const faqs = [
    {
      q: "How do I register for an event on EventHub?",
      a: "Simply browse the upcoming events list, click on any event card to view full details, and click 'Register Now'. If you are not logged in, you will be prompted to sign in with your student account.",
    },
    {
      q: "How does the Volunteer Check-in system work?",
      a: "Appointed student volunteers access the Volunteer Desk dashboard on their phones or tablets. They scan the QR code on your event ticket to instantly verify your registration and mark your attendance.",
    },
    {
      q: "Can student organizations host and manage their own events?",
      a: "Yes! Club leaders and faculty organizers can request organizer permissions to publish events, manage attendee capacities, assign student volunteers, and export attendance reports.",
    },
    {
      q: "How do student volunteers receive verified certificates?",
      a: "Once an event concludes, organizers verify volunteer shift hours on EventHub. Volunteers receive automated, tamper-proof certificate records right inside their student dashboard.",
    },
    {
      q: "Is EventHub free for university students and faculty?",
      a: "Yes, EventHub is completely free for all verified university students, student clubs, and university administration.",
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("events");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout>
      {/* CLEAN SAAS HERO SECTION (LINEAR / VERCEL DESIGN SYSTEM) */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-20 border-b border-primary-border/20 shadow-xs">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-accent">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified University Event & Volunteer Platform</span>
              </div>

              <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-white">
                Empowering Campus Life Through <span className="text-accent">Seamless Events</span> & Verified Mobility.
              </h1>

              <p className="text-base sm:text-lg text-primary-foreground/80 max-w-2xl leading-relaxed font-normal">
                Discover upcoming university gatherings, register with instant QR ticket passes, and track verified volunteer credit hours—all inside one unified, real-time database.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => {
                    const el = document.getElementById("events");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 px-7 rounded-xl shadow-md cursor-pointer text-sm"
                >
                  Explore Campus Events <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 font-bold h-12 px-6 rounded-xl cursor-pointer text-sm"
                  >
                    Organizer Portal
                  </Button>
                </Link>
              </div>

              {/* Feature Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-medium text-primary-foreground/80 border-t border-white/10">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Instant QR Ticketing</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Verified Volunteer Passes</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Real-time Analytics</span>
              </div>
            </div>

            {/* Right Live SaaS Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-7 shadow-xl border border-border space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-extrabold text-base text-foreground">Annual Campus Tech Summit</h4>
                      <p className="text-xs text-muted-foreground">Spring 2026 Innovation Expo</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Published</Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> April 15-17, 2026</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> Main Auditorium</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Live Registration Capacity</span>
                      <span className="text-primary font-bold">850 / 1000 Attendees</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[85%]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-center">
                    <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground block">Volunteer Positions</span>
                    <span className="font-bold text-xs text-foreground">45 Openings</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-center">
                    <ShieldCheck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground block">Check-in Status</span>
                    <span className="font-bold text-xs text-foreground">QR Enabled</span>
                  </div>
                </div>

                <Link href="/events/1" className="block pt-1">
                  <Button className="w-full font-bold h-11 shadow-xs text-xs">
                    View Event Details & Register <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section id="statistics" className="py-16 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Platform Scale</Badge>
            <h2 className="font-serif text-3xl font-bold text-foreground">Trusted Across Campus</h2>
            <p className="text-muted-foreground text-sm mt-1">Empowering university leaders, student organizations, and volunteers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card p-6 rounded-2xl border border-border/60 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="p-3 bg-muted rounded-xl w-fit">{stat.icon}</div>
                <div>
                  <h3 className="font-serif font-bold text-3xl text-foreground">{stat.value}</h3>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS PREVIEW SECTION */}
      <section id="events" className="py-20 container mx-auto px-4 scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Live Events</Badge>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Upcoming Campus Events
            </h2>
            <p className="text-muted-foreground mt-1 text-sm max-w-xl">
              Filter by category, search activities, and register with instant QR pass issuance.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-muted rounded-2xl h-96" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border p-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-serif">No Events Found</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
              No upcoming events match your search query or category filter. Try clearing filters to view all campus activities.
            </p>
            <Button 
              variant="outline" 
              className="mt-5 font-semibold"
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CALL TO ACTION SECTION */}
      <section id="cta" className="py-16 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Student / Volunteer CTA */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-primary">
                <Award className="w-32 h-32" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">For Students & Volunteers</Badge>
              <h3 className="font-serif font-bold text-2xl text-foreground">Earn Certified Volunteer Hours</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join event organizing committees, check in attendees with mobile QR scanners, and earn automated certificates for your academic portfolio.
              </p>
              <Link href="/signup">
                <Button className="font-bold shadow-sm mt-2 cursor-pointer">
                  Join as Volunteer <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Organizer CTA */}
            <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-white">
                <Trophy className="w-32 h-32" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30">For Clubs & Faculty</Badge>
              <h3 className="font-serif font-bold text-2xl text-white">Host Your Next College Event</h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Publish events, track registration metrics in real-time, generate QR passes, and export attendance rosters effortlessly.
              </p>
              <Link href="/signup">
                <Button variant="secondary" className="font-bold shadow-sm mt-2 bg-white text-primary hover:bg-white/90 cursor-pointer">
                  Register Your Organization <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14">
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Campus Community</Badge>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">Loved by Students & Faculty</h2>
          <p className="text-muted-foreground text-sm mt-1">See how EventHub is transforming campus life and extracurricular management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 italic leading-relaxed">"{t.quote}"</p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-border/50 mt-6">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-10 h-10 rounded-full object-cover border border-primary/30"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SPONSORS / INSTITUTIONAL PARTNERS */}
      <section className="py-12 bg-muted/20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
            Powering Official Chapters & Campus Organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {sponsors.map((s, idx) => (
              <div 
                key={idx} 
                className="px-5 py-3 rounded-xl bg-card border border-border/60 shadow-2xs font-bold text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-primary/60" />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <section id="faq" className="py-20 container mx-auto px-4 max-w-4xl scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Got Questions?</Badge>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm mt-1">Everything you need to know about EventHub college management platform.</p>
        </div>

        <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="font-bold text-base text-foreground text-left py-4 hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  );
}