import React, { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bookmark, 
  ShieldCheck, 
  ArrowRight, 
  UserCircle 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface EventCardProps {
  event: {
    id: number | string;
    title: string;
    description?: string;
    category: string;
    startTime: string;
    location: string;
    organizerName?: string;
    registeredCount?: number;
    capacity: number;
    bannerUrl?: string;
    status?: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const { toast } = useToast();

  const registered = event.registeredCount || 0;
  const seatsLeft = Math.max(0, event.capacity - registered);
  const fillPercent = Math.min(100, Math.round((registered / event.capacity) * 100));

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !bookmarked;
    setBookmarked(next);
    toast({
      title: next ? "Bookmark Saved" : "Bookmark Removed",
      description: next 
        ? `Saved "${event.title}" to your bookmarked events list.`
        : `Removed "${event.title}" from bookmarks.`,
    });
  };

  const getStatusBadge = () => {
    if (seatsLeft === 0) {
      return <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px]">Sold Out</Badge>;
    }
    if (fillPercent >= 80) {
      return <Badge className="bg-amber-500 text-white font-bold text-[10px]">Filling Fast</Badge>;
    }
    return <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Registration Open</Badge>;
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full rounded-2xl border border-border/60 bg-card text-card-foreground shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 group cursor-pointer flex flex-col overflow-hidden">
        
        {/* Banner Container */}
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img
            src={event.bannerUrl || "/default-event.jpg"}
            alt={event.title}
            className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300 ease-out"
            onError={(e) => {
              e.currentTarget.src = "/default-event.jpg";
            }}
          />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-background/90 text-foreground backdrop-blur-md border-0 font-bold text-[10px] shadow-xs">
              {event.category}
            </Badge>
            {getStatusBadge()}
          </div>

          {/* Top Right Controls: QR Badge + Bookmark */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge className="bg-primary/95 text-primary-foreground font-bold text-[10px] flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" /> QR Pass Enabled
            </Badge>
            <button
              onClick={toggleBookmark}
              title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                bookmarked 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-background/80 text-foreground hover:bg-background"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-sans font-extrabold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <UserCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Hosted by <strong className="text-foreground">{event.organizerName || "Campus Event Committee"}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                {format(new Date(event.startTime), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {event.location}
              </span>
            </div>
          </div>

          {/* Seats Progress & CTA */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Seats Remaining</span>
                <span className="text-primary font-bold">{seatsLeft} left of {event.capacity}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    seatsLeft === 0 ? "bg-destructive" : fillPercent >= 80 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            <Button className="w-full font-bold h-10 rounded-xl text-xs shadow-xs group-hover:bg-primary/90">
              View Event & Register <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

        </div>

      </Card>
    </Link>
  );
}
