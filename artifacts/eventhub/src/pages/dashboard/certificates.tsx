import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Download,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Printer,
  Share2,
  Palette,
  ExternalLink,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CertificatesStudio() {
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();

  // Certificate State
  const [selectedTemplate, setSelectedTemplate] = useState<"gold" | "modern" | "tech">("gold");
  const [certificateData, setCertificateData] = useState({
    certId: "CERT-2026-HACK-9842",
    recipientName: "Priya Patel",
    eventTitle: "Spring Annual Hackathon & Innovation Expo 2026",
    role: "First Place Winner & Participant",
    issueDate: "April 15, 2026",
    organizerName: "Dr. Rajesh K. Verma",
    organizerTitle: "Dean of Student Affairs & Head Organizer",
    signatureUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_example.svg",
    verificationUrl: "http://localhost:5000/verify-certificate/CERT-2026-HACK-9842",
  });

  // User Certificate List
  const userCertificates = [
    {
      id: "CERT-2026-HACK-9842",
      eventTitle: "Spring Annual Hackathon 2026",
      role: "First Place Winner",
      date: "Apr 15, 2026",
      template: "gold",
    },
    {
      id: "CERT-2026-CULT-4410",
      eventTitle: "Grand Cultural Fest 2026",
      role: "Lead Event Usher & Volunteer",
      date: "Apr 18, 2026",
      template: "modern",
    },
  ];

  // Handle Download PDF
  const handleDownloadPdf = () => {
    window.print();
    toast({
      title: "📜 Downloading PDF Certificate",
      description: `Exporting certificate ${certificateData.certId}.`,
    });
  };

  // Handle Share / Copy Link
  const handleShareCertificate = () => {
    navigator.clipboard.writeText(certificateData.verificationUrl);
    toast({
      title: "📋 Verification Link Copied!",
      description: "Certificate URL copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12 print:p-0 print:m-0 print:max-w-none">
        
        {/* Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6 print:hidden">
          <div>
            <Link href="/dashboard/attendee">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500" />
              Automated Certificate Studio & Verification
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Automated PDF generation, cryptographic Certificate IDs, organizer digital signatures, and embedded verification QR codes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" onClick={handleShareCertificate} className="font-bold text-xs shadow-2xs">
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Verification Link
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Download PDF Certificate
            </Button>
          </div>
        </div>

        {/* CONTROLS & TEMPLATE SELECTOR (Hidden in Print) */}
        <Card className="border-border/60 shadow-2xs p-6 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Certificate Template Selector
              </h3>
              <p className="text-xs text-muted-foreground">Select a official university design layout</p>
            </div>

            <div className="flex gap-2">
              {[
                { id: "gold", label: "Classic Gold" },
                { id: "modern", label: "Modern Minimalist" },
                { id: "tech", label: "Technical Distinction" },
              ].map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={selectedTemplate === t.id ? "default" : "outline"}
                  onClick={() => setSelectedTemplate(t.id as any)}
                  className="font-bold text-xs cursor-pointer"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* 📜 DYNAMIC CERTIFICATE CANVAS PREVIEW */}
        <div className="flex justify-center">
          <div
            className={`w-full max-w-4xl p-8 sm:p-14 rounded-3xl shadow-2xl border-8 relative transition-all overflow-hidden ${
              selectedTemplate === "gold"
                ? "bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-amber-500/40 text-amber-950"
                : selectedTemplate === "modern"
                ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-primary text-white"
                : "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-blue-500 text-blue-50"
            }`}
          >
            
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96" />
            </div>

            {/* Top Border Banner */}
            <div className="flex justify-between items-start border-b border-current/20 pb-6 mb-8">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest block opacity-70">
                  UNIVERSITY EVENTHUB OFFICIAL CERTIFICATION
                </span>
                <span className="text-xs font-bold font-mono opacity-90">
                  ID: <code className="underline">{certificateData.certId}</code>
                </span>
              </div>

              <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 shadow-md">
                Verified Authentic 🛡️
              </Badge>
            </div>

            {/* Certificate Body Content */}
            <div className="text-center space-y-6 my-10">
              <span className="text-sm font-serif italic tracking-widest uppercase block opacity-80">
                This is proudly awarded to
              </span>

              <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight border-b-2 border-amber-500/40 inline-block pb-2 px-6">
                {certificateData.recipientName}
              </h2>

              <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed opacity-90 pt-2">
                for outstanding accomplishment and active participation as <strong>{certificateData.role}</strong> in the
              </p>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-accent">
                {certificateData.eventTitle}
              </h3>

              <p className="text-xs font-mono opacity-70">
                Issued on {certificateData.issueDate} • Verified via EventHub Blockchain Registry
              </p>
            </div>

            {/* Bottom Signatures & Verification QR Code */}
            <div className="grid grid-cols-3 items-end border-t border-current/20 pt-8 mt-12 text-center text-xs">
              
              {/* Left: Organizer Signature */}
              <div className="space-y-1 text-left">
                <div className="h-12 flex items-center">
                  <span className="font-serif italic text-lg font-bold underline opacity-80">
                    Rajesh K. Verma
                  </span>
                </div>
                <div className="border-t border-current/40 pt-1">
                  <p className="font-bold">{certificateData.organizerName}</p>
                  <p className="text-[10px] opacity-70">{certificateData.organizerTitle}</p>
                </div>
              </div>

              {/* Center: Gold Medal Seal */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-slate-800">
                  <Award className="w-9 h-9" />
                </div>
              </div>

              {/* Right: Embedded Verification QR Code */}
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="p-2 bg-white rounded-xl shadow-md border border-border inline-block">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <span className="text-[9px] font-mono opacity-80 block text-right">
                  Scan to Verify Online
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
