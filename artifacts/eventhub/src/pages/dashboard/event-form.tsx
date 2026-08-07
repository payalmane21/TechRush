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
  Award
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
  registrationDeadline: z.string().optional(),
  bannerUrl: z.string().optional(),
  status: z.enum(["draft", "published"]),
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
      registrationDeadline: toLocalDatetime(new Date(Date.now() + 86400000 * 2)),
      bannerUrl: PRESET_BANNERS[0].url,
      status: "published",
      tags: "#campus, #hackathon, #innovation",
      sponsors: "ACM Student Chapter, IEEE Society, Tech Council",
      rules: "1. Carry valid university ID card.\n2. Arrive 15 minutes before start time.\n3. Follow campus code of conduct.",
      attachments: "https://university.edu/schedule.pdf",
      contactName: "Student Event Helpdesk",
      contactEmail: "events@university.edu",
      contactPhone: "+1 555-0199",
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? "",
        category: existing.category,
        venue: existing.venue,
        googleMapsUrl: "https://maps.google.com/?q=" + encodeURIComponent(existing.venue),
        startTime: toLocalDatetime(existing.startTime),
        endTime: toLocalDatetime(existing.endTime),
        capacity: existing.capacity,
        registrationDeadline: existing.registrationDeadline
          ? toLocalDatetime(existing.registrationDeadline)
          : "",
        bannerUrl: existing.bannerUrl ?? PRESET_BANNERS[0].url,
        status: existing.status as "draft" | "published",
        tags: "#campus, #innovation, #" + existing.category.toLowerCase(),
        sponsors: "ACM Student Chapter, University Student Union",
        rules: "Carry valid Student ID. Adhere to venue safety rules.",
        attachments: "https://university.edu/event-rules.pdf",
        contactName: existing.organizerName || "Event Desk Lead",
        contactEmail: "organizer@university.edu",
        contactPhone: "+1 555-0199",
      });
    }
  }, [existing]);

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

  const onSubmit = (values: EventFormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      venue: values.venue,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
      capacity: values.capacity,
      registrationDeadline: values.registrationDeadline
        ? new Date(values.registrationDeadline).toISOString()
        : undefined,
      bannerUrl: values.bannerUrl || PRESET_BANNERS[0].url,
      status: values.status as any,
    };

    if (isEdit && eventId) {
      updateMutation.mutate({ id: eventId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries();
          broadcastDataMutation("EVENT_UPDATED");
          toast({ title: "Event Updated", description: `"${values.title}" has been saved.` });
          setLocation("/dashboard/organizer/events");
        },
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries();
          broadcastDataMutation("EVENT_CREATED");
          toast({ title: "🎉 Event Created & Published", description: `"${values.title}" is live across Home, Browse Events, and all Dashboards!` });
          setLocation("/dashboard/organizer/events");
        },
      });
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && loadingEvent) {
    return <DashboardLayout><div className="animate-pulse bg-muted rounded-2xl h-64" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground font-semibold" onClick={() => setLocation("/dashboard/organizer/events")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Events
        </Button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {isEdit ? "Edit Campus Event" : "Create New Campus Event"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure event parameters, banners, capacity, rules, sponsors, and registration deadlines.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary font-bold px-3 py-1">
            {form.watch("status") === "published" ? "Public Event" : "Draft Preview"}
          </Badge>
        </div>

        {(mutation.isError || Object.keys(form.formState.errors).length > 0) && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {Object.keys(form.formState.errors).length > 0
                ? `Please fix the following fields: ${Object.keys(form.formState.errors).join(", ")}`
                : /* @ts-ignore */
                  mutation.error?.response?.data?.error ?? "Failed to save event details"}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* SECTION 1: BASIC INFORMATION */}
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Basic Information & Banner
              </CardTitle>
              <CardDescription className="text-xs">Event title, category, and banner media</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Title *</Label>
                <Input id="title" {...form.register("title")} placeholder="e.g. Spring Annual Hackathon & Tech Summit 2026" className="h-11 font-semibold" />
                {form.formState.errors.title && <p className="text-xs text-destructive font-medium">{form.formState.errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description & Overview</Label>
                <Textarea id="description" {...form.register("description")} rows={4} placeholder="Describe the objectives, schedule, guest speakers, and eligibility..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category *</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select event category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Publishing Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(v) => form.setValue("status", v as "draft" | "published")}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Hidden from public)</SelectItem>
                      <SelectItem value="published">Published (Visible on site)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Banner Presets */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="bannerUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Image URL</Label>
                <Input id="bannerUrl" {...form.register("bannerUrl")} placeholder="https://images.unsplash.com/..." className="h-11" />
                
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-2">Or select a high-res campus preset banner:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("bannerUrl", preset.url)}
                        className="text-xs font-semibold hover:border-primary cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1" /> {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: LOCATION & GOOGLE MAPS */}
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location & Google Maps
              </CardTitle>
              <CardDescription className="text-xs">Specify campus hall, auditorium, or map direction link</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venue / Hall Location *</Label>
                <Input id="venue" {...form.register("venue")} placeholder="e.g. Main Science & Tech Auditorium, Block B" className="h-11" />
                {form.formState.errors.venue && <p className="text-xs text-destructive font-medium">{form.formState.errors.venue.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google Maps Direction URL (Optional)</Label>
                <Input id="googleMapsUrl" {...form.register("googleMapsUrl")} placeholder="https://maps.google.com/..." className="h-11" />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: DATE, TIME & CAPACITY */}
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Dates, Time & Capacity
              </CardTitle>
              <CardDescription className="text-xs">Registration limit and event schedule</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Date & Time *</Label>
                  <Input id="startTime" type="datetime-local" {...form.register("startTime")} className="h-11" />
                  {form.formState.errors.startTime && <p className="text-xs text-destructive font-medium">{form.formState.errors.startTime.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Date & Time *</Label>
                  <Input id="endTime" type="datetime-local" {...form.register("endTime")} className="h-11" />
                  {form.formState.errors.endTime && <p className="text-xs text-destructive font-medium">{form.formState.errors.endTime.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maximum Participants / Capacity *</Label>
                  <Input id="capacity" type="number" min={1} {...form.register("capacity")} className="h-11 font-bold" />
                  {form.formState.errors.capacity && <p className="text-xs text-destructive font-medium">{form.formState.errors.capacity.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registration Deadline</Label>
                  <Input id="registrationDeadline" type="datetime-local" {...form.register("registrationDeadline")} className="h-11" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: TAGS, SPONSORS & RULES */}
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Tags, Sponsors & Rules
              </CardTitle>
              <CardDescription className="text-xs">Search keywords, institutional sponsors, and code of conduct</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Tags (Comma Separated)</Label>
                  <Input id="tags" {...form.register("tags")} placeholder="#hackathon, #ai, #networking" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sponsors" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Sponsors & Partners</Label>
                  <Input id="sponsors" {...form.register("sponsors")} placeholder="ACM, Google Cloud, Student Union" className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rules & Eligibility Guidelines</Label>
                <Textarea id="rules" {...form.register("rules")} rows={3} placeholder="1. Student ID mandatory. 2. Follow safety regulations." />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5: FAQS & CONTACT PERSON */}
          <Card className="border-border/60 shadow-xs rounded-3xl p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> FAQs & Organizer Contact
              </CardTitle>
              <CardDescription className="text-xs">Helpful Q&A and inquiry contact info</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              {/* Dynamic FAQ List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequently Asked Questions (FAQs)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addFaqPair} className="text-xs font-semibold cursor-pointer">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ Pair
                  </Button>
                </div>

                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary">Question #{idx + 1}</span>
                      {faqs.length > 1 && (
                        <button type="button" onClick={() => removeFaqPair(idx)} className="text-destructive text-xs hover:underline flex items-center">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </button>
                      )}
                    </div>
                    <Input 
                      placeholder="e.g. Is attendance mandatory?" 
                      value={faq.q} 
                      onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      className="h-10 text-xs bg-background"
                    />
                    <Textarea 
                      placeholder="e.g. Yes, certificates require 80% attendance." 
                      value={faq.a} 
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      className="text-xs bg-background"
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              {/* Contact Person */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Person Name</Label>
                  <Input id="contactName" {...form.register("contactName")} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Email</Label>
                  <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Phone</Label>
                  <Input id="contactPhone" {...form.register("contactPhone")} className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SUBMIT BUTTONS */}
          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/dashboard/organizer/events")} className="font-semibold">
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                form.setValue("status", "draft");
                form.handleSubmit(onSubmit)();
              }} 
              disabled={mutation.isPending}
              className="font-bold cursor-pointer"
            >
              Save as Draft
            </Button>
            <Button type="submit" size="lg" disabled={mutation.isPending} className="px-8 font-bold shadow-md cursor-pointer">
              {mutation.isPending ? "Saving Event..." : isEdit ? "Update Event" : "Publish Event Now"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
