import React, { useEffect, useRef, useState } from "react";
import { useListEvents, useScanQr, useManualCheckin } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, QrCode, Search, Camera } from "lucide-react";

type CheckinResult = { success: boolean; action?: string; message: string; attendeeName?: string };

export default function VolunteerScan() {
  const { data: eventsData } = useListEvents();
  const scanMutation = useScanQr();
  const manualMutation = useManualCheckin();

  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [station, setStation] = useState("Check-in Desk");
  const [qrToken, setQrToken] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerDivId = "qr-scanner-div";

  const events = eventsData?.events ?? [];

  const handleScanQr = () => {
    if (!selectedEvent || !qrToken.trim()) return;
    setResult(null);
    scanMutation.mutate(
      { data: { qrToken: qrToken.trim(), eventId: parseInt(selectedEvent, 10), station } },
      {
        onSuccess: (data) => {
          setResult({ success: true, action: data.action, message: data.message ?? "Success", attendeeName: data.attendeeName });
          setQrToken("");
        },
        onError: (err: any) => {
          setResult({ success: false, message: err?.response?.data?.error ?? "Failed" });
        },
      },
    );
  };

  const handleManualCheckin = () => {
    if (!selectedEvent || !manualEmail.trim()) return;
    setResult(null);
    manualMutation.mutate(
      { data: { eventId: parseInt(selectedEvent, 10), email: manualEmail.trim(), station } },
      {
        onSuccess: (data) => {
          setResult({ success: true, action: data.action, message: data.message ?? "Success", attendeeName: data.attendeeName });
          setManualEmail("");
        },
        onError: (err: any) => {
          setResult({ success: false, message: err?.response?.data?.error ?? "Failed" });
        },
      },
    );
  };

  // Camera scanner via html5-qrcode
  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (scannerRef.current) {
        await stopScanner();
      }

      scannerRef.current = new Html5Qrcode(scannerDivId);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxEdge = Math.max(180, Math.floor(minEdge * 0.7));
            return { width: qrboxEdge, height: qrboxEdge };
          },
          aspectRatio: 1.333333,
        },
        (decodedText: string) => {
          setQrToken(decodedText);
          stopScanner();
        },
        undefined,
      );
      setScannerActive(true);
    } catch (err) {
      console.error("Camera scanner initialization error:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <QrCode className="w-8 h-8 text-primary" />
            QR Check-in Scanner
          </h1>
          <p className="text-muted-foreground mt-1">Scan attendee QR codes or search by email.</p>
        </div>

        {/* Config */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose event to check in..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map(ev => (
                    <SelectItem key={ev.id} value={String(ev.id)}>{ev.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Station Name</Label>
              <Input value={station} onChange={(e) => setStation(e.target.value)} placeholder="e.g. Main Entrance" />
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert className={`mb-6 ${result.success ? "border-green-500/30 bg-green-50 dark:bg-green-950/20" : "border-destructive/30 bg-destructive/5"}`}>
            {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-destructive" />}
            <AlertDescription>
              <div className={result.success ? "text-green-800 dark:text-green-300" : "text-destructive"}>
                {result.success && result.attendeeName && (
                  <p className="font-bold text-base mb-1">{result.attendeeName}</p>
                )}
                <p>{result.message}</p>
                {result.success && result.action && (
                  <Badge className={`mt-2 ${result.action === "check_in" ? "bg-green-600" : "bg-orange-500"}`}>
                    {result.action === "check_in" ? "✓ Checked In" : "↩ Checked Out"}
                  </Badge>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Check-in tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="camera">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="camera" className="flex-1"><Camera className="w-4 h-4 mr-2" />Camera</TabsTrigger>
                <TabsTrigger value="token" className="flex-1"><QrCode className="w-4 h-4 mr-2" />Token</TabsTrigger>
                <TabsTrigger value="manual" className="flex-1"><Search className="w-4 h-4 mr-2" />Email</TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="space-y-4">
                <style>{`
                  #qr-scanner-div {
                    position: relative;
                    width: 100% !important;
                    max-width: 100% !important;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #090d16;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                  }
                  #qr-scanner-div video {
                    width: 100% !important;
                    height: auto !important;
                    max-height: 420px;
                    object-fit: cover !important;
                    border-radius: 12px;
                    display: block !important;
                  }
                  #qr-scanner-div canvas {
                    display: none !important;
                  }
                  #qr-scanner-div img {
                    display: none !important;
                  }
                  #qr-shaded-region {
                    border-color: rgba(128, 27, 59, 0.7) !important;
                  }
                  #qr-scanner-div__dashboard_section_csr,
                  #qr-scanner-div__dashboard_section_swaplink,
                  #qr-scanner-div a {
                    display: none !important;
                  }
                `}</style>
                <div id={scannerDivId} className="w-full rounded-xl overflow-hidden bg-muted min-h-[280px] flex items-center justify-center" />
                {!scannerActive ? (
                  <Button className="w-full" onClick={startScanner} disabled={!selectedEvent} size="lg">
                    <Camera className="w-5 h-5 mr-2" /> Start Camera Scanner
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={stopScanner} size="lg">
                    Stop Scanner
                  </Button>
                )}
                {!selectedEvent && (
                  <p className="text-xs text-muted-foreground text-center">Select an event first to enable the scanner.</p>
                )}
              </TabsContent>

              <TabsContent value="token" className="space-y-4">
                <div className="space-y-2">
                  <Label>QR Token</Label>
                  <Input
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="Paste or type the attendee's QR token..."
                    onKeyDown={(e) => e.key === "Enter" && handleScanQr()}
                  />
                  <p className="text-xs text-muted-foreground">Type the token from the attendee's QR code and press Enter.</p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleScanQr}
                  disabled={!selectedEvent || !qrToken.trim() || scanMutation.isPending}
                >
                  {scanMutation.isPending ? "Processing..." : "Check In"}
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label>Attendee Email</Label>
                  <Input
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="attendee@university.edu"
                    type="email"
                    onKeyDown={(e) => e.key === "Enter" && handleManualCheckin()}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleManualCheckin}
                  disabled={!selectedEvent || !manualEmail.trim() || manualMutation.isPending}
                >
                  {manualMutation.isPending ? "Looking up..." : "Check In by Email"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
