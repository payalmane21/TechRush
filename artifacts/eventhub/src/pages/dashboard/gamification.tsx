import React, { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Sparkles,
  Trophy,
  Flame,
  Award,
  Zap,
  Coins,
  Gift,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GamificationHub() {
  const { toast } = useToast();

  // Gamification Stats State
  const [userStats, setUserStats] = useState({
    level: 8,
    levelTitle: "Master Campus Ambassador",
    xp: 2850,
    nextLevelXp: 3000,
    coins: 450,
    dailyStreak: 7,
  });

  // Rewards Marketplace Items
  const [rewardsStore, setRewardsStore] = useState([
    { id: 1, title: "☕ Free Campus Café Coffee Voucher", cost: 100, category: "Perks", icon: "☕", claimed: false },
    { id: 2, title: "🎟️ Front Row VIP Pass (Tech Fest 2026)", cost: 250, category: "VIP Pass", icon: "🎟️", claimed: false },
    { id: 3, title: "👕 EventHub Official Tech T-Shirt", cost: 400, category: "Merch", icon: "👕", claimed: false },
    { id: 4, title: "📚 Library Priority Reserve Pass", cost: 150, category: "Academic", icon: "📚", claimed: false },
  ]);

  // Milestone Achievements
  const [milestones, setMilestones] = useState([
    { id: 101, title: "🔥 7-Day Active Streak", progress: 7, max: 7, reward: "+150 XP & 50 Coins", unlocked: true, icon: "🔥" },
    { id: 102, title: "🎟️ Pass Collector (10 Events)", progress: 8, max: 10, reward: "+300 XP & 100 Coins", unlocked: false, icon: "🎟️" },
    { id: 103, title: "⚡ Shift Scanner Pro (5 Shifts)", progress: 5, max: 5, reward: "+400 XP & 150 Coins", unlocked: true, icon: "⚡" },
    { id: 104, title: "⭐ 50+ Certified Hours", progress: 32, max: 50, reward: "+500 XP & 200 Coins", unlocked: false, icon: "⭐" },
  ]);

  // Redemption Modal State
  const [selectedReward, setSelectedReward] = useState<any | null>(null);

  // Handle Redeem Reward
  const handleRedeemReward = (reward: any) => {
    if (userStats.coins < reward.cost) {
      toast({
        title: "❌ Insufficient Coins",
        description: `You need ${reward.cost - userStats.coins} more Event Coins to redeem this perk.`,
      });
      return;
    }

    setUserStats({
      ...userStats,
      coins: userStats.coins - reward.cost,
    });

    setRewardsStore(rewardsStore.map(r => r.id === reward.id ? { ...r, claimed: true } : r));
    setSelectedReward(null);

    toast({
      title: "🎉 Reward Claimed!",
      description: `Redeemed "${reward.title}". Voucher saved to your wallet.`,
    });
  };

  const xpProgress = Math.round((userStats.xp / userStats.nextLevelXp) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              EventHub Campus Gamification Engine
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Earn XP, level up your rank, maintain daily streaks, unlock badges, and redeem Event Coins for real campus perks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1.5 shadow-md flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> {userStats.coins} Event Coins
            </Badge>
          </div>
        </div>

        {/* 1. LEVEL PROGRESS & STREAK BANNER */}
        <Card className="border-border/60 shadow-xl rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-accent text-accent-foreground flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-white/20 shrink-0">
                Lvl {userStats.level}
              </div>

              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider block">CURRENT RANK</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">{userStats.levelTitle}</h2>
              </div>
            </div>

            {/* Daily Streak Counter */}
            <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/20">
              <Flame className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <span className="text-xl font-bold text-white block">{userStats.dailyStreak}-Day Streak!</span>
                <span className="text-[10px] text-white/80">Logged in 7 consecutive days</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>XP Level Progress: {userStats.xp} / {userStats.nextLevelXp} XP</span>
              <span>{userStats.nextLevelXp - userStats.xp} XP to Level {userStats.level + 1}</span>
            </div>
            <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div className="h-full bg-accent rounded-full transition-all shadow-md" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

        </Card>

        {/* 2. STATS SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP Earned</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-foreground">🔥 {userStats.xp}</div>
              <span className="text-xs text-green-600 font-semibold">+150 XP today</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Coins Wallet</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-amber-500">🪙 {userStats.coins}</div>
              <span className="text-xs text-muted-foreground">Redeemable in Store</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unlocked Badges</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-purple-600">🏅 6 / 8</div>
              <span className="text-xs text-muted-foreground">2 Badges Remaining</span>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-2xs">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Streak</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-3xl font-serif font-bold text-amber-600">⚡ 7 Days</div>
              <span className="text-xs text-amber-600 font-semibold">+20 Bonus Coins Daily</span>
            </CardContent>
          </Card>
        </div>

        {/* TABS: REWARDS MARKETPLACE & MILESTONES */}
        <Tabs defaultValue="store" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="store" className="rounded-xl font-bold text-xs px-4 py-2">
              <ShoppingBag className="w-3.5 h-3.5 mr-2 text-amber-500" /> Rewards Marketplace ({rewardsStore.length})
            </TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-xl font-bold text-xs px-4 py-2">
              <Trophy className="w-3.5 h-3.5 mr-2 text-primary" /> Milestones & Quests ({milestones.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: REWARDS STORE */}
          <TabsContent value="store" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-2xl text-foreground">Redeem Event Coins for Campus Perks</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rewardsStore.map((item) => (
                <Card key={item.id} className="p-6 border-border/60 shadow-xs flex flex-col justify-between space-y-4 rounded-3xl hover:border-amber-500/50 transition-all">
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-2xl border border-amber-500/20">
                      {item.icon}
                    </div>

                    <div>
                      <Badge variant="outline" className="text-[10px] font-bold mb-1">{item.category}</Badge>
                      <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="text-amber-600">🪙 {item.cost} Coins</span>
                    </div>

                    {item.claimed ? (
                      <Button disabled className="w-full font-bold text-xs bg-green-600 text-white">
                        <Check className="w-3.5 h-3.5 mr-1" /> Claimed Voucher
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRedeemReward(item)}
                        disabled={userStats.coins < item.cost}
                        className="w-full font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-2xs cursor-pointer"
                      >
                        Redeem Perk
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: MILESTONES & QUESTS */}
          <TabsContent value="milestones" className="space-y-6">
            <h3 className="font-serif font-bold text-2xl text-foreground">Active Quests & Milestones</h3>
            <div className="space-y-4">
              {milestones.map((m) => (
                <Card key={m.id} className="p-6 border-border/60 shadow-xs space-y-3 rounded-3xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{m.icon}</span>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{m.title}</h4>
                        <p className="text-xs text-muted-foreground">Reward: <strong>{m.reward}</strong></p>
                      </div>
                    </div>

                    <Badge className={m.unlocked ? "bg-green-600 text-white font-bold text-[10px]" : "bg-amber-500 text-white font-bold text-[10px]"}>
                      {m.unlocked ? "✓ Completed" : `${m.progress} / ${m.max}`}
                    </Badge>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((m.progress / m.max) * 100)}%` }} />
                    </div>
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
