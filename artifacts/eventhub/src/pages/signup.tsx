import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useAuthSignup, getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Trophy, 
  Crown,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  email: z.string().email("Enter a valid university email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  phone: z.string().optional(),
  collegeId: z.string().optional(),
  role: z.enum(["attendee", "volunteer", "organizer", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [_, setLocation] = useLocation();
  const signupMutation = useAuthSignup();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === "attendee") setLocation("/dashboard/attendee");
      else if (user.role === "volunteer") setLocation("/dashboard/volunteer");
      else setLocation("/dashboard/organizer");
    }
  }, [user, setLocation]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      collegeId: "",
      role: "attendee",
    },
  });

  const watchPassword = form.watch("password");

  // Simple password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-muted" };
    if (pass.length < 6) return { score: 1, label: "Weak", color: "bg-destructive" };
    if (pass.length < 10 || !/\d/.test(pass)) return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-green-600" };
  };

  const strength = getPasswordStrength(watchPassword);

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate({ 
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as any,
        phone: data.phone,
        collegeId: data.collegeId,
      } 
    }, {
      onSuccess: (userData: any) => {
        localStorage.setItem("pending_verify_email", data.email);
        toast({
          title: "✉️ Verification Code Sent!",
          description: `We sent a 6-digit OTP code to ${data.email}.`,
        });
        setLocation(`/verify-email?email=${encodeURIComponent(data.email)}`);
      },
    });
  };

  const roleOptions = [
    {
      id: "attendee",
      title: "Student Attendee",
      desc: "Register for events & get QR tickets",
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
    },
    {
      id: "volunteer",
      title: "Student Volunteer",
      desc: "Scan QR tickets & earn credit hours",
      icon: <Users className="w-5 h-5 text-green-600" />,
    },
    {
      id: "organizer",
      title: "Club Organizer",
      desc: "Host events & manage registrations",
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
    },
    {
      id: "admin",
      title: "University Admin",
      desc: "Full administrative & audit access",
      icon: <Crown className="w-5 h-5 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 py-12">
      <div className="w-full max-w-2xl">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">EventHub</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold mt-4 text-foreground">Create Your Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join the centralized campus event & volunteer platform</p>
        </div>

        <div className="bg-card border border-border shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          
          {signupMutation.isError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {/* @ts-ignore */}
                {signupMutation.error?.response?.data?.error || "Registration failed. Email may already be in use."}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Grid 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="name" placeholder="Aarav Sharma" {...form.register("name")} className="h-11" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">University Email</Label>
                <Input id="email" type="email" placeholder="name@university.edu" {...form.register("email")} className="h-11" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Grid 2: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    {...form.register("password")} 
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {watchPassword && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-muted-foreground">Strength: <strong className="text-foreground">{strength.label}</strong></span>
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                    </div>
                  </div>
                )}
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  {...form.register("confirmPassword")} 
                  className="h-11"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Grid 3: Phone & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number (Optional)</Label>
                <Input id="phone" placeholder="+1 555-0199" {...form.register("phone")} className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="collegeId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student / Staff ID</Label>
                <Input id="collegeId" placeholder="STD-2026-881" {...form.register("collegeId")} className="h-11" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Your Account Role</Label>
              
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roleOptions.map((opt) => {
                      const isSelected = field.value === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => field.onChange(opt.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-border hover:border-muted-foreground/30 bg-card"
                          }`}
                        >
                          <div className="p-2 bg-muted rounded-xl shrink-0">{opt.icon}</div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{opt.title}</h4>
                            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <Button type="submit" className="w-full h-11 font-bold shadow-md cursor-pointer mt-4" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Creating Account..." : "Create EventHub Account"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-primary font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <div>
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
