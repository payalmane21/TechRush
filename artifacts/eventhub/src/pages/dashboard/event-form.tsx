import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateEvent,
  useUpdateEvent,
  useGetEvent,
  getListMyEventsQueryKey,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  AlertCircle, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Users, 
  Tag, 
  FileText, 
  HelpCircle, 
  Phone, 
  Globe, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Sparkles,
  Award,
  Send,
  ShieldCheck,
  Clock,
  DollarSign
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { broadcastDataMutation } from "@/components/realtime-sync-provider";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  venue: z.string().min(2, "Venue location is required"),
  googleMapsUrl: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
  price: z.coerce.number().int().min(0, "Price must be greater than or equal to 0"),
  registrationDeadline: z.string().optional(),
  bannerUrl: z.string().optional(),
  mascotUrl: z.string().optional(),
  mascotPrompt: z.string().optional(),
  status: z.enum(["draft", "pending_approval", "approved", "published", "rejected"]),
  tags: z.string().optional(),
  sponsors: z.string().optional(),
  rules: z.string().optional(),
  attachments: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CATEGORIES = [
  "Technology", 
  "Cultural", 
  "Career", 
  "Sports", 
  "Arts", 
  "Academic", 
  "Entrepreneurship", 
  "Social", 
  "Health & Wellness", 
  "Volunteer Drive", 
  "Hackathon", 
  "Seminar"
];

