import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      toast({
        title: "🎉 Password Reset Successful!",
        description: "Your password has been updated. Please log in with your new password.",
      });
      setLocation("/login");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.message || "Invalid or expired token.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 py-12">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">EventHub</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold mt-4 text-foreground">Set New Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your token and set a secure password</p>
        </div>

        <Card className="border border-border shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reset Authorization Token</Label>
              <Input
                id="token"
                placeholder="RESET-XXXXXX"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-11 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <Button type="submit" className="w-full h-11 font-bold shadow-md cursor-pointer mt-2" disabled={loading}>
              {loading ? "Updating Password..." : "Update Password & Log In"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            <Link href="/login" className="inline-flex items-center gap-1 hover:text-primary font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
