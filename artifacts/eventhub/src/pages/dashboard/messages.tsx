import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, Send, Paperclip, Smile, CheckCheck, Users, Megaphone,
  Search, ShieldCheck, UserCheck, Image, FileText, X, Sparkles, Circle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function MessagingCenter() {
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Channels List State
  const [channels, setChannels] = useState([
    {
      id: "c1",
      name: "📢 Hackathon Official Broadcast",
      type: "announcement",
      badge: "Announcement",
      unread: 1,
      avatar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=100",
      description: "Official event announcements to all 380 registered attendees.",
    },
    {
      id: "c2",
      name: "👥 Volunteer Operations Crew",
      type: "group",
      badge: "Group Chat",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=100",
      description: "Organizers & Volunteers shift coordination channel.",
    },
    {
      id: "c3",
      name: "Priya Patel (Scanner Lead)",
      type: "direct",
      badge: "Volunteer ↔ Organizer",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      description: "Direct shift support chat.",
    },
    {
      id: "c4",
      name: "Rohan Gupta (Attendee)",
      type: "direct",
      badge: "Participant ↔ Support",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
      description: "Participant inquiry regarding workshop desk.",
    },
  ]);

  const [activeChannelId, setActiveChannelId] = useState("c2");
  const [searchQuery, setSearchQuery] = useState("");

  // Messages Store State
  const [messagesStore, setMessagesStore] = useState<Record<string, any[]>>({
    c1: [
      {
        id: 101,
        sender: "Organizer Helpdesk",
        role: "Organizer",
        text: "📢 Welcome to Spring Hackathon 2026! Opening keynote starts at 9:00 AM at the Main Auditorium.",
        time: "8:30 AM",
        isSelf: false,
        read: true,
        file: null,
      },
    ],
    c2: [
      {
        id: 201,
        sender: "Aarav Sharma",
        role: "Volunteer Lead",
        text: "Gate A QR scanner desk is fully staffed and ready for early arrival check-ins.",
        time: "8:45 AM",
        isSelf: false,
        read: true,
        file: null,
      },
      {
        id: 202,
        sender: "Organizer Desk",
        role: "Organizer",
        text: "Great work! Please keep an eye out for VIP guest badges at Entrance 2.",
        time: "8:50 AM",
        isSelf: true,
        read: true,
        file: null,
      },
      {
        id: 203,
        sender: "Priya Patel",
        role: "Volunteer",
        text: "Uploading the updated shift station map for all volunteers.",
        time: "9:05 AM",
        isSelf: false,
        read: true,
        file: { name: "Volunteer_Station_Roster.pdf", size: "1.2 MB", type: "pdf" },
      },
    ],
    c3: [
      {
        id: 301,
        sender: "Priya Patel",
        role: "Volunteer Lead",
        text: "Hi Organizer! Are additional QR scanners available for Gate B?",
        time: "9:10 AM",
        isSelf: false,
        read: true,
        file: null,
      },
    ],
    c4: [
      {
        id: 401,
        sender: "Rohan Gupta",
        role: "Participant",
        text: "Hi! What time does the AI Workshop track begin?",
        time: "9:15 AM",
        isSelf: false,
        read: true,
        file: null,
      },
    ],
  });

  // Message Form State
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const activeMessages = messagesStore[activeChannelId] || [];

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const newMsg = {
      id: Date.now(),
      sender: "Organizer Helpdesk",
      role: "Organizer",
      text: inputText.trim(),
      time: format(new Date(), "h:mm a"),
      isSelf: true,
      read: true,
      file: selectedFile ? { name: selectedFile.name, size: selectedFile.size, type: "file" } : null,
    };

    setMessagesStore({
      ...messagesStore,
      [activeChannelId]: [...activeMessages, newMsg],
    });

    setInputText("");
    setSelectedFile(null);
    setShowEmojiPicker(false);

    // Simulate response & typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2500);

    toast({
      title: "Message Sent",
      description: "Delivered to channel.",
    });
  };

  // Add Emoji to Input
  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  // Simulated File Upload Attachment
  const handleAttachFile = () => {
    setSelectedFile({ name: "Event_Schedule_Schedule.pdf", size: "850 KB" });
    toast({ title: "File Attached", description: "Event_Schedule_Schedule.pdf ready to send." });
  };

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              EventHub Messaging Center
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Direct & Group messaging between Organizers, Volunteers, and Registered Participants with file sharing, announcements, and read receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white font-bold text-xs px-3 py-1">
              🟢 Live Socket Connected
            </Badge>
          </div>
        </div>

        {/* MESSAGING INTERFACE GRID */}
        <Card className="border-border/60 shadow-lg rounded-3xl overflow-hidden min-h-[620px] grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT CHANNELS SIDEBAR */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border bg-card/60 p-4 space-y-4">
            
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search conversations & team channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs font-semibold rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-2">Active Channels</span>
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredChannels.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChannelId(c.id)}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                      activeChannelId === c.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/20 shadow-2xs" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-xs truncate">{c.name}</h4>
                        {c.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground font-bold text-[9px] flex items-center justify-center shrink-0">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${activeChannelId === c.id ? "opacity-80" : "text-muted-foreground"}`}>
                        {c.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT CHAT CONVERSATION VIEW */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-muted/20">
            
            {/* CHAT HEADER */}
            <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeChannel.avatar} alt={activeChannel.name} className="w-10 h-10 rounded-2xl object-cover border border-primary/20" />
                <div>
                  <h3 className="font-bold text-base text-foreground">{activeChannel.name}</h3>
                  <p className="text-xs text-muted-foreground">{activeChannel.description}</p>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] font-bold">
                {activeChannel.badge}
              </Badge>
            </div>

            {/* MESSAGES FEED */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[440px] flex-1">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-3xl text-xs max-w-[80%] space-y-2 shadow-2xs ${
                    msg.isSelf
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-card border border-border text-foreground rounded-bl-xs"
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-current/10 pb-1">
                      <span className="font-bold text-[10px] opacity-90">{msg.sender} ({msg.role})</span>
                      <span className="text-[9px] opacity-70">{msg.time}</span>
                    </div>

                    <p className="leading-relaxed text-xs">{msg.text}</p>

                    {/* File Attachment Card */}
                    {msg.file && (
                      <div className="p-3 bg-black/10 dark:bg-white/10 rounded-2xl flex items-center gap-3 border border-current/20">
                        <FileText className="w-5 h-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs block truncate">{msg.file.name}</span>
                          <span className="text-[9px] opacity-70 block">{msg.file.size}</span>
                        </div>
                      </div>
                    )}

                    {/* Read Receipts */}
                    {msg.isSelf && (
                      <div className="flex justify-end pt-0.5">
                        <span className="text-[9px] opacity-80 flex items-center gap-1 font-semibold">
                          <CheckCheck className="w-3.5 h-3.5 text-blue-300" /> Read
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator Animation */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic bg-card px-3 py-2 rounded-2xl w-fit border border-border">
                  <Circle className="w-2 h-2 fill-primary text-primary animate-ping" />
                  <span>Priya Patel is typing a response...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ATTACHMENT PREVIEW */}
            {selectedFile && (
              <div className="px-6 py-2 bg-muted/60 border-t border-border flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-foreground">
                  <Paperclip className="w-4 h-4 text-primary" /> Attached: <strong>{selectedFile.name}</strong> ({selectedFile.size})
                </span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* EMOJI QUICK BAR */}
            {showEmojiPicker && (
              <div className="px-6 py-2 bg-card border-t border-border flex items-center gap-2">
                {["👍", "🔥", "🎉", "❤️", "🚀", "✅", "👏", "⭐"].map((e) => (
                  <button key={e} type="button" onClick={() => addEmoji(e)} className="text-lg hover:scale-125 transition-transform">
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex items-center gap-2">
              <Button type="button" size="icon" variant="ghost" onClick={handleAttachFile} className="shrink-0 text-muted-foreground hover:text-primary">
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button type="button" size="icon" variant="ghost" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="shrink-0 text-muted-foreground hover:text-primary">
                <Smile className="w-4 h-4" />
              </Button>

              <Input
                placeholder="Type your message, announcement, or update..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-11 text-xs font-semibold flex-1 rounded-2xl"
              />

              <Button type="submit" size="sm" className="font-bold h-11 px-5 shadow-md cursor-pointer shrink-0">
                <Send className="w-4 h-4 mr-1.5" /> Send
              </Button>
            </form>

          </div>

        </Card>
      </div>
    </DashboardLayout>
  );
}
