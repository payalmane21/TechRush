import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "organizer" | "volunteer" | "attendee">;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if unauthenticated
    setLocation("/login");
    return null;
  }

  // Role-Based Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
    const getRoleDashboard = () => {
      switch (user.role) {
        case "attendee": return "/dashboard/attendee";
        case "volunteer": return "/dashboard/volunteer";
        case "organizer":
        case "admin": return "/dashboard/organizer";
        default: return "/";
      }
    };

    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center border-border shadow-xl space-y-6">
            <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-2xl text-foreground">Access Restricted</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                This portal requires <span className="font-semibold text-primary capitalize">{allowedRoles.join(" or ")}</span> permissions. Your current role is <span className="font-semibold capitalize text-foreground">{user.role}</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                className="w-full font-bold shadow-xs" 
                onClick={() => setLocation(getRoleDashboard())}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to My {user.role} Dashboard
              </Button>

              <Button 
                variant="outline" 
                className="w-full font-semibold" 
                onClick={() => setLocation("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Switch Account
              </Button>
            </div>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return <>{children}</>;
}
