import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Mail, CheckCircle2, ShieldCheck, ArrowRight, LayoutDashboard, RotateCcw, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function VerifyEmail() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Read URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const emailParam = searchParams.get("email") || user?.email || localStorage.getItem("pending_verify_email") || "";
  const otpParam = searchParams.get("otp") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(otpParam);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.isEmailVerified || false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate Limiting Resend Timer State
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (emailParam && !email) setEmail(emailParam);
    if (otpParam && !otp) setOtp(otpParam);

    // Auto-trigger verification if both email and OTP are present in URL
    if (emailParam && otpParam && !isVerified && !verifying) {
      verifyCode(emailParam, otpParam);
    }
  }, [emailParam, otpParam]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const verifyCode = async (targetEmail: string, targetOtp: string) => {
    if (!targetEmail || !targetOtp || targetOtp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    setVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, otp: targetOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setIsVerified(true);
      if (data.token) {
        localStorage.setItem("eventhub_token", data.token);
      }
      localStorage.removeItem("pending_verify_email");
      queryClient.setQueryData(getGetMeQueryKey(), data.user);

      toast({
        title: "🎉 Account Verified Successfully!",
        description: `Welcome to EventHub, ${data.user.name}!`,
      });

      setTimeout(() => {
        const role = data.user.role;
        if (role === "attendee") setLocation("/dashboard/attendee");
        else if (role === "volunteer") setLocation("/dashboard/volunteer");
        else setLocation("/dashboard/organizer");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
      toast({
        title: "Verification Failed",
        description: err.message || "Please check your OTP code and try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleResendOtp = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setResending(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setResendCooldown(60); // 60-second cooldown

      if (data.emailPreviewUrl) {
        setPreviewUrl(data.emailPreviewUrl);
      }
      if (data.codeHint) {
        setDevOtp(data.codeHint);
        setOtp(data.codeHint);
      }

      toast({
        title: "✉️ Verification Code Sent!",
        description: `A fresh 6-digit OTP code was sent to ${email}.`,
      });
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: err.message || "Please wait before requesting another code.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 py-12">
      <div className="w-full max-w-md text-center">
        
        {/* Logo Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">EventHub</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold mt-4 text-foreground">Email Verification</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your 6-digit OTP verification code</p>
        </div>

        <Card className="border border-border shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            {isVerified ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <Mail className="w-8 h-8 text-primary" />}
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl text-foreground">
              {isVerified ? "Account Verified!" : "Check Your Inbox"}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {isVerified 
                ? "Your email address is confirmed. Redirecting to your personal dashboard..."
                : `We sent a 6-digit verification code to `}
              {!isVerified && <strong className="text-foreground">{email || "your email address"}</strong>}
            </p>
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold p-3 rounded-xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isVerified ? (
            <div className="space-y-4 pt-2">
              
              {/* Email Field if empty */}
              {!emailParam && (
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              )}

              {/* 6-Digit OTP Box */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">6-Digit Verification Code</label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-14 text-center font-mono text-2xl font-black tracking-[10px] rounded-2xl border-2 border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button 
                onClick={() => verifyCode(email, otp)} 
                className="w-full h-11 font-bold shadow-md cursor-pointer text-sm" 
                disabled={verifying || otp.length !== 6}
              >
                {verifying ? "Verifying Code..." : "Verify & Activate Account →"}
              </Button>

              {/* Local Dev Ethereal HTML Email Inbox Notice */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Delivered HTML Email Preview</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  If live SMTP credentials are not configured, emails are auto-delivered via Ethereal Test SMTP.
                </p>
                <div className="pt-1 flex flex-col gap-2">
                  {previewUrl ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-primary/90 shadow-sm transition-all"
                    >
                      📬 Open Delivered HTML Email Inbox →
                    </a>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendOtp}
                      className="text-xs font-bold w-full bg-background"
                    >
                      📬 Click to Fetch Ethereal Email Preview Link
                    </Button>
                  )}
                </div>
              </div>

              {/* Resend Code Action */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Didn't receive the email?</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resending || resendCooldown > 0}
                  className="text-xs font-bold text-primary hover:underline p-0 h-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setLocation("/dashboard/attendee")} className="w-full h-11 font-bold shadow-md">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Proceed to Dashboard
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
