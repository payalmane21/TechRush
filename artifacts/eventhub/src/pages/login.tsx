import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Sparkles, 
  ArrowLeft,
  Crown,
  Trophy,
  Users,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Enter a valid university email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const loginMutation = useAuthLogin();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === "attendee") setLocation("/dashboard/attendee");
      else if (user.role === "volunteer") setLocation("/dashboard/volunteer");
      else if (user.role === "admin") setLocation("/dashboard/admin");
      else setLocation("/dashboard/organizer");
    }
  }, [user, setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (userData: any) => {
        if (userData.token) {
          localStorage.setItem("eventhub_token", userData.token);
        }
        queryClient.setQueryData(getGetMeQueryKey(), userData);
        toast({
          title: `Welcome back, ${userData.name}!`,
          description: `Logged in successfully as ${userData.role.toUpperCase()}.`,
        });
        if (userData.role === "attendee") setLocation("/dashboard/attendee");
        else if (userData.role === "volunteer") setLocation("/dashboard/volunteer");
        else if (userData.role === "admin") setLocation("/dashboard/admin");
        else setLocation("/dashboard/organizer");
      },
    });
  };

  // Instant Demo Login for all 4 roles
  const handleDemoLogin = async (role: "admin" | "organizer" | "volunteer" | "attendee") => {
    setDemoLoading(role);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const userData = await res.json();
      if (!res.ok) {
        throw new Error(userData.error || "Demo login failed");
      }
      if (userData.token) {
        localStorage.setItem("eventhub_token", userData.token);
      }
      queryClient.setQueryData(getGetMeQueryKey(), userData);
      toast({
        title: `⚡ Demo Login: ${role.toUpperCase()}`,
        description: `Signed in as ${userData.name}`,
      });
      if (userData.role === "attendee") setLocation("/dashboard/attendee");
      else if (userData.role === "volunteer") setLocation("/dashboard/volunteer");
      else if (userData.role === "admin") setLocation("/dashboard/admin");
      else setLocation("/dashboard/organizer");
    } catch (err: any) {
      toast({
        title: "Demo login failed",
        description: err?.message || "Please sign in with email and password.",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 py-12">
      <div className="w-full max-w-xl">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">EventHub</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold mt-4 text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your university event & volunteer portal</p>
        </div>

        <div className="bg-card border border-border shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Error Alert */}
          {loginMutation.isError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {/* @ts-ignore */}
                {loginMutation.error?.response?.data?.error || "Invalid credentials or account mismatch."}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">University Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@university.edu" 
                {...form.register("email")}
                className={`h-11 ${form.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  {...form.register("password")}
                  className={`h-11 pr-10 ${form.formState.errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="rememberMe" 
                checked={form.watch("rememberMe")}
                onCheckedChange={(checked) => form.setValue("rememberMe", !!checked)}
              />
              <label htmlFor="rememberMe" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                Remember me for 30 days on this device
              </label>
            </div>

            <Button type="submit" className="w-full h-11 font-bold shadow-md cursor-pointer" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Authenticating..." : "Sign In to EventHub"}
            </Button>
          </form>

          {/* Quick Role-Based Demo Logins */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant Role Demo Login
              </span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">1-Click Test</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("attendee")}
                disabled={!!demoLoading}
                className="text-xs font-semibold hover:border-primary cursor-pointer flex flex-col h-auto py-2.5 gap-1"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Attendee</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("volunteer")}
                disabled={!!demoLoading}
                className="text-xs font-semibold hover:border-primary cursor-pointer flex flex-col h-auto py-2.5 gap-1"
              >
                <Users className="w-4 h-4 text-green-600" />
                <span>Volunteer</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("organizer")}
                disabled={!!demoLoading}
                className="text-xs font-semibold hover:border-primary cursor-pointer flex flex-col h-auto py-2.5 gap-1"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Organizer</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("admin")}
                disabled={!!demoLoading}
                className="text-xs font-semibold hover:border-primary cursor-pointer flex flex-col h-auto py-2.5 gap-1"
              >
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </Button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-primary font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <div>
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
