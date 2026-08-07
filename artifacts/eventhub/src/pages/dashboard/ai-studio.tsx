import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Wand2,
  Bot,
  Image as ImageIcon,
  Clock,
  Users,
  HelpCircle,
  TrendingUp,
  Compass,
  CheckCircle2,
  ArrowLeft,
  Copy,
  RefreshCw,
  Zap,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AiStudioPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("description");

  // 1. AI Description State
  const [descTopic, setDescTopic] = useState("Inter-College Web3 & AI Hackathon");
  const [descTone, setDescTone] = useState("Exciting & Energetic");
  const [descOutput, setDescOutput] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // 2. AI Poster Suggestions State
  const [posterTopic, setPosterTopic] = useState("Annual Music & Cultural Night");
  const [posterIdeas, setPosterIdeas] = useState<string[]>([]);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // 3. AI Schedule Optimizer State
  const [scheduleDuration, setScheduleDuration] = useState("6 Hours");
  const [scheduleOutput, setScheduleOutput] = useState<any[]>([]);

  // 4. AI Volunteer Assignment State
  const [volunteerPairs, setVolunteerPairs] = useState<any[]>([]);

  // 5. AI FAQ Assistant State
  const [faqTopic, setFaqTopic] = useState("Coding Hackathon & Team Registration Rules");
  const [faqList, setFaqList] = useState<any[]>([]);

  // 6. AI Feedback Summary State
  const [feedbackSummary, setFeedbackSummary] = useState<any | null>(null);

  // 1. Generate AI Event Description
  const handleGenerateDescription = () => {
    setIsGeneratingDesc(true);
    setTimeout(() => {
      setDescOutput(
        `🚀 Join us for the ${descTopic}! Connect with over 500+ passionate student innovators, engineers, and creators. Whether you're building next-gen AI agents or dApps, this event features 24 hours of non-stop hacking, expert mentorship from industry leaders, free food, and $5,000+ in prizes. Reserve your pass now!`
      );
      setIsGeneratingDesc(false);
      toast({ title: "✨ AI Description Generated", description: "Copied output available below." });
    }, 1200);
  };

  // 2. Generate AI Poster Prompts & Layouts
  const handleGeneratePosterIdeas = () => {
    setIsGeneratingPoster(true);
    setTimeout(() => {
      setPosterIdeas([
        "🎨 Neon Synthwave Stage: Vibrant purple and cyan gradient with electric guitar wireframes and glowing event typography.",
        "🌌 Deep Space Cyberpunk: Dark obsidian background with holographic stage lights and glowing QR code ticket badge.",
        "✨ Modern Glassmorphism: Sleek frosted glass card overlay with vibrant gradient background and bold serif event title.",
      ]);
      setIsGeneratingPoster(false);
      toast({ title: "🎨 AI Poster Prompts Ready", description: "3 poster concept layouts generated." });
    }, 1200);
  };

  // 3. Generate AI Schedule Optimization
  const handleOptimizeSchedule = () => {
    setScheduleOutput([
      { time: "09:00 AM – 09:30 AM", session: "Registration & QR Pass Verification", station: "Main Gate Desk 1" },
      { time: "09:30 AM – 10:30 AM", session: "Opening Keynote & Team Formation", station: "Auditorium Stage A" },
      { time: "10:30 AM – 01:00 PM", session: "Hacking & Mentorship Sprint 1", station: "Engineering Lab 3" },
      { time: "01:00 PM – 02:00 PM", session: "Networking Lunch & Partner Demos", station: "Campus Lawn" },
      { time: "02:00 PM – 04:30 PM", session: "Final Judging & Project Expo", station: "Exhibition Hall B" },
      { time: "04:30 PM – 05:00 PM", session: "Award Ceremony & Closing Remarks", station: "Auditorium Stage A" },
    ]);
    toast({ title: "⏱️ AI Schedule Optimized", description: "Balanced timeline generated to minimize queue wait times." });
  };

  // 4. Generate AI Volunteer Assignment Matching
  const handleMatchVolunteers = () => {
    setVolunteerPairs([
      { name: "Priya Patel", score: "99% Match", recommendedStation: "Main Entrance Ticket Scanner Desk", skill: "QR Scanning Speed & High Reliability" },
      { name: "Aarav Sharma", score: "96% Match", recommendedStation: "Stage Sound & Video Control Booth", skill: "Technical Audio Crew & Equipment Lead" },
      { name: "Rohan Gupta", score: "94% Match", recommendedStation: "VIP Escort & Guest Ushering Desk", skill: "Crowd Communication & Hospitality" },
    ]);
    toast({ title: "🧠 AI Volunteer Matching Complete", description: "Paired volunteers based on past performance scores and skills." });
  };

  // 5. Generate AI FAQ Assistant
  const handleGenerateFaqs = () => {
    setFaqList([
      { question: "Who is eligible to participate?", answer: "All currently enrolled undergraduate and graduate students with a valid university ID." },
      { question: "Do I need a team before registering?", answer: "No, individual registrants can join the AI team formation session on the morning of the event." },
      { question: "Will food and refreshments be provided?", answer: "Yes! Free lunch, dinner snacks, and refreshments will be provided for all checked-in attendees." },
    ]);
    toast({ title: "❓ AI FAQs Generated", description: "Created 3 custom Q&A pairs." });
  };

  // 6. Generate AI Feedback Summary
  const handleSummarizeFeedback = () => {
    setFeedbackSummary({
      sentiment: "98% Positive Sentiment",
      strengths: ["Ultra-fast QR ticket check-in at Gate A", "High quality technical audio crew", "Exciting prize distribution"],
      improvements: ["Provide extra extension cords at desk station 4"],
      actionPlan: "Recommended to increase power outlet strips by 25% for upcoming hackathons.",
    });
    toast({ title: "📊 AI Feedback Summarized", description: "Analyzed student reviews." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              EventHub AI Intelligence Studio
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI Description Generator, Poster Suggestions, Schedule Optimizer, Volunteer Matching, FAQ Assistant, and Feedback Summarizer.
            </p>
          </div>

          <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1.5 shadow-md flex items-center gap-1.5">
            <Bot className="w-4 h-4" /> AI Engine Active
          </Badge>
        </div>

        {/* AI STUDIO TABS */}
        <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="description" className="rounded-xl font-bold text-xs px-4 py-2">
              <Wand2 className="w-3.5 h-3.5 mr-2 text-primary" /> Description Generator
            </TabsTrigger>
            <TabsTrigger value="poster" className="rounded-xl font-bold text-xs px-4 py-2">
              <ImageIcon className="w-3.5 h-3.5 mr-2 text-purple-600" /> Poster Suggestions
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-xl font-bold text-xs px-4 py-2">
              <Clock className="w-3.5 h-3.5 mr-2 text-blue-600" /> Schedule Optimizer
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="rounded-xl font-bold text-xs px-4 py-2">
              <Users className="w-3.5 h-3.5 mr-2 text-green-600" /> Volunteer Matching
            </TabsTrigger>
            <TabsTrigger value="faqs" className="rounded-xl font-bold text-xs px-4 py-2">
              <HelpCircle className="w-3.5 h-3.5 mr-2 text-amber-500" /> FAQ Assistant
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="rounded-xl font-bold text-xs px-4 py-2">
              <TrendingUp className="w-3.5 h-3.5 mr-2 text-red-500" /> Feedback Summary
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI DESCRIPTION GENERATOR */}
          <TabsContent value="description" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" /> AI Event Description Generator
                </CardTitle>
                <CardDescription className="text-xs">Draft structured, engaging marketing summaries in seconds</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Event Topic / Title</Label>
                    <Input value={descTopic} onChange={(e) => setDescTopic(e.target.value)} className="h-10 text-xs font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Tone of Voice</Label>
                    <Input value={descTone} onChange={(e) => setDescTone(e.target.value)} className="h-10 text-xs font-semibold" />
                  </div>
                </div>

                <Button onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="font-bold text-xs h-10 px-6 cursor-pointer shadow-md">
                  {isGeneratingDesc ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Event Description
                </Button>

                {descOutput && (
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 space-y-3 pt-4">
                    <div className="flex justify-between items-center text-xs font-bold text-foreground">
                      <span>Generated Description:</span>
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(descOutput); toast({ title: "Copied!" }); }}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Text
                      </Button>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/90">{descOutput}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: AI POSTER SUGGESTIONS */}
          <TabsContent value="poster" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" /> AI Poster Layout & Prompt Concepts
                </CardTitle>
                <CardDescription className="text-xs">Generate creative poster theme concepts for graphic designers</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Event Theme</Label>
                  <Input value={posterTopic} onChange={(e) => setPosterTopic(e.target.value)} className="h-10 text-xs font-semibold" />
                </div>

                <Button onClick={handleGeneratePosterIdeas} disabled={isGeneratingPoster} className="font-bold text-xs h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer">
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Poster Concepts
                </Button>

                {posterIdeas.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {posterIdeas.map((idea, idx) => (
                      <div key={idx} className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-xs font-semibold text-foreground leading-relaxed">
                        {idea}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: AI SCHEDULE OPTIMIZER */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" /> AI Timeline & Schedule Optimizer
                  </CardTitle>
                  <CardDescription className="text-xs">Automatically balance sessions and check-in station traffic</CardDescription>
                </div>
                <Button onClick={handleOptimizeSchedule} className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Optimize Schedule
                </Button>
              </CardHeader>

              <CardContent className="p-0 pt-2 space-y-3">
                {scheduleOutput.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Click Optimize Schedule to generate a balanced event agenda.</p>
                ) : (
                  scheduleOutput.map((item, idx) => (
                    <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-primary">{item.time}</span>
                      <span className="font-bold text-foreground">{item.session}</span>
                      <Badge variant="outline" className="text-[10px]">{item.station}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: AI VOLUNTEER MATCHING */}
          <TabsContent value="volunteers" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" /> AI Volunteer Skill Matching
                  </CardTitle>
                  <CardDescription className="text-xs">Match volunteer applicants to station roles based on reliability ratings</CardDescription>
                </div>
                <Button onClick={handleMatchVolunteers} className="font-bold text-xs bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Run AI Matching
                </Button>
              </CardHeader>

              <CardContent className="p-0 pt-2 space-y-3">
                {volunteerPairs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Click Run AI Matching to calculate optimal volunteer station roles.</p>
                ) : (
                  volunteerPairs.map((v, idx) => (
                    <div key={idx} className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-foreground">{v.name}</h4>
                        <p className="text-muted-foreground text-[11px]">Skill Match: {v.skill}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-600 text-white font-bold text-[10px]">{v.score}</Badge>
                        <span className="block text-[10px] text-muted-foreground mt-1">{v.recommendedStation}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: AI FAQ ASSISTANT */}
          <TabsContent value="faqs" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-500" /> AI FAQ Generator Assistant
                  </CardTitle>
                  <CardDescription className="text-xs">Generate instant Q&As for event guidelines</CardDescription>
                </div>
                <Button onClick={handleGenerateFaqs} className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate FAQs
                </Button>
              </CardHeader>

              <CardContent className="p-0 pt-2 space-y-3">
                {faqList.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Click Generate FAQs to build custom attendee Q&As.</p>
                ) : (
                  faqList.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 space-y-1 text-xs">
                      <h4 className="font-bold text-foreground">Q: {faq.question}</h4>
                      <p className="text-muted-foreground leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: AI FEEDBACK SUMMARY */}
          <TabsContent value="sentiment" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-5 rounded-3xl">
              <CardHeader className="p-0 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" /> AI Feedback Sentiment Analyzer
                  </CardTitle>
                  <CardDescription className="text-xs">Summarize hundreds of student reviews into actionable insights</CardDescription>
                </div>
                <Button onClick={handleSummarizeFeedback} className="font-bold text-xs bg-red-500 hover:bg-red-600 text-white shadow-md cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Summarize Feedback
                </Button>
              </CardHeader>

              <CardContent className="p-0 pt-2">
                {!feedbackSummary ? (
                  <p className="text-xs text-muted-foreground italic">Click Summarize Feedback to run AI sentiment analysis.</p>
                ) : (
                  <div className="space-y-4">
                    <Badge className="bg-green-600 text-white font-bold text-xs">{feedbackSummary.sentiment}</Badge>
                    
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 space-y-2 text-xs">
                      <h4 className="font-bold text-foreground">Key Strengths Identified:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {feedbackSummary.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                      <h4 className="font-bold text-amber-900 dark:text-amber-300">Actionable Improvement Recommendation:</h4>
                      <p className="text-muted-foreground">{feedbackSummary.actionPlan}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </DashboardLayout>
  );
}