const PRESET_BANNERS = [
  { label: "Tech / Hackathon", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000" },
  { label: "Cultural Fest", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000" },
  { label: "Seminar & AI", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1000" },
  { label: "Volunteer Drive", url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1000" },
  { label: "Sports Meet", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000" },
];

function toLocalDatetime(isoStr: string | Date) {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm() {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const eventId = isEdit ? parseInt(params.id!, 10) : undefined;
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: existing, isLoading: loadingEvent } = useGetEvent(eventId!, {
    query: {
      queryKey: ["getEvent", eventId],
      enabled: isEdit && !!eventId,
    },
  });

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  // Custom FAQs List State
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([
    { q: "Is registration free?", a: "Yes, this event is free for all registered university students." },
  ]);

  // AI Mascot State
  const [mascot, setMascot] = useState<{
    mascotName: string;
    personality: string;
    prompt: string;
    mascotUrl: string;
    tags: string[];
    themeColor: string;
  } | null>(null);
  const [isGeneratingMascot, setIsGeneratingMascot] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Technology",
      venue: "",
      googleMapsUrl: "",
      startTime: toLocalDatetime(new Date(Date.now() + 86400000 * 3)),
      endTime: toLocalDatetime(new Date(Date.now() + 86400000 * 3 + 14400000)),
      capacity: 250,
      price: 0,
      registrationDeadline: toLocalDatetime(new Date(Date.now() + 86400000 * 2)),
      bannerUrl: PRESET_BANNERS[0].url,
      mascotUrl: "",
      mascotPrompt: "",
      status: "draft",
      tags: "#campus, #hackathon, #innovation",
      sponsors: "ACM Student Chapter, Google Developer Student Club",
      rules: "1. Carry valid university ID card.\n2. Arrive 15 minutes before start time.\n3. Follow campus code of conduct.",
      attachments: "https://university.edu/schedule.pdf",
      contactName: "Student Event Helpdesk",
      contactEmail: "events@university.edu",
      contactPhone: "+91 98765 43210",
    },
  });

  useEffect(() => {
    if (existing) {
      if ((existing as any).mascotUrl) {
        setMascot({
          mascotName: existing.title + " Mascot",
          personality: "Official Collegiate Event Mascot",
          prompt: (existing as any).mascotPrompt || "Custom collegiate event character",
          mascotUrl: (existing as any).mascotUrl,
          tags: [existing.category, "AI Mascot"],
          themeColor: "#6366f1",
        });
      }

      form.reset({
        title: existing.title,
        description: existing.description ?? "",
        category: existing.category,
        venue: existing.venue,
        googleMapsUrl: "https://maps.google.com/?q=" + encodeURIComponent(existing.venue),
        startTime: toLocalDatetime(existing.startTime),
        endTime: toLocalDatetime(existing.endTime),
        capacity: existing.capacity,
        price: existing.price ?? 0,
        registrationDeadline: existing.registrationDeadline
          ? toLocalDatetime(existing.registrationDeadline)
          : "",
        bannerUrl: existing.bannerUrl ?? PRESET_BANNERS[0].url,
        mascotUrl: (existing as any).mascotUrl ?? "",
        mascotPrompt: (existing as any).mascotPrompt ?? "",
        status: (existing.status as any) || "draft",
        tags: "#campus, #innovation, #" + existing.category.toLowerCase(),
        sponsors: "ACM Student Chapter, University Student Union",
        rules: "Carry valid Student ID. Adhere to venue safety rules.",
        attachments: "https://university.edu/event-rules.pdf",
        contactName: existing.organizerName || "Event Desk Lead",
        contactEmail: "organizer@university.edu",
        contactPhone: "+91 98765 43210",
      });
    }
  }, [existing]);

  const handleGenerateMascot = async () => {
    setIsGeneratingMascot(true);
    try {
      const res = await fetch("/api/events/mascot/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
        },
        body: JSON.stringify({
          title: form.getValues("title"),
          description: form.getValues("description"),
          category: form.getValues("category"),
          keywords: form.getValues("tags"),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.mascotUrl) {
          setMascot(data);
          form.setValue("mascotUrl", data.mascotUrl);
          form.setValue("mascotPrompt", data.prompt);
          toast({
            title: `✨ Mascot Generated: ${data.mascotName}`,
            description: `Generated a custom mascot tailored to your ${data.category} event!`,
          });
        }
      }
    } catch (err) {
      toast({
        title: "AI Generator Notice",
        description: "Event creation is fully functional even without a mascot.",
      });
    } finally {
      setIsGeneratingMascot(false);
    }
  };

  const handleRemoveMascot = () => {
    setMascot(null);
    form.setValue("mascotUrl", "");
    form.setValue("mascotPrompt", "");
    toast({ title: "Mascot Removed", description: "Event will use standard category visuals." });
  };

  const addFaqPair = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };

  const removeFaqPair = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, field: "q" | "a", val: string) => {
    const updated = [...faqs];
    updated[idx][field] = val;
    setFaqs(updated);
  };

  // Submit Handler supporting Draft & Approval Submissions
  const handleFormSubmit = (targetStatus: "draft" | "pending_approval") => {
    form.setValue("status", targetStatus);
    form.handleSubmit((values: EventFormValues) => {
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        venue: values.venue,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
        capacity: values.capacity,
        price: Number(values.price) || 0,
        registrationDeadline: values.registrationDeadline
          ? new Date(values.registrationDeadline).toISOString()
          : undefined,
        bannerUrl: values.bannerUrl || PRESET_BANNERS[0].url,
        mascotUrl: mascot?.mascotUrl || form.getValues("mascotUrl") || null,
        mascotPrompt: mascot?.prompt || form.getValues("mascotPrompt") || null,
        status: targetStatus,
      };

      if (isEdit && eventId) {
        updateMutation.mutate({ id: eventId, data: payload }, {
          onSuccess: async () => {
            if (targetStatus === "pending_approval") {
              await fetch(`/api/events/${eventId}/submit-approval`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
                },
              });
              toast({
                title: "📬 Event Submitted for Admin Approval",
                description: `"${values.title}" is now awaiting administrative review.`,
              });
            } else {
              toast({ title: "Event Saved as Draft", description: `"${values.title}" has been saved.` });
            }
            queryClient.invalidateQueries();
            setLocation("/dashboard/organizer/events");
          },
        });
      } else {
        createMutation.mutate({ data: payload }, {
          onSuccess: async (createdEv: any) => {
            if (targetStatus === "pending_approval" && createdEv?.id) {
              await fetch(`/api/events/${createdEv.id}/submit-approval`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("eventhub_token") || ""}`,
                },
              });
              toast({
                title: "📬 Event Created & Submitted for Admin Approval",
                description: `"${values.title}" is awaiting review from campus admins.`,
              });
            } else {
              toast({ title: "📝 Event Draft Saved", description: `"${values.title}" saved to your drafts.` });
            }
            queryClient.invalidateQueries();
            setLocation("/dashboard/organizer/events");
          },
        });
      }
    })();
  };

  const mutation = isEdit ? updateMutation : createMutation;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Top Breadcrumb Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/organizer/events")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {isEdit ? "Edit Campus Event" : "Create New Campus Event"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Fill in the verified event details, ticket price, venue capacity, and submit for administrative review.
            </p>
          </div>
        </div>

        {mutation.isError && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {/* @ts-ignore */}
              {mutation.error?.response?.data?.error || "Failed to save event. Please verify all required fields."}
            </AlertDescription>
          </Alert>
        )}

        <form className="space-y-8">
          
          {/* SECTION 1: ESSENTIAL EVENT DETAILS */}
          <Card className="p-6 sm:p-8 border-border/60 shadow-xs rounded-3xl space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Basic Information
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Title, description, category, and entry pricing</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-foreground">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Spring Annual Hackathon & Innovation Expo 2026"
                  {...form.register("title")}
                  className="h-11 text-xs"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-foreground">
                    Event Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(val) => form.setValue("category", val)}
                  >
                    <SelectTrigger className="h-11 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Registration Fee (₹ INR) <span className="text-destructive">*</span></span>
                    <span className="text-[10px] text-muted-foreground font-normal">₹0 = Free Pass, &gt;0 = Paid Ticket</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...form.register("price")}
                      className="pl-8 h-11 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-foreground">
                  Event Description & Agenda
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide an overview of the event, keynote speakers, prize tracks, schedule, and guidelines for attendees..."
                  {...form.register("description")}
                  className="h-28 text-xs"
                />
              </div>
            </div>
          </Card>

          {/* SECTION 2: SCHEDULE & VENUE */}
          <Card className="p-6 sm:p-8 border-border/60 shadow-xs rounded-3xl space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Schedule & Venue Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Location, timings, and attendee capacity</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-xs font-bold text-foreground">
                    Start Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...form.register("startTime")}
                    className="h-11 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-xs font-bold text-foreground">
                    End Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...form.register("endTime")}
                    className="h-11 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="venue" className="text-xs font-bold text-foreground">
                    Campus Venue Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="venue"
                    placeholder="e.g., Main Science & Tech Auditorium, Block B"
                    {...form.register("venue")}
                    className="h-11 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-xs font-bold text-foreground">
                    Maximum Attendee Capacity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="250"
                    {...form.register("capacity")}
                    className="h-11 text-xs"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 3: BANNER IMAGE */}
          <Card className="p-6 sm:p-8 border-border/60 shadow-xs rounded-3xl space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Event Banner Graphic
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Choose a preset high-resolution image or provide a custom image URL</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bannerUrl" className="text-xs font-bold text-foreground">Banner Image URL</Label>
                <Input
                  id="bannerUrl"
                  placeholder="https://images.unsplash.com/..."
                  {...form.register("bannerUrl")}
                  className="h-11 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_BANNERS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue("bannerUrl", preset.url)}
                    className="text-xs font-semibold"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION 4: AI EVENT MASCOT */}
          <Card className="p-6 sm:p-8 border-border/60 shadow-xs rounded-3xl space-y-6 bg-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> AI Event Mascot Studio
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate a custom, stylized collegiate mascot character tailored to your event category & theme
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateMascot}
                  disabled={isGeneratingMascot}
                  className="font-bold text-xs bg-primary text-primary-foreground shadow-xs h-9 px-4 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  {isGeneratingMascot ? "Designing Mascot..." : mascot ? "Regenerate Mascot" : "Generate AI Mascot"}
                </Button>

                {mascot && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveMascot}
                    className="text-xs font-bold text-destructive hover:bg-destructive/10 h-9"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                )}
              </div>
            </div>

            {mascot ? (
              <div className="p-5 rounded-2xl bg-muted/20 border border-border flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/40 shadow-md bg-card p-1">
                  <img src={mascot.mascotUrl} alt={mascot.mascotName} className="w-full h-full object-contain rounded-xl" />
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-bold text-base text-foreground">{mascot.mascotName}</h3>
                    <Badge variant="outline" className="text-[10px] font-extrabold text-primary border-primary/30">Official Mascot</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{mascot.personality}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                    {mascot.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-semibold">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground/80 font-mono italic pt-1 truncate max-w-lg">
                    Prompt: "{mascot.prompt}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center space-y-3 bg-muted/5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">No Mascot Generated Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Click "Generate AI Mascot" above to create an exclusive mascot visual tailored to your event's title and category.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* SUBMISSION & LIFECYCLE ACTION BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/40 p-6 rounded-3xl border border-border/60">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              <span>Admin approval is required before events can be published live for students.</span>
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFormSubmit("draft")}
                disabled={mutation.isPending}
                className="font-bold text-xs shadow-2xs h-11 px-5"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                onClick={() => handleFormSubmit("pending_approval")}
                disabled={mutation.isPending}
                className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md h-11 px-6"
              >
                <Send className="w-4 h-4 mr-2" />
                {mutation.isPending ? "Submitting..." : "Submit for Admin Approval"}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
