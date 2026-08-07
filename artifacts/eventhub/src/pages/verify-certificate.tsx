import React from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Award, ArrowLeft, ExternalLink, QrCode } from "lucide-react";

export default function VerifyCertificatePage() {
  const params = useParams<{ id: string }>();
  const certId = params.id || "CERT-2026-HACK-9842";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full space-y-6">
        
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground font-semibold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to EventHub Main Site
          </Button>
        </Link>

        {/* Verification Card */}
        <Card className="border-2 border-green-500/40 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center font-bold border border-green-500/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <Badge className="bg-green-600 text-white font-bold text-xs mb-1">
                Official Certificate Verified ✓
              </Badge>
              <h1 className="font-serif font-bold text-2xl text-foreground">University Event Certificate</h1>
              <p className="text-xs text-muted-foreground font-mono">Serial ID: {certId}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 bg-muted/40 p-5 rounded-2xl border border-border/50 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Recipient Student:</span>
              <span className="font-bold text-foreground">Priya Patel</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Event Title:</span>
              <span className="font-bold text-foreground">Spring Annual Hackathon & Innovation Expo 2026</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Award / Role:</span>
              <span className="font-bold text-primary">First Place Winner & Participant</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Issue Date:</span>
              <span className="font-bold text-foreground">April 15, 2026</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Issuing Authority:</span>
              <span className="font-bold text-foreground">Dr. Rajesh K. Verma (Dean of Student Affairs)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1 font-semibold text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Tamper-proof Record
            </span>
            <Link href="/dashboard/certificates">
              <Button size="sm" variant="outline" className="font-bold text-xs">
                View Certificate Studio
              </Button>
            </Link>
          </div>

        </Card>

      </div>
    </div>
  );
}
