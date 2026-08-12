import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Link } from "wouter";
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
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    url: string;
    type: string;
  }>;
  suggestedFollowUps?: string[];
}

const SUGGESTED_PROMPTS = [
  "What events are available?",
  "Show my registrations",
  "Which events are free?",
  "Where can I find my QR pass?",
  "What events require payment?",
  "How do I register for an event?",
];

export function AttendeeAiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hello **${user?.name || "Student"}**! 👋\n\nI am your **EventHub AI Event Assistant**. I have real-time access to campus event catalogs, your confirmed registrations, and verified QR passes.\n\nHow can I help you today?`,
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
  }, [user]);

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
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reach AI assistant");
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: data.actions,
        suggestedFollowUps: data.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Error:** ${err.message || "Unable to retrieve data. Please try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: "ai",
        text: `Conversation cleared. How can I assist you with your campus activities, **${user?.name || "Student"}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: [
          "What events are available?",
          "Show my registrations",
          "Where is my QR pass?",
        ],
      },
    ]);
    toast({ title: "Chat Cleared", description: "Started a fresh conversation session." });
  };

  return (
    <>
      {/* 1. FLOATING CHATBOT TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-primary/95 text-primary-foreground px-4 py-2 rounded-2xl shadow-xl text-xs font-bold animate-bounce cursor-pointer border border-primary-foreground/20" onClick={() => setIsOpen(true)}>
            <Sparkles className="w-3.5 h-3.5 text-accent" /> Need Event Help? Ask AI!
          </div>
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-2xl p-0 transition-all duration-300 ${
            isOpen
              ? "bg-muted text-foreground hover:bg-muted/80 rotate-90"
              : "bg-gradient-to-r from-primary via-primary to-accent text-white hover:scale-105 shadow-primary/30"
          }`}
          title="EventHub AI Attendee Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </Button>
      </div>

      {/* 2. CHAT PANEL MODAL / DRAWER */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[580px] z-50 rounded-3xl border-primary/20 shadow-2xl flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Top Header */}
          <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground p-4 shrink-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 text-accent flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                  EventHub AI Assistant
                  <Badge className="bg-accent text-accent-foreground text-[9px] font-extrabold px-1.5 py-0">LIVE</Badge>
                </CardTitle>
                <p className="text-[10px] text-primary-foreground/75 font-medium">
                  Grounded with real-time campus data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title="Clear Chat History"
                className="h-8 w-8 text-primary-foreground hover:bg-white/10 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="h-8 w-8 text-primary-foreground hover:bg-white/10 rounded-xl"
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
                  <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs font-medium"
                        : "bg-muted/70 text-foreground rounded-tl-xs border border-border/50"
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Suggested:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/15 px-2.5 py-1 rounded-full border border-primary/20 transition-colors text-left"
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
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="w-3.5 h-3.5" />
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

          {/* Quick Prompts Bar if thread is short */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex gap-1.5 overflow-x-auto text-[10px]">
              {SUGGESTED_PROMPTS.slice(0, 3).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="whitespace-nowrap bg-background hover:bg-muted px-2.5 py-1 rounded-xl border border-border/60 text-muted-foreground font-semibold"
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
                placeholder="Ask about events, tickets, QR pass, or payment..."
                disabled={isLoading}
                className="h-10 text-xs rounded-xl bg-background"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputMessage.trim()}
                className="h-10 px-3.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm"
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
