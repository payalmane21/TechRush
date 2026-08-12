import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  Menu, 
  X, 
  Send, 
  ShieldCheck, 
  Heart,
  Globe,
  Mail,
  GraduationCap,
  Bell,
  Sun,
  Moon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  User,
  CreditCard
} from "lucide-react";
import { useAuthLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import { format } from "date-fns";
import { socket } from "@/lib/socket";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, logout: localLogout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useAuthLogout();
  const { toast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Live Persistent Notifications State
  const [liveNotifications, setLiveNotifications] = useState<any[]>([
    { id: 1, title: "Registration Open", message: "Spring Annual Tech Fest 2026 seats are opening.", isRead: false, createdAt: new Date().toISOString() },
    { id: 2, title: "Volunteer Badge Issued", message: "Your volunteer certificate is ready.", isRead: false, createdAt: new Date().toISOString() }
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  // Fetch notifications
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLiveNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {}
  };

  useEffect(() => {
    loadNotifications();

    if (socket) {
      const handleNotif = (notif: any) => {
        loadNotifications();
        toast({
          title: `🔔 ${notif.title}`,
          description: notif.message,
        });
      };
      socket.on("notification_created", handleNotif);
      return () => {
        socket.off("notification_created", handleNotif);
      };
    }
  }, [user]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("eventhub_token");
    localLogout();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("eventhub_token");
        localLogout();
        toast({ title: "Logged out", description: "You have been logged out successfully." });
        window.location.href = "/";
      },
    });
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "attendee": return "/dashboard/attendee";
      case "volunteer": return "/dashboard/volunteer";
      case "organizer":
      case "admin": return "/dashboard/organizer";
      default: return "/";
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid university email address.",
        variant: "destructive",
      });
      return;
    }
    setSubscribed(true);
    toast({
      title: "🎉 Subscribed to EventHub Bulletin",
      description: "You will receive official campus event & volunteer updates weekly.",
    });
    setEmail("");
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-primary-foreground font-sans scroll-smooth">
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-white/10 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span>Spring 2026 Campus Cultural Fest & Hackathon Registrations Open!</span>
        <button 
          onClick={() => scrollToSection("events")} 
          className="underline font-bold hover:text-accent ml-1 cursor-pointer transition-colors"
        >
          View Events →
        </button>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-xs">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md shadow-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-xl tracking-tight text-primary leading-none">EventHub</span>
              <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mt-0.5">Campus Platform</span>
            </div>
          </Link>
          
          {/* Desktop Navigation Links with Animated Underline */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-muted-foreground">
            <Link href="/events" className={`relative py-1 transition-colors hover:text-primary ${location === "/events" ? "text-primary font-extrabold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary after:rounded-full" : ""}`}>
              Browse Events
            </Link>
            <button 
              onClick={() => scrollToSection("events")} 
              className="relative py-1 transition-colors hover:text-primary cursor-pointer"
            >
              Upcoming Events
            </button>
            <button 
              onClick={() => scrollToSection("statistics")} 
              className="relative py-1 transition-colors hover:text-primary cursor-pointer"
            >
              Impact & Stats
            </button>
            <button 
              onClick={() => scrollToSection("faq")} 
              className="relative py-1 transition-colors hover:text-primary cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Controls: Search, Notifications, Theme, Profile */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Search Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-9 px-3 text-xs text-muted-foreground border-border/70 rounded-xl hover:border-primary font-medium cursor-pointer flex items-center gap-2"
            >
              <SearchIcon className="w-3.5 h-3.5 text-primary" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono border">⌘K</kbd>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="h-9 w-9 rounded-xl text-foreground hover:bg-muted"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </Button>

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative text-foreground hover:bg-muted cursor-pointer">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-3 rounded-2xl">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="font-bold text-xs">Campus Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">All caught up</span>
                  )}
                </div>
                <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                  {liveNotifications.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground p-3 text-center">No new notifications</p>
                  ) : (
                    liveNotifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={user?.role === "admin" ? "/dashboard/admin" : "/dashboard/organizer/events"}
                        className="block"
                      >
                        <div className={`p-2.5 rounded-xl space-y-1 transition-colors hover:bg-muted cursor-pointer ${notif.isRead ? "bg-muted/30" : "bg-primary/5 border border-primary/20"}`}>
                          <p className="font-bold text-foreground text-xs leading-tight flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{notif.message}</p>
                          <span className="text-[9px] text-muted-foreground block pt-0.5 font-mono">
                            {notif.createdAt ? format(new Date(notif.createdAt), "MMM d, h:mm a") : "Recent"}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile / Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2.5 rounded-xl border border-border/60 hover:bg-muted flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-foreground max-w-[90px] truncate">{user.name}</span>
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl space-y-1">
                  <div className="p-2 border-b mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-primary capitalize font-semibold">{user.role} Account</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="w-full cursor-pointer text-xs font-bold flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="w-full cursor-pointer text-xs font-bold flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments" className="w-full cursor-pointer text-xs font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payments & Invoices
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="w-full cursor-pointer text-xs font-bold flex items-center gap-2">
                      <SettingsIcon className="w-3.5 h-3.5" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold text-xs cursor-pointer flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Log Out Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-bold text-xs h-9 text-foreground hover:text-primary">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="font-bold text-xs h-9 px-4 rounded-xl shadow-xs">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3 font-medium text-sm">
              <button 
                onClick={() => scrollToSection("events")} 
                className="text-left text-foreground hover:text-primary py-1"
              >
                Upcoming Events
              </button>
              <button 
                onClick={() => scrollToSection("statistics")} 
                className="text-left text-foreground hover:text-primary py-1"
              >
                Impact & Stats
              </button>
              <button 
                onClick={() => scrollToSection("testimonials")} 
                className="text-left text-foreground hover:text-primary py-1"
              >
                Student Voice
              </button>
              <button 
                onClick={() => scrollToSection("faq")} 
                className="text-left text-foreground hover:text-primary py-1"
              >
                FAQ
              </button>
            </div>
            
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full font-semibold">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Go to Dashboard ({user.role})
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-semibold">Log in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full font-semibold">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page Body */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border/60 bg-muted/30 pt-16 pb-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Brand Info */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-serif font-bold text-2xl tracking-tight text-primary">EventHub</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The centralized college event management and volunteer portal. Streamlining registrations, ticketing, live QR scanning, and certified volunteer tracking.
              </p>
              <div className="flex items-center gap-3 pt-1 text-muted-foreground text-xs">
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600" /> University Verified</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-primary" /> Campus Network</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold text-foreground text-base mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection("events")} className="hover:text-primary transition-colors cursor-pointer">Explore Events</button></li>
                <li><button onClick={() => scrollToSection("statistics")} className="hover:text-primary transition-colors cursor-pointer">Platform Statistics</button></li>
                <li><button onClick={() => scrollToSection("testimonials")} className="hover:text-primary transition-colors cursor-pointer">Student Reviews</button></li>
                <li><button onClick={() => scrollToSection("faq")} className="hover:text-primary transition-colors cursor-pointer">Help & FAQs</button></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Volunteer Sign In</Link></li>
              </ul>
            </div>

            {/* Role Dashboards */}
            <div>
              <h4 className="font-serif font-bold text-foreground text-base mb-4">Portals</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/dashboard/attendee" className="hover:text-primary transition-colors">Student Ticket Portal</Link></li>
                <li><Link href="/dashboard/volunteer" className="hover:text-primary transition-colors">Volunteer Desk & QR Scanner</Link></li>
                <li><Link href="/dashboard/organizer" className="hover:text-primary transition-colors">Organizer Control Panel</Link></li>
                <li><Link href="/dashboard/organizer/events/new" className="hover:text-primary transition-colors">Create New Event</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Register Campus Club</Link></li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h4 className="font-serif font-bold text-foreground text-base mb-4">Campus Event Bulletin</h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Subscribe to get instant alerts on upcoming hackathons, guest lectures, and volunteer opportunities.
              </p>
              
              {subscribed ? (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-700 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                  You are subscribed to the weekly bulletin!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="student@university.edu" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background text-sm h-10 border-border shadow-xs"
                      required
                    />
                    <Button type="submit" size="sm" className="h-10 px-4 font-semibold shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" /> No spam. Unsubscribe anytime.
                  </span>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p className="flex items-center gap-1">
              © {new Date().getFullYear()} EventHub College Platform. Built with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive inline" /> for University Campus Excellence.
            </p>
            <div className="flex items-center gap-6">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Campus Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
