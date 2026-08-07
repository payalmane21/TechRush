import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, KeyRound, ArrowLeft, Mail, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");

      setSubmitted(true);
      if (data.emailPreviewUrl) setEmailPreviewUrl(data.emailPreviewUrl);
      if (data.devResetLinkPreview) setDevResetLink(data.devResetLinkPreview);

      toast({
        title: "🔒 Reset Request Processed",
        description: "If an account exists, a reset link was dispatched.",
      });
    } catch (err: any) {
      toast({
        title: "Request Failed",
        description: err.message || "An error occurred.",
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
          <h1 className="text-2xl font-serif font-bold mt-4 text-foreground">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your registered email to reset your password</p>
        </div>

        <Card className="border border-border shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@university.edu or user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 text-xs rounded-xl"
                    required
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-bold shadow-md cursor-pointer text-sm" disabled={loading}>
                {loading ? "Processing..." : "Send Password Reset Link →"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-foreground">Check Your Inbox</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  If an account is associated with <strong className="text-foreground">{email}</strong>, we have sent a password reset link to your email address. The link expires in <strong>15 minutes</strong>.
                </p>
              </div>

              {emailPreviewUrl && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Delivered HTML Reset Email</span>
                  </div>
                  <a
                    href={emailPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-primary/90 w-full shadow-sm transition-all"
                  >
                    📬 Open Reset Email Inbox in New Tab →
                  </a>
                </div>
              )}

              {devResetLink && !emailPreviewUrl && (
                <Button
                  className="w-full h-11 font-bold shadow-md text-xs"
                  onClick={() => window.location.href = devResetLink}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Password Reset Page →
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full h-10 font-bold text-xs"
                onClick={() => setSubmitted(false)}
              >
                Try another email address
              </Button>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
            <Link href="/login" className="inline-flex items-center gap-1 hover:text-primary font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
