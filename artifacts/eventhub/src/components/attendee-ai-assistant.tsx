import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  RotateCcw,
  Ticket,
  CreditCard,
  Calendar,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
  MapPin,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CHATBOT_THEMES,
  ThemeCategory,
  resolveThemeCategory,
  svgToDataUri,
} from "@/lib/chatbot-themes";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  mascotName?: string;
  mascotUrl?: string;
  actions?: Array<{
    label: string;
    url: string;
    type: string;
  }>;
  suggestedFollowUps?: string[];
}

export function AttendeeAiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Detect active event context from URL (/events/:id)
  const eventMatch = location.match(/^\/events\/(\d+)/);
  const activeEventId = eventMatch ? parseInt(eventMatch[1], 10) : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active theme and mascot state
  const [activeTheme, setActiveTheme] = useState<ThemeCategory>("GENERAL");
  const [mascotName, setMascotName] = useState<string>("Nova the Campus Spark");
  const [mascotUrl, setMascotUrl] = useState<string>(() => svgToDataUri(CHATBOT_THEMES.GENERAL.mascotSvg));
  const [mascotRole, setMascotRole] = useState<string>("Official EventHub Concierge");
  const [eventTitle, setEventTitle] = useState<string | null>(null);

  // Synchronize event-specific mascot and theme when viewing an event
  useEffect(() => {
    if (activeEventId) {
      fetch(`/api/events/${activeEventId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((ev) => {
          if (ev) {
            setEventTitle(ev.title);
            const derivedTheme = resolveThemeCategory(ev.category, ev.title);
            setActiveTheme(derivedTheme);
            const config = CHATBOT_THEMES[derivedTheme] || CHATBOT_THEMES.GENERAL;

            if (ev.mascotUrl) {
              setMascotUrl(ev.mascotUrl);
              setMascotName(ev.title + " Mascot");
            } else {
              setMascotUrl(svgToDataUri(config.mascotSvg));
              setMascotName(config.assistantName);
            }
            setMascotRole(`${ev.title} Assistant`);

            // Initialize or update welcome message with event context
            setMessages([
              {
                id: `welcome_event_${activeEventId}`,
                sender: "ai",
                text: `Hi **${user?.name || "Student"}**! 👋\n\nI am your official **${ev.title}** AI Assistant. Ask me anything about this event's schedule, ticket pricing, campus venue, or how to register!`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                suggestedFollowUps: [
                  "What is this event about?",
                  "How much does it cost?",
                  "Where is it located?",
                  "How do I register?",
                ],
              },
            ]);
          }
        })
        .catch(() => {});
    } else {
      // Reset to default general campus theme
      setEventTitle(null);
      setActiveTheme("GENERAL");
      setMascotName(CHATBOT_THEMES.GENERAL.assistantName);
      setMascotUrl(svgToDataUri(CHATBOT_THEMES.GENERAL.mascotSvg));
      setMascotRole("Official EventHub Concierge");

      if (messages.length === 0 || messages[0]?.id.startsWith("welcome_event")) {
        setMessages([
          {
            id: "welcome_general",
            sender: "ai",
            text: `Hello **${user?.name || "Student"}**! 👋\n\nI am **Nova the Campus Spark**, your EventHub AI Assistant. I have real-time access to live event schedules, your confirmed registrations, and gate QR passes.\n\nHow can I help you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggestedFollowUps: [
              "What events are available?",
              "Show my registrations",
              "Which events are free?",
              "Where is my QR pass?",
            ],
          },
        ]);
      }
    }
  }, [activeEventId, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // If user is not an attendee, do not render the assistant
  if (!user || user.role !== "attendee") {
    return null;
  }

  const themeConfig = CHATBOT_THEMES[activeTheme] || CHATBOT_THEMES.GENERAL;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("eventhub_token") || "";
      const res = await fetch("/api/chat/attendee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          message: text,
          eventId: activeEventId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reach AI assistant");
      }

      const data = await res.json();

      // Update theme and mascot if returned by server
      if (data.theme && CHATBOT_THEMES[data.theme as ThemeCategory]) {
        setActiveTheme(data.theme as ThemeCategory);
      }
      if (data.mascotName) {
        setMascotName(data.mascotName);
      }
      if (data.mascotUrl) {
        setMascotUrl(data.mascotUrl);
      }
      if (data.mascotRole) {
        setMascotRole(data.mascotRole);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mascotName: data.mascotName || mascotName,
        mascotUrl: data.mascotUrl || mascotUrl,
        actions: data.actions,
        suggestedFollowUps: data.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Notice:** ${err.message || "Unable to retrieve real-time data. Please try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const greeting = activeEventId && eventTitle
      ? `Conversation cleared. What else would you like to know about **${eventTitle}**, **${user?.name || "Student"}**?`
      : `Conversation cleared. How can I assist you with your campus activities, **${user?.name || "Student"}**?`;

    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: "ai",
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: activeEventId
          ? [
              "What is this event about?",
              "How much does it cost?",
              "Where is it located?",
              "How do I register?",
            ]
          : [
              "What events are available?",
              "Show my registrations",
              "Which events are free?",
              "Where is my QR pass?",
            ],
      },
    ]);
    toast({ title: "Chat Reset", description: "Started a fresh conversation session." });
  };

  return (
    <>
      {/* 1. FLOATING CHATBOT TRIGGER BUTTON WITH THEMATIC MASCOT */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div
            className="hidden sm:flex items-center gap-2.5 bg-card/95 text-foreground px-4 py-2 rounded-2xl shadow-xl text-xs font-bold animate-bounce cursor-pointer border border-border/80 backdrop-blur-md hover:border-primary transition-all"
            onClick={() => setIsOpen(true)}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-primary/40">
              <img src={mascotUrl} alt={mascotName} className="w-full h-full object-contain" />
            </div>
            <span>{eventTitle ? `Ask about ${eventTitle}` : "Need Event Help? Ask AI!"}</span>
          </div>
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-2xl p-1 transition-all duration-300 ${
            isOpen
              ? "bg-muted text-foreground hover:bg-muted/80 rotate-90"
              : "bg-primary text-primary-foreground hover:scale-105 shadow-primary/30"
          }`}
          title="EventHub AI Attendee Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden p-0.5">
              <img src={mascotUrl} alt={mascotName} className="w-full h-full object-contain" />
            </div>
          )}
        </Button>
      </div>

      {/* 2. CHAT PANEL MODAL WITH EVENT THEMED ACCENTS */}
      {isOpen && (
        <Card
          className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[580px] z-50 rounded-3xl border shadow-2xl flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200 ${themeConfig.borderGlowClass}`}
        >
          {/* Thematic Header */}
          <CardHeader
            className={`bg-gradient-to-r ${themeConfig.gradientClass} text-white p-4 shrink-0 flex flex-row items-center justify-between space-y-0 border-b border-white/10`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border-2 border-white/30 shadow-md bg-black/20 p-0.5">
                <img src={mascotUrl} alt={mascotName} className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-serif font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{mascotName}</span>
                  <Badge className="bg-white/20 text-white text-[9px] font-extrabold px-1.5 py-0 border-white/30 shrink-0">
                    {themeConfig.badgeLabel}
                  </Badge>
                </CardTitle>
                <p className="text-[10px] text-white/80 font-medium truncate">
                  {mascotRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title="Clear Chat History"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Scroll Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 mt-0.5 border border-border/60 bg-muted/30 p-0.5">
                    <img src={msg.mascotUrl || mascotUrl} alt="Mascot" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs font-medium shadow-2xs"
                        : "bg-muted/70 text-foreground rounded-tl-xs border border-border/50 shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actions.map((act, i) => (
                        <Link key={i} href={act.url}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="h-7 text-[11px] font-bold bg-card hover:bg-primary hover:text-primary-foreground border-primary/30 shadow-2xs rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-up Prompts */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Quick Questions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/15 px-2.5 py-1 rounded-full border border-primary/20 transition-colors text-left cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-muted-foreground block text-right px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-muted/30 p-0.5">
                  <img src={mascotUrl} alt="Mascot" className="w-full h-full object-contain" />
                </div>
                <div className="bg-muted/70 p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Searching EventHub data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex gap-1.5 overflow-x-auto text-[10px]">
              {themeConfig.defaultSuggestions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="whitespace-nowrap bg-background hover:bg-muted px-2.5 py-1 rounded-xl border border-border/60 text-muted-foreground font-semibold cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <CardFooter className="p-3 border-t border-border/60 bg-card/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 w-full"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={eventTitle ? `Ask about ${eventTitle}...` : "Ask about events, tickets, QR pass, or payment..."}
                disabled={isLoading}
                className="h-10 text-xs rounded-xl bg-background"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputMessage.trim()}
                className="h-10 px-3.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
