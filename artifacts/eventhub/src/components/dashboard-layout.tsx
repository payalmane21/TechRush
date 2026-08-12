import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useAuthLogout } from "@workspace/api-client-react";
import { 
  Calendar, LayoutDashboard, QrCode, ClipboardList, 
  Users, Ticket, LogOut, Menu, X, ArrowLeft, ShieldCheck, MessageSquare, Star, Award, Trophy, Sparkles, User, Settings as SettingsIcon, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const getNavItems = (role?: string): NavItem[] => {
  switch (role) {
    case "admin":
      return [
        { title: "My Profile", href: "/dashboard/profile", icon: User },
        { title: "Payments & Invoices", href: "/dashboard/payments", icon: CreditCard },
        { title: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck },
        { title: "Organizer Overview", href: "/dashboard/organizer", icon: LayoutDashboard },
        { title: "Event Control", href: "/dashboard/organizer/events", icon: Calendar },
        { title: "Volunteer Control", href: "/dashboard/organizer/volunteers", icon: Users },
        { title: "AI Intelligence Studio", href: "/dashboard/ai-studio", icon: Sparkles },
        { title: "Gamification & Rewards", href: "/dashboard/gamification", icon: Sparkles },
        { title: "Leaderboard & XP", href: "/dashboard/leaderboard", icon: Trophy },
        { title: "Certificates Studio", href: "/dashboard/certificates", icon: Award },
        { title: "Messaging Center", href: "/dashboard/messages", icon: MessageSquare },
        { title: "Event Feedback", href: "/dashboard/feedback", icon: Star },
        { title: "Event Calendar", href: "/dashboard/calendar", icon: Calendar },
        { title: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
      ];
    case "organizer":
      return [
        { title: "My Profile", href: "/dashboard/profile", icon: User },
        { title: "Payments & Invoices", href: "/dashboard/payments", icon: CreditCard },
        { title: "Overview", href: "/dashboard/organizer", icon: LayoutDashboard },
        { title: "Events", href: "/dashboard/organizer/events", icon: Calendar },
        { title: "Volunteers", href: "/dashboard/organizer/volunteers", icon: Users },
        { title: "AI Intelligence Studio", href: "/dashboard/ai-studio", icon: Sparkles },
        { title: "Gamification & Rewards", href: "/dashboard/gamification", icon: Sparkles },
        { title: "Leaderboard & XP", href: "/dashboard/leaderboard", icon: Trophy },
        { title: "Certificates Studio", href: "/dashboard/certificates", icon: Award },
        { title: "Messaging Center", href: "/dashboard/messages", icon: MessageSquare },
        { title: "Event Feedback", href: "/dashboard/feedback", icon: Star },
        { title: "Event Calendar", href: "/dashboard/calendar", icon: Calendar },
        { title: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
      ];
    case "volunteer":
      return [
        { title: "My Profile", href: "/dashboard/profile", icon: User },
        { title: "Payments & Invoices", href: "/dashboard/payments", icon: CreditCard },
        { title: "My Shifts", href: "/dashboard/volunteer", icon: ClipboardList },
        { title: "Scan QR Code", href: "/dashboard/volunteer/scan", icon: QrCode },
        { title: "AI Intelligence Studio", href: "/dashboard/ai-studio", icon: Sparkles },
        { title: "Gamification & Rewards", href: "/dashboard/gamification", icon: Sparkles },
        { title: "Leaderboard & XP", href: "/dashboard/leaderboard", icon: Trophy },
        { title: "Certificates Studio", href: "/dashboard/certificates", icon: Award },
        { title: "Messaging Center", href: "/dashboard/messages", icon: MessageSquare },
        { title: "Event Feedback", href: "/dashboard/feedback", icon: Star },
        { title: "Event Calendar", href: "/dashboard/calendar", icon: Calendar },
        { title: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
      ];
    case "attendee":
      return [
        { title: "My Profile", href: "/dashboard/profile", icon: User },
        { title: "Payments & Invoices", href: "/dashboard/payments", icon: CreditCard },
        { title: "My Registrations", href: "/dashboard/attendee", icon: Ticket },
        { title: "AI Intelligence Studio", href: "/dashboard/ai-studio", icon: Sparkles },
        { title: "Gamification & Rewards", href: "/dashboard/gamification", icon: Sparkles },
        { title: "Leaderboard & XP", href: "/dashboard/leaderboard", icon: Trophy },
        { title: "Certificates Studio", href: "/dashboard/certificates", icon: Award },
        { title: "Messaging Center", href: "/dashboard/messages", icon: MessageSquare },
        { title: "Event Feedback", href: "/dashboard/feedback", icon: Star },
        { title: "Event Calendar", href: "/dashboard/calendar", icon: Calendar },
        { title: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
      ];
    default:
      return [];
  }
};

import { GlobalSearchModal } from "@/components/global-search-modal";
import { Search as SearchIcon } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout: localLogout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useAuthLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Keyboard Shortcut (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  const handleLogout = () => {
    localStorage.removeItem("eventhub_token");
    localLogout();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("eventhub_token");
        localLogout();
        window.location.href = "/";
      },
    });
  };

  const navItems = getNavItems(user.role);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/20">
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-lg text-primary">EventHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
            <SearchIcon className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs font-bold text-destructive hover:bg-destructive/10 px-2 h-8">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Log Out
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b hidden md:flex">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-primary">EventHub</span>
          </Link>
        </div>

        <div className="px-4 pt-4 hidden md:block">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="w-full justify-between h-10 text-xs text-muted-foreground border-border/80 rounded-2xl hover:border-primary font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SearchIcon className="w-3.5 h-3.5 text-primary" /> Search EventHub...
            </span>
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono border">Ctrl+K</kbd>
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard/organizer" && item.href !== "/dashboard/attendee" && item.href !== "/dashboard/volunteer");
              
              // Exact match for base dashboard URLs, prefix match for others
              const isExact = location === item.href;
              const isReallyActive = (item.href.endsWith(user.role) ? isExact : isActive);
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isReallyActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start font-bold text-xs h-10 mb-1 rounded-xl transition-all duration-200 hover:translate-x-1", 
                      isReallyActive && "bg-primary/10 text-primary border border-primary/20 shadow-2xs font-extrabold"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className={cn("w-4 h-4 mr-2.5", isReallyActive ? "text-primary" : "text-muted-foreground")} />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/10">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 border border-primary/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full text-xs font-semibold" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Main Website
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out Account
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/80 p-2 flex justify-around items-center shadow-2xl">
        <Link href="/dashboard/profile" className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-colors ${location === "/dashboard/profile" ? "text-primary" : "text-muted-foreground"}`}>
          <User className="w-5 h-5" /> Profile
        </Link>
        <Link href="/events" className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-colors ${location === "/events" ? "text-primary" : "text-muted-foreground"}`}>
          <Calendar className="w-5 h-5" /> Events
        </Link>
        <Link href="/dashboard/ai-studio" className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-colors ${location === "/dashboard/ai-studio" ? "text-primary" : "text-muted-foreground"}`}>
          <Sparkles className="w-5 h-5 text-amber-500" /> AI Studio
        </Link>
        <Link href="/dashboard/leaderboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-colors ${location === "/dashboard/leaderboard" ? "text-primary" : "text-muted-foreground"}`}>
          <Trophy className="w-5 h-5 text-purple-600" /> XP Rank
        </Link>
        <Link href="/dashboard/settings" className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 rounded-xl transition-colors ${location === "/dashboard/settings" ? "text-primary" : "text-muted-foreground"}`}>
          <SettingsIcon className="w-5 h-5" /> Settings
        </Link>
      </div>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
