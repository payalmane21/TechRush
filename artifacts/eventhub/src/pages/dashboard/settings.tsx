import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Palette,
  Bell,
  Globe,
  ShieldCheck,
  Lock,
  Trash2,
  KeyRound,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  // Color Theme State
  const [activeTheme, setActiveTheme] = useState("indigo");

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    eventReminders: true,
    weeklyDigest: true,
  });

  // Language Preference State
  const [language, setLanguage] = useState("en");

  // Privacy Preference State
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showLeaderboardScore: true,
    anonymousFeedbackDefault: false,
  });

  // Security & 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  // Toggle Dark Mode
  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast({
      title: checked ? "🌙 Dark Mode Enabled" : "☀️ Light Mode Enabled",
      description: "Interface theme preference saved.",
    });
  };

  // Handle Save Notifications
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "🔔 Notifications Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ title: "Error", description: "Please complete all password fields.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast({
      title: "🔑 Password Changed!",
      description: "Your security credentials have been updated.",
    });
  };

  // Handle Delete Account
  const handleDeleteAccountConfirm = () => {
    if (confirmDeleteText !== "DELETE") {
      toast({ title: "Error", description: "Type DELETE to confirm account removal.", variant: "destructive" });
      return;
    }
    setDeleteModalOpen(false);
    toast({
      title: "Account Marked for Deletion",
      description: "You have been logged out.",
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-primary" />
              Account & Application Settings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Dark mode, color themes, notification preferences, language, privacy, 2FA security, and password management.
            </p>
          </div>
        </div>

        {/* SETTINGS TABS */}
        <Tabs defaultValue="appearance" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="appearance" className="rounded-xl font-bold text-xs px-4 py-2">
              <Palette className="w-3.5 h-3.5 mr-2 text-primary" /> Dark Mode & Theme
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl font-bold text-xs px-4 py-2">
              <Bell className="w-3.5 h-3.5 mr-2 text-amber-500" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-xl font-bold text-xs px-4 py-2">
              <Globe className="w-3.5 h-3.5 mr-2 text-blue-600" /> Language & Locale
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-xl font-bold text-xs px-4 py-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-2 text-green-600" /> Privacy & Security
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-xl font-bold text-xs px-4 py-2">
              <KeyRound className="w-3.5 h-3.5 mr-2 text-purple-600" /> Change Password
            </TabsTrigger>
            <TabsTrigger value="danger" className="rounded-xl font-bold text-xs px-4 py-2 text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DARK MODE & THEMES */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-6 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" /> Appearance & Theme Customization
                </CardTitle>
                <CardDescription className="text-xs">Toggle dark mode and accent color themes</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                
                {/* Functional Light and Dark Theme Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => toggleDarkMode(false)}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center ${
                      !isDarkMode ? "border-primary bg-primary/5 font-bold shadow-sm" : "border-border/60 hover:bg-muted/30 opacity-70"
                    }`}
                  >
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                      <Sun className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">Light Mode</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Clean, high-contrast daytime interface</p>
                    </div>
                    {!isDarkMode && (
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px] mt-1">Active Theme</Badge>
                    )}
                  </div>

                  <div
                    onClick={() => toggleDarkMode(true)}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center ${
                      isDarkMode ? "border-primary bg-primary/5 font-bold shadow-sm" : "border-border/60 hover:bg-muted/30 opacity-70"
                    }`}
                  >
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                      <Moon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">Dark Mode</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Sleek, low-light evening interface</p>
                    </div>
                    {isDarkMode && (
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px] mt-1">Active Theme</Badge>
                    )}
                  </div>
                </div>

                {/* Quick Theme Switch Bar */}
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Dark Mode Toggle</h4>
                      <p className="text-xs text-muted-foreground">Instantly switch between Light and Dark modes</p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: NOTIFICATIONS PREFERENCES */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-6 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> Notification Preferences
                </CardTitle>
                <CardDescription className="text-xs">Manage event reminders and email notification alerts</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  {[
                    { key: "emailAlerts", title: "Email Notifications", desc: "Receive email updates for event approvals and shift assignments." },
                    { key: "pushNotifications", title: "Browser Push Alerts", desc: "Get real-time desktop push alerts when an event is starting." },
                    { key: "smsAlerts", title: "SMS Urgent Alerts", desc: "Receive instant text messages for volunteer shift changes." },
                    { key: "eventReminders", title: "Event Reminders", desc: "Send 1-hour and 1-day reminders for registered passes." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={(notifications as any)[item.key]}
                        onCheckedChange={(val) => setNotifications({ ...notifications, [item.key]: val })}
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button type="submit" className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-2xs">
                      Save Notification Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: LANGUAGE & LOCALE */}
          <TabsContent value="language" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-6 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> Language & Regional Settings
                </CardTitle>
                <CardDescription className="text-xs">Select your preferred system interface language</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                <div className="space-y-1.5 max-w-sm">
                  <Label className="text-xs font-semibold text-muted-foreground">Display Language</Label>
                  <Select value={language} onValueChange={(val) => { setLanguage(val); toast({ title: "Language Preference Saved" }); }}>
                    <SelectTrigger className="h-11 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: PRIVACY & 2FA SECURITY */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-6 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" /> Privacy & Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-xs">Manage profile visibility and 2FA authentication</CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                
                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security using Google Authenticator</p>
                    </div>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={(val) => { setTwoFactorEnabled(val); toast({ title: val ? "2FA Enabled" : "2FA Disabled" }); }} />
                </div>

                {/* Privacy Toggles */}
                {[
                  { key: "publicProfile", title: "Public Student Profile", desc: "Allow other campus members to view your skills and verified badges." },
                  { key: "showLeaderboardScore", title: "Display on Leaderboard", desc: "Show your name and XP points on the campus leaderboard." },
                  { key: "anonymousFeedbackDefault", title: "Default Feedback to Anonymous", desc: "Automatically post event reviews without revealing your student name." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/50">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(privacy as any)[item.key]}
                      onCheckedChange={(val) => setPrivacy({ ...privacy, [item.key]: val })}
                    />
                  </div>
                ))}

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: CHANGE PASSWORD */}
          <TabsContent value="password" className="space-y-6">
            <Card className="border-border/60 shadow-xs p-6 space-y-6 rounded-3xl max-w-xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-600" /> Change Account Password
                </CardTitle>
                <CardDescription className="text-xs">Update your security password for EventHub</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="h-10 text-xs"
                    />
                  </div>

                  <Button type="submit" className="font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-2xs">
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: DANGER ZONE / DELETE ACCOUNT */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive/40 bg-destructive/5 p-6 space-y-4 rounded-3xl">
              <CardHeader className="p-0">
                <CardTitle className="font-serif font-bold text-xl text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone — Delete Account
                </CardTitle>
                <CardDescription className="text-xs text-destructive/80">
                  Permanently delete your EventHub account, registered ticket passes, and volunteer service history.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} className="font-bold text-xs shadow-md cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action cannot be undone. Type <strong>DELETE</strong> below to permanently erase your profile and records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              placeholder="Type DELETE to confirm..."
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              className="h-10 text-xs font-mono font-bold"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccountConfirm} className="font-bold text-xs">
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
