import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Award,
  Building2,
  User,
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";

// Fuzzy match helper function
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (!q) return 0;
  if (t.includes(q)) return 100;
  
  // Character match ratio
  let matches = 0;
  let tIdx = 0;
  for (let i = 0; i < q.length; i++) {
    const char = q[i];
    const foundIdx = t.indexOf(char, tIdx);
    if (foundIdx !== -1) {
      matches++;
      tIdx = foundIdx + 1;
    }
  }
  return (matches / q.length) * 80;
}

import { useListEvents } from "@workspace/api-client-react";

export function GlobalSearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const { data } = useListEvents({ search: query });
  const liveEvents = data?.events ?? [];

  // Dynamic Search Index built from real backend data + core features
  const searchIndex = [
    ...liveEvents.map((ev) => ({
      type: "Event",
      title: ev.title,
      category: ev.category,
      link: `/events/${ev.id}`,
      sub: `${ev.venue} • ${ev.registeredCount || 0} Registered`,
    })),
    { type: "Person", title: "Priya Patel", category: "Volunteer Scanner Lead", link: "/dashboard/organizer/volunteers", sub: "Computer Science • priya@university.edu" },
    { type: "Person", title: "Aarav Sharma", category: "Event Organizer", link: "/dashboard/organizer/volunteers", sub: "Information Tech • aarav@university.edu" },
    { type: "Person", title: "Rohan Gupta", category: "Student Attendee", link: "/dashboard/attendee", sub: "Electrical Eng • rohan@university.edu" },
    { type: "Venue", title: "Main Science Auditorium & Cyber Stage", category: "Auditorium", link: "/events", sub: "Capacity: 500 • Gate A" },
    { type: "Venue", title: "University Central Open Amphitheater", category: "Outdoor Grounds", link: "/events", sub: "Capacity: 1200 • Main Campus" },
    { type: "Certificate", title: "CERT-2026-HACK-9842", category: "Official Pass", link: "/verify-certificate/CERT-2026-HACK-9842", sub: "Winner Certificate • Priya Patel" },
    { type: "Organization", title: "ACM Student Chapter", category: "Tech Society", link: "/events", sub: "Student Club • 4 Events Hosted" },
  ];

  // Perform Fuzzy Search Filtering
  const searchResults = query.trim()
    ? searchIndex
        .map(item => ({
          ...item,
          score: Math.max(
            fuzzyScore(query, item.title),
            fuzzyScore(query, item.category),
            fuzzyScore(query, item.sub)
          ),
        }))
        .filter(item => item.score > 30)
        .sort((a, b) => b.score - a.score)
    : searchIndex.slice(0, 6); // Default top suggestions

  const handleSelectResult = (link: string) => {
    setLocation(link);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 gap-0 overflow-hidden shadow-2xl border-border">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <Input
            placeholder="Type to search events, people, venues, certificates, volunteers, or organizations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 h-10 text-sm font-semibold bg-transparent"
            autoFocus
          />
          <Badge variant="outline" className="text-[10px] font-mono shrink-0">ESC to close</Badge>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[420px] overflow-y-auto space-y-2 bg-muted/20">
          <div className="flex justify-between items-center px-2 pb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {query ? `Fuzzy Matches (${searchResults.length})` : "Quick Suggestions"}
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No results found matching "{query}". Try typing a name, venue, or certificate ID.
            </div>
          ) : (
            searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectResult(item.link)}
                className="p-3.5 rounded-2xl bg-card hover:bg-primary/10 border border-border/50 flex items-center justify-between gap-4 cursor-pointer transition-all hover:scale-101 shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.type === "Event" ? "bg-primary/10 text-primary" :
                    item.type === "Person" ? "bg-green-500/10 text-green-600" :
                    item.type === "Venue" ? "bg-blue-500/10 text-blue-600" :
                    item.type === "Certificate" ? "bg-amber-500/10 text-amber-600" : "bg-purple-500/10 text-purple-600"
                  }`}>
                    {item.type === "Event" && <Calendar className="w-4 h-4" />}
                    {item.type === "Person" && <User className="w-4 h-4" />}
                    {item.type === "Venue" && <MapPin className="w-4 h-4" />}
                    {item.type === "Certificate" && <Award className="w-4 h-4" />}
                    {item.type === "Organization" && <Building2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-foreground">{item.title}</h4>
                      <Badge variant="outline" className="text-[9px] font-semibold">{item.type}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-60" />
              </div>
            ))
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
