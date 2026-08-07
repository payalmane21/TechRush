import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Award,
  Star,
  CheckCircle2,
  Users,
  Zap,
  Flame,
  ShieldCheck,
  Search,
  ArrowLeft,
  Sparkles,
  Crown,
  Medal,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [searchMember, setSearchMember] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Leaderboard Contributors Dataset
  const contributors = [
    {
      rank: 1,
      name: "Priya Patel",
      email: "priya@university.edu",
      points: 2850,
      badge: "🥇 Gold Volunteer",
      hours: 42,
      completedTasks: 34,
      attendanceRate: "99%",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      achievementsCount: 8,
    },
    {
      rank: 2,
      name: "Aarav Sharma",
      email: "aarav@university.edu",
      points: 2420,
      badge: "🥈 Silver Volunteer",
      hours: 36,
      completedTasks: 28,
      attendanceRate: "96%",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
      achievementsCount: 7,
    },
    {
      rank: 3,
      name: "Rohan Gupta",
      email: "rohan@university.edu",
      points: 2150,
      badge: "🥉 Bronze Volunteer",
      hours: 30,
      completedTasks: 22,
      attendanceRate: "94%",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      achievementsCount: 6,
    },
    {
      rank: 4,
      name: "Ananya Rao",
      email: "ananya@university.edu",
      points: 1890,
      badge: "⭐ Star Contributor",
      hours: 26,
      completedTasks: 19,
      attendanceRate: "95%",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100",
      achievementsCount: 5,
    },
    {
      rank: 5,
      name: "Kabir Verma",
      email: "kabir@university.edu",
      points: 1650,
      badge: "⚡ Speed Scanner",
      hours: 22,
      completedTasks: 16,
      attendanceRate: "92%",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
      achievementsCount: 4,
    },
  ];

  // Achievements Unlocked List
  const achievements = [
    { id: 1, title: "🚀 First Event Check-in", description: "Checked in to your first campus event", points: "+100 XP", unlocked: true, icon: "🎉" },
    { id: 2, title: "⚡ Speed Scanner Master", description: "Scanned 50+ attendee QR passes in under 10 minutes", points: "+300 XP", unlocked: true, icon: "⚡" },
    { id: 3, title: "🏆 Top Contributor Medal", description: "Ranked among top 3 campus event contributors", points: "+500 XP", unlocked: true, icon: "🥇" },
    { id: 4, title: "⏱️ 50+ Certified Hours", description: "Completed 50+ hours of verified volunteer service", points: "+400 XP", unlocked: true, icon: "⭐" },
    { id: 5, title: "👑 Master Event Organizer", description: "Successfully published and hosted 5+ events", points: "+600 XP", unlocked: false, icon: "👑" },
  ];

  const filteredContributors = contributors.filter(c => c.name.toLowerCase().includes(searchMember.toLowerCase()));
  const top3 = contributors.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
              Campus Volunteer Leaderboard & Achievements
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Top contributor rankings, volunteer XP points, shift task completion rates, badges, and achievement milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 shadow-md">
              🏆 Season 1 Live
            </Badge>
          </div>
        </div>

        {/* 🏆 PODIUM TOP 3 CONTRIBUTORS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Silver Rank 2 */}
          <Card className="border-border/60 shadow-lg p-6 rounded-3xl flex flex-col items-center text-center space-y-3 relative overflow-hidden bg-gradient-to-b from-slate-100/50 via-card to-card dark:from-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-sm shadow-md">2</div>
            <img src={top3[1].avatar} alt={top3[1].name} className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-300 shadow-md" />
            <div>
              <h3 className="font-bold text-lg text-foreground">{top3[1].name}</h3>
              <p className="text-xs text-muted-foreground">{top3[1].email}</p>
            </div>
            <Badge className="bg-slate-500 text-white font-bold text-xs">{top3[1].badge}</Badge>
            <div className="pt-2 border-t border-border w-full flex justify-around text-xs font-bold">
              <span>{top3[1].points} XP</span>
              <span>{top3[1].hours} Hours</span>
            </div>
          </Card>

          {/* Gold Rank 1 */}
          <Card className="border-2 border-amber-500/60 shadow-2xl p-6 rounded-3xl flex flex-col items-center text-center space-y-3 relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-card to-card -mt-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-base shadow-lg">
              <Crown className="w-6 h-6 fill-amber-300 text-white" />
            </div>
            <img src={top3[0].avatar} alt={top3[0].name} className="w-24 h-24 rounded-3xl object-cover border-4 border-amber-500 shadow-lg" />
            <div>
              <h3 className="font-serif font-bold text-xl text-foreground">{top3[0].name}</h3>
              <p className="text-xs text-muted-foreground">{top3[0].email}</p>
            </div>
            <Badge className="bg-amber-500 text-white font-bold text-xs shadow-md">{top3[0].badge}</Badge>
            <div className="pt-2 border-t border-border w-full flex justify-around text-xs font-bold text-amber-900 dark:text-amber-300">
              <span>🔥 {top3[0].points} XP</span>
              <span>⏱️ {top3[0].hours} Hours</span>
            </div>
          </Card>

          {/* Bronze Rank 3 */}
          <Card className="border-border/60 shadow-lg p-6 rounded-3xl flex flex-col items-center text-center space-y-3 relative overflow-hidden bg-gradient-to-b from-amber-700/10 via-card to-card">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-md">3</div>
            <img src={top3[2].avatar} alt={top3[2].name} className="w-20 h-20 rounded-3xl object-cover border-4 border-amber-700 shadow-md" />
            <div>
              <h3 className="font-bold text-lg text-foreground">{top3[2].name}</h3>
              <p className="text-xs text-muted-foreground">{top3[2].email}</p>
            </div>
            <Badge className="bg-amber-700 text-white font-bold text-xs">{top3[2].badge}</Badge>
            <div className="pt-2 border-t border-border w-full flex justify-around text-xs font-bold">
              <span>{top3[2].points} XP</span>
              <span>{top3[2].hours} Hours</span>
            </div>
          </Card>

        </div>

        {/* TABS: FULL LEADERBOARD TABLE & ACHIEVEMENTS */}
        <Tabs defaultValue="rankings" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="rankings" className="rounded-xl font-bold text-xs px-4">
              <Trophy className="w-3.5 h-3.5 mr-2 text-amber-500" /> Full Leaderboard Roster ({contributors.length})
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl font-bold text-xs px-4">
              <Award className="w-3.5 h-3.5 mr-2 text-primary" /> Unlocked Achievements ({achievements.filter(a => a.unlocked).length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FULL LEADERBOARD ROSTER */}
          <TabsContent value="rankings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Top Campus Contributors</h3>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search contributor name..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            <Card className="border-border/60 shadow-xs overflow-hidden rounded-3xl">
              <div className="divide-y divide-border">
                {filteredContributors.map((c) => (
                  <div key={c.rank} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        c.rank === 1 ? "bg-amber-500 text-white" : c.rank === 2 ? "bg-slate-300 text-slate-900" : c.rank === 3 ? "bg-amber-700 text-white" : "bg-muted text-foreground"
                      }`}>
                        #{c.rank}
                      </span>

                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-2xl object-cover border border-border shadow-2xs" />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                          <Badge variant="outline" className="text-[10px] font-bold">{c.badge}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.email} • {c.hours} Certified Hours • {c.completedTasks} Tasks Completed</p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-base font-serif font-bold text-primary block">🔥 {c.points.toLocaleString()} XP</span>
                      <span className="text-[10px] text-green-600 font-semibold block">{c.attendanceRate} Attendance Reliability</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: ACHIEVEMENTS MILESTONES */}
          <TabsContent value="achievements" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Badge & Milestone Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((a) => (
                <Card key={a.id} className={`p-6 border-border/60 shadow-xs space-y-3 rounded-3xl ${!a.unlocked && "opacity-60 bg-muted/20"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{a.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{a.title}</h4>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      </div>
                    </div>

                    <Badge className={a.unlocked ? "bg-green-600 text-white font-bold text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                      {a.unlocked ? "✓ Unlocked" : "Locked"}
                    </Badge>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-border/40 text-xs">
                    <span className="font-bold text-primary">{a.points} Reward</span>
                    {a.unlocked && <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Claimed</span>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </DashboardLayout>
  );
}
