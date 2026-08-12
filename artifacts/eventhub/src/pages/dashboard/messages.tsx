import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { 
  MessageSquare, Send, Users, ShieldCheck, Trophy, GraduationCap, 
  Sparkles, CheckCheck, RefreshCw, Circle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";

interface ChatMessage {
  id: number;
  channelId: string;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

const TEAM_MEMBERS = [
  { name: "Tanishka Ghewari", role: "admin", email: "tanishkaghewari@gmail.com", icon: ShieldCheck, color: "text-purple-600 bg-purple-100 dark:bg-purple-950/60 border-purple-300" },
  { name: "Payal Mane", role: "organizer", email: "payalmane@gmail.com", icon: Trophy, color: "text-amber-600 bg-amber-100 dark:bg-amber-950/60 border-amber-300" },
  { name: "Mahi Kasliwal", role: "attendee", email: "mahik@gmail.com", icon: GraduationCap, color: "text-blue-600 bg-blue-100 dark:bg-blue-950/60 border-blue-300" },
  { name: "Nehal Ahuja", role: "volunteer", email: "nehalahuja@gmail.com", icon: Users, color: "text-green-600 bg-green-100 dark:bg-green-950/60 border-green-300" },
];

export default function MessagingCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(true);

  // Fetch Message History
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("eventhub_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/chat/messages?channelId=eventhub-team", { headers });
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch chat history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load & Realtime Socket.IO Subscription
  useEffect(() => {
    fetchMessages();

    // BroadcastChannel sync listener for multi-tab / local fallback
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("eventhub_team_chat");
        bc.onmessage = (event) => {
          if (event.data?.type === "NEW_CHAT_MESSAGE" && event.data.payload) {
            const incoming: ChatMessage = event.data.payload;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          }
        };
      }
    } catch {}

    // Socket.IO realtime listener
    const handleNewMessage = (newMsg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (bc) {
        try {
          bc.postMessage({ type: "NEW_CHAT_MESSAGE", payload: newMsg });
        } catch {}
      }
    };

    socket?.on("new_chat_message", handleNewMessage);
    socket?.on("connect", () => setSocketConnected(true));

    return () => {
      socket?.off("new_chat_message", handleNewMessage);
      if (bc) bc.close();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem("eventhub_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const optimisticMsg: ChatMessage = {
      id: tempId,
      channelId: "eventhub-team",
      senderId: (user as any)?.id || 1,
      senderName: user?.name || "Team Member",
      senderRole: user?.role || "attendee",
      message: cleanText,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: cleanText,
          channelId: "eventhub-team",
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const savedMsg = await res.json();
        if (res.ok && savedMsg && savedMsg.id) {
          // Replace temp optimistic message with persisted server message
          setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMsg : m)));
        }
      }
    } catch (err) {
      console.warn("Message delivery note:", err);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Badge className="bg-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5">Admin</Badge>;
      case "organizer":
        return <Badge className="bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5">Organizer</Badge>;
      case "volunteer":
        return <Badge className="bg-green-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5">Volunteer</Badge>;
      default:
        return <Badge className="bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5">Attendee</Badge>;
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "h:mm a");
    } catch {
      return "Just now";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              EventHub Team Realtime Chat
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Live multi-role communication between Admin, Organizer, Attendee, and Volunteer accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white font-bold text-xs px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <Circle className="w-2 h-2 fill-white animate-pulse" /> Live Realtime Connected
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchMessages} className="text-xs font-semibold h-8 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh History
            </Button>
          </div>
        </div>

        {/* CHAT INTERFACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: ACTIVE PARTICIPANTS */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/60 shadow-lg rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Active Team Participants (4)
                </CardTitle>
                <CardDescription className="text-xs">
                  Authenticated multi-device demo team members
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {TEAM_MEMBERS.map((member) => {
                  const isCurrent = user?.role === member.role;
                  const Icon = member.icon;
                  return (
                    <div 
                      key={member.role}
                      className={`p-3.5 rounded-2xl flex items-center gap-3 border transition-all ${
                        isCurrent 
                          ? "bg-primary/10 border-primary/40 shadow-xs" 
                          : "bg-muted/10 border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className={`p-2 rounded-xl border ${member.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-xs text-foreground truncate">{member.name}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[9px] font-extrabold text-primary border-primary/30">YOU</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="capitalize font-semibold">{member.role}</span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <Circle className="w-1.5 h-1.5 fill-green-600" /> Online
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: LIVE GROUP CHAT FEED */}
          <div className="lg:col-span-8">
            <Card className="border-border/60 shadow-xl rounded-3xl overflow-hidden bg-card flex flex-col h-[620px]">
              
              {/* CHAT FEED HEADER */}
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">EventHub Team Channel</h3>
                    <p className="text-xs text-muted-foreground">Channel: #eventhub-team • 4 Live Participants</p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-bold border-border">
                  Public Team Room
                </Badge>
              </div>

              {/* MESSAGES FEED */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-muted/10">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading live messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-6 space-y-2">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
                    <p className="text-xs font-semibold text-foreground">No messages yet in this channel.</p>
                    <p className="text-[11px] text-muted-foreground">Be the first team member to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === (user as any)?.id || msg.senderName === user?.name || (user?.role && msg.senderRole === user.role);

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div className={`p-4 rounded-3xl text-xs max-w-[85%] sm:max-w-[75%] space-y-2 shadow-sm transition-all ${
                          isSelf
                            ? "bg-primary text-primary-foreground rounded-br-xs"
                            : "bg-card border border-border/80 text-foreground rounded-bl-xs"
                        }`}>
                          
                          {/* Sender Metadata Bar */}
                          <div className="flex items-center justify-between gap-3 border-b border-current/10 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[11px] tracking-tight">{msg.senderName}</span>
                              {!isSelf && getRoleBadge(msg.senderRole)}
                            </div>
                            <span className="text-[9px] opacity-75 font-mono">{formatMessageTime(msg.createdAt)}</span>
                          </div>

                          {/* Message Text */}
                          <p className="leading-relaxed text-xs break-words">{msg.message}</p>

                          {/* Read Receipts */}
                          {isSelf && (
                            <div className="flex justify-end pt-0.5">
                              <span className="text-[9px] opacity-85 flex items-center gap-1 font-semibold">
                                <CheckCheck className="w-3.5 h-3.5 text-blue-200" /> Delivered
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={chatEndRef} />
              </div>

              {/* INPUT FORM */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex items-center gap-2">
                <Input
                  placeholder={`Send a message as ${user?.name || "Team Member"} (${user?.role?.toUpperCase()})...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  className="h-11 text-xs font-semibold flex-1 rounded-2xl border-border focus-visible:ring-primary"
                />

                <Button 
                  type="submit" 
                  disabled={!inputText.trim() || isSending}
                  className="font-bold h-11 px-5 shadow-md cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Send
                </Button>
              </form>

            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
