import React, { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// XSS Sanitizer Helper Function
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function SecurityProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [idleModalOpen, setIdleModalOpen] = useState(false);
  const [idleTimeSeconds, setIdleTimeSeconds] = useState(0);

  // Idle Session Timer (15 Minutes Max Idle)
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      setIdleTimeSeconds(0);
      if (idleModalOpen) setIdleModalOpen(false);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    const interval = setInterval(() => {
      setIdleTimeSeconds((prev) => {
        const next = prev + 1;
        // 14 minutes = 840s (Show Warning)
        if (next === 840) {
          setIdleModalOpen(true);
        }
        // 15 minutes = 900s (Auto Logout)
        if (next >= 900) {
          clearInterval(interval);
          setIdleModalOpen(false);
          logout();
          toast({
            title: "🔒 Session Expired",
            description: "You were logged out due to 15 minutes of inactivity for security.",
            variant: "destructive",
          });
        }
        return next;
      });
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearInterval(interval);
    };
  }, [user, idleModalOpen, logout, toast]);

  return (
    <>
      {children}

      {/* IDLE SESSION TIMEOUT WARNING MODAL */}
      <Dialog open={idleModalOpen} onOpenChange={setIdleModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl flex items-center gap-2 text-amber-600">
              <Clock className="w-5 h-5" /> Session Timeout Warning
            </DialogTitle>
            <DialogDescription className="text-xs">
              You have been idle for 14 minutes. For security, your session will automatically terminate in 60 seconds unless you extend it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => logout()} className="text-xs font-bold text-destructive">
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout Now
            </Button>
            <Button onClick={() => { setIdleTimeSeconds(0); setIdleModalOpen(false); }} className="font-bold text-xs bg-primary text-primary-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Stay Logged In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
