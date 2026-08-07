import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListEvents } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/public-layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Filter,
  Bookmark,
  Share2,
  Sparkles,
  TrendingUp,
  Flame,
  Clock,
  Check,
  Copy,
  X,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "All",
  "Technology",
  "Cultural",
  "Career",
  "Sports",
  "Arts",
  "Academic",
  "Entrepreneurship",
  "Social",
  "Health & Wellness",
  "Volunteer Drive",
  "Hackathon",
  "Seminar"
];

const LOCATIONS = [
  "All Locations",
  "Main Science & Tech Auditorium, Block B",
  "University Central Amphitheater",
  "Engineering Lecture Hall 101",
  "Sports Complex & Field",
];

export default function BrowseEvents() {
  const { toast } = useToast();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("any");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState<"trending" | "featured" | "most_registered" | "recently_added">("trending");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Bookmarks State (stored in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("eventhub_bookmarked_ids");
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  // Share Modal State
  const [shareModalEvent, setShareModalEvent] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data, isLoading } = useListEvents({ search });
  const events = data?.events ?? [];

  useEffect(() => {
    try {
      localStorage.setItem("eventhub_bookmarked_ids", JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  const toggleBookmark = (eventId: number, eventTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarkedIds.includes(eventId)) {
      setBookmarkedIds(bookmarkedIds.filter(id => id !== eventId));
      toast({
        title: "Bookmark Removed",
        description: `Removed "${eventTitle}" from saved events.`,
      });
    } else {
      setBookmarkedIds([...bookmarkedIds, eventId]);
      toast({
        title: "⭐ Event Bookmarked!",
        description: `Saved "${eventTitle}" to your favorites.`,
      });
    }
  };

  const handleShareClick = (event: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareModalEvent(event);
    setCopiedLink(false);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/events/${shareModalEvent?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({ title: "Link Copied!", description: "Event link copied to clipboard." });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filter & Sort Logic
  const filteredEvents = events.filter((ev) => {
    // 1. Search Query
    const matchesSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.venue.toLowerCase().includes(search.toLowerCase());
    
    // 2. Category
    const matchesCategory = selectedCategory === "All" || ev.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    // 3. Location
    const matchesLocation = selectedLocation === "All Locations" || ev.venue === selectedLocation;

    // 4. Bookmarks Only
    const matchesBookmark = !onlyBookmarks || bookmarkedIds.includes(ev.id);

    // 5. Date Filter
    let matchesDate = true;
    if (dateFilter !== "any") {
      const evDate = new Date(ev.startTime);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = evDate.toDateString() === now.toDateString();
      } else if (dateFilter === "this_week") {
        const nextWeek = new Date(now.getTime() + 7 * 86400000);
        matchesDate = evDate >= now && evDate <= nextWeek;
      } else if (dateFilter === "this_month") {
        matchesDate = evDate.getMonth() === now.getMonth() && evDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesBookmark && matchesDate;
  });

  // Sorting Logic
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "trending") {
      return (b.registeredCount || 0) - (a.registeredCount || 0);
    }
    if (sortBy === "most_registered") {
      return (b.registeredCount || 0) - (a.registeredCount || 0);
    }
    if (sortBy === "recently_added") {
      return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
    }
    if (sortBy === "featured") {
      return (b.capacity || 0) - (a.capacity || 0);
    }
    return 0;
  });

  return (
    <PublicLayout>
      <div className="bg-muted/10 min-h-screen pb-20">
        
        {/* TOP HERO SEARCH HEADER */}
        <section className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-14 shadow-lg relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Explore & Discover Campus Life
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Discover Campus Events & Workshops
            </h1>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-2xl">
              Search by topic, venue, date, or popularity. Bookmark your favorites and register with instant QR passes.
            </p>

            {/* Main Search Input */}
            <div className="pt-2 max-w-2xl">
              <div className="relative">
                <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search events by title, keyword, speaker, or auditorium..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-10 h-13 text-sm rounded-2xl bg-background text-foreground shadow-lg border-white/20 focus-visible:ring-2 focus-visible:ring-accent"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-6xl pt-8 space-y-8">
          
          {/* CONTROL BAR: CATEGORY PILLS, FILTERS, SORT & BOOKMARKS */}
          <div className="bg-card p-5 rounded-3xl border border-border/60 shadow-xs space-y-5">
            
            {/* Category Pills Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</span>
                <span className="text-xs text-muted-foreground">{sortedEvents.length} events found</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Dropdowns & Sort Options Bar */}
            <div className="pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* Sort By Select */}
              <div className="lg:col-span-4 flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground shrink-0">Sort By:</span>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-10 text-xs font-semibold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">🔥 Trending & Popular</SelectItem>
                    <SelectItem value="featured">✨ Featured Events</SelectItem>
                    <SelectItem value="most_registered">👥 Most Registered</SelectItem>
                    <SelectItem value="recently_added">🕒 Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter Select */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground shrink-0">Date:</span>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-10 text-xs font-semibold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Date</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Select */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground shrink-0">Venue:</span>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-10 text-xs font-semibold rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bookmark Filter Toggle */}
              <div className="lg:col-span-2 flex justify-end">
                <Button
                  size="sm"
                  variant={onlyBookmarks ? "default" : "outline"}
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                  className="w-full sm:w-auto text-xs font-bold rounded-xl cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${onlyBookmarks ? "fill-white" : "text-amber-500"}`} />
                  Saved ({bookmarkedIds.length})
                </Button>
              </div>

            </div>
          </div>

          {/* ACTIVE FILTER BADGES */}
          {(selectedCategory !== "All" || dateFilter !== "any" || selectedLocation !== "All Locations" || search || onlyBookmarks) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-muted-foreground">Active Filters:</span>
              {selectedCategory !== "All" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory("All")}>
                  Category: {selectedCategory} <X className="w-3 h-3" />
                </Badge>
              )}
              {dateFilter !== "any" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setDateFilter("any")}>
                  Date: {dateFilter} <X className="w-3 h-3" />
                </Badge>
              )}
              {selectedLocation !== "All Locations" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedLocation("All Locations")}>
                  Venue Filtered <X className="w-3 h-3" />
                </Badge>
              )}
              {onlyBookmarks && (
                <Badge variant="secondary" className="gap-1 cursor-pointer bg-amber-500/10 text-amber-700" onClick={() => setOnlyBookmarks(false)}>
                  Bookmarked Only <X className="w-3 h-3" />
                </Badge>
              )}
              <button 
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setDateFilter("any");
                  setSelectedLocation("All Locations");
                  setOnlyBookmarks(false);
                }} 
                className="text-primary font-bold hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* EVENT GRID */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-3xl h-96" />
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            <Card className="p-16 text-center border-dashed rounded-3xl space-y-4">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-xl font-bold font-serif">No Events Found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                No active campus events match your selected filters. Try broadening your search.
              </p>
              <Button 
                variant="outline"
                className="font-bold"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setDateFilter("any");
                  setSelectedLocation("All Locations");
                  setOnlyBookmarks(false);
                }}
              >
                Reset All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* SHARE EVENT MODAL */}
      <Dialog open={!!shareModalEvent} onOpenChange={() => setShareModalEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Share Event
            </DialogTitle>
            <DialogDescription className="text-xs">
              Invite your classmates and friends to "{shareModalEvent?.title}"
            </DialogDescription>
          </DialogHeader>

          {shareModalEvent && (
            <div className="space-y-5 py-3">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/50 flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-muted-foreground truncate flex-1">
                  {window.location.origin}/events/{shareModalEvent.id}
                </span>
                <Button size="sm" onClick={copyShareLink} className="font-bold text-xs shrink-0">
                  {copiedLink ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedLink ? "Copied" : "Copy Link"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out "${shareModalEvent.title}" on EventHub: ${window.location.origin}/events/${shareModalEvent.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full font-semibold text-xs border-green-500/30 text-green-700 bg-green-500/5">
                    WhatsApp Share
                  </Button>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Register for "${shareModalEvent.title}" on EventHub!`)}&url=${encodeURIComponent(`${window.location.origin}/events/${shareModalEvent.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full font-semibold text-xs border-blue-500/30 text-blue-700 bg-blue-500/5">
                    Twitter / X
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
