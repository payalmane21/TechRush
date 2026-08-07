import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Star,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  BarChart3,
  CornerDownRight,
  EyeOff,
  Filter,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackModule() {
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const eventId = params.id ? parseInt(params.id, 10) : 1;

  // Active Tab
  const [activeTab, setActiveTab] = useState("reviews");

  // Submit Feedback Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState({
    content: 5,
    venue: 5,
    organization: 4,
  });

  // Reply Modal State
  const [replyModalReview, setReplyModalReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");

  // Feedback Reviews Dataset
  const [reviews, setReviews] = useState([
    {
      id: 1,
      eventId: 1,
      eventTitle: "Spring Annual Hackathon & Innovation Expo 2026",
      studentName: "Priya Patel",
      isAnonymous: false,
      rating: 5,
      comment: "Outstanding event structure! The mentor assistance and QR ticket check-in process were extraordinarily fast.",
      submittedAt: "2 hours ago",
      categoryScores: { content: 5, venue: 5, organization: 5 },
      organizerReply: {
        author: "ACM Event Committee",
        text: "Thank you Priya! We are thrilled you enjoyed the QR pass check-in speed.",
        time: "1 hour ago",
      },
    },
    {
      id: 2,
      eventId: 1,
      eventTitle: "Spring Annual Hackathon & Innovation Expo 2026",
      studentName: "Anonymous Student",
      isAnonymous: true,
      rating: 5,
      comment: "Loved the AI track workshops. Audio booth crew did a great job handling speakers.",
      submittedAt: "5 hours ago",
      categoryScores: { content: 5, venue: 4, organization: 5 },
      organizerReply: null,
    },
    {
      id: 3,
      eventId: 1,
      eventTitle: "Spring Annual Hackathon & Innovation Expo 2026",
      studentName: "Aarav Sharma",
      isAnonymous: false,
      rating: 4.8,
      comment: "Great energy and competition. Suggest providing extra extension cords for desk station 4 next year.",
      submittedAt: "1 day ago",
      categoryScores: { content: 5, venue: 4, organization: 4 },
      organizerReply: {
        author: "ACM Event Committee",
        text: "Great suggestion Aarav! We will add extra power strips for station 4 next edition.",
        time: "18 hours ago",
      },
    },
  ]);

  // Handle Submit Feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const newReview = {
      id: Date.now(),
      eventId,
      eventTitle: "Spring Annual Hackathon 2026",
      studentName: isAnonymous ? "Anonymous Student" : "Student Member",
      isAnonymous,
      rating: userRating,
      comment: userComment.trim(),
      submittedAt: "Just now",
      categoryScores: { ...categoryRatings },
      organizerReply: null,
    };

    setReviews([newReview, ...reviews]);
    setUserComment("");
    setShowSubmitModal(false);

    toast({
      title: "⭐ Feedback Submitted!",
      description: "Thank you for rating this event.",
    });
  };

  // Handle Organizer Reply
  const handleSendOrganizerReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyModalReview) return;

    setReviews(reviews.map(r => r.id === replyModalReview.id ? {
      ...r,
      organizerReply: {
        author: "Event Organizer Desk",
        text: replyText.trim(),
        time: "Just now",
      },
    } : r));

    setReplyText("");
    setReplyModalReview(null);

    toast({
      title: "💬 Reply Posted",
      description: "Response sent to student review.",
    });
  };

  // Calculate Average Metrics
  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1)).toFixed(1);

  const starBreakdown = [
    { stars: 5, pct: 85, count: 28 },
    { stars: 4, pct: 12, count: 4 },
    { stars: 3, pct: 3, count: 1 },
    { stars: 2, pct: 0, count: 0 },
    { stars: 1, pct: 0, count: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <Link href="/dashboard/organizer/events">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Events
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
              Event Feedback & Student Ratings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              5-star student ratings, verified comments, anonymous feedback, and official organizer replies.
            </p>
          </div>

          <Button size="sm" onClick={() => setShowSubmitModal(true)} className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Submit Event Review
          </Button>
        </div>

        {/* 1. RATINGS & CHARTS SUMMARY CARD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Average Rating Metric */}
          <Card className="md:col-span-4 border-border/60 shadow-2xs p-6 flex flex-col justify-center items-center text-center space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Student Rating</span>
            <div className="text-5xl font-serif font-bold text-foreground flex items-center gap-2">
              {avgRating} <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground">Based on {totalReviews} verified attendee reviews</p>
            <Badge className="bg-green-600 text-white font-bold text-[10px] mt-2">
              98% Satisfaction Score
            </Badge>
          </Card>

          {/* Star Rating Breakdown Bar Graph */}
          <Card className="md:col-span-8 border-border/60 shadow-2xs p-6 space-y-3">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-bold text-foreground">Star Distribution Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {starBreakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-12 text-muted-foreground flex items-center gap-1">
                    {row.stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="h-2.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-muted-foreground text-[10px]">{row.pct}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* REVIEWS LIST & ORGANIZER REPLIES */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Verified Student Reviews
            </h3>
          </div>

          <div className="space-y-6">
            {reviews.map((rev) => (
              <Card key={rev.id} className="p-6 border-border/60 shadow-xs space-y-4">
                
                {/* Top: Student Header & Rating Stars */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                      {rev.isAnonymous ? <EyeOff className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{rev.studentName}</h4>
                        {rev.isAnonymous ? (
                          <Badge variant="outline" className="text-[9px] bg-muted/50">Anonymous Feedback</Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white text-[9px]">Verified Attendee</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block">{rev.submittedAt}</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rev.rating) ? "fill-amber-500 text-amber-500" : "text-muted stroke-muted-foreground"}`}
                      />
                    ))}
                    <span className="ml-1.5 text-foreground">{rev.rating}</span>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/20 p-3.5 rounded-2xl border border-border/40">
                  "{rev.comment}"
                </p>

                {/* Organizer Reply Section */}
                {rev.organizerReply ? (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-1.5 ml-4 sm:ml-8">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span className="flex items-center gap-1.5">
                        <CornerDownRight className="w-4 h-4" /> Response from {rev.organizerReply.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">{rev.organizerReply.time}</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed pl-5">
                      {rev.organizerReply.text}
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyModalReview(rev)}
                      className="font-bold text-xs cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 mr-1 text-primary" /> Reply to Review
                    </Button>
                  </div>
                )}

              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* 1. SUBMIT FEEDBACK MODAL */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Submit Event Rating & Feedback
            </DialogTitle>
            <DialogDescription className="text-xs">
              Share your experience for <strong>Spring Annual Hackathon 2026</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-4 py-2">
            
            {/* Interactive 5-Star Selector */}
            <div className="space-y-1.5 text-center">
              <Label className="text-xs font-semibold text-muted-foreground">Select Star Rating</Label>
              <div className="flex justify-center items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= userRating ? "fill-amber-500 text-amber-500" : "text-muted stroke-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Your Feedback & Comments</Label>
              <Textarea
                placeholder="What did you enjoy about the event? Any suggestions for improvements?"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="h-24 text-xs"
              />
            </div>

            {/* Anonymous Feedback Switch */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-2xl border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">Post Anonymously</Label>
                <p className="text-[10px] text-muted-foreground">Hide your name and email on the review feed.</p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white">
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. ORGANIZER REPLY MODAL */}
      <Dialog open={!!replyModalReview} onOpenChange={() => setReplyModalReview(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2">
              <CornerDownRight className="w-5 h-5 text-primary" /> Reply to Student Review
            </DialogTitle>
            <DialogDescription className="text-xs">
              Replying to review by <strong>{replyModalReview?.studentName}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendOrganizerReply} className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-2xl border border-border/50 text-xs italic">
              "{replyModalReview?.comment}"
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Official Organizer Reply</Label>
              <Textarea
                placeholder="Write your response to the attendee..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="h-24 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReplyModalReview(null)}>Cancel</Button>
              <Button type="submit" className="font-bold text-xs">
                Post Reply
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
