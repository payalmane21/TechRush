import { Router, type IRouter, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../lib/auth";
import { processAttendeeChatMessage } from "../lib/ai-assistant";
import { db, usersTable, chatMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { getIo } from "../lib/socket";

const router: IRouter = Router();

// Abuse protection rate limiter: 60 requests per minute per IP
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many messages sent. Please wait a moment before sending again.",
  },
});

export interface GroupChatMessageItem {
  id: number;
  channelId: string;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

// In-Memory Persistent Store for Instant Realtime History
const inMemoryChatMessages: GroupChatMessageItem[] = [
  {
    id: 1,
    channelId: "eventhub-team",
    senderId: 999,
    senderName: "Tanishka Ghewari",
    senderRole: "admin",
    message: "👋 Welcome to the EventHub Team Live Chat! All roles are connected.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    channelId: "eventhub-team",
    senderId: 2,
    senderName: "Payal Mane",
    senderRole: "organizer",
    message: "Ready to coordinate live campus events and review registrations.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// Helper to look up user metadata from DB or memory fallback
const DEMO_USER_NAMES: Record<number, { name: string; role: string }> = {
  999: { name: "Tanishka Ghewari", role: "admin" },
  2: { name: "Payal Mane", role: "organizer" },
  3: { name: "Mahi Kasliwal", role: "attendee" },
  4: { name: "Nehal Ahuja", role: "volunteer" },
  998: { name: "Tanishka Ghewari", role: "admin" },
  102: { name: "Payal Mane", role: "organizer" },
  103: { name: "Mahi Kasliwal", role: "attendee" },
  104: { name: "Nehal Ahuja", role: "volunteer" },
};

/**
 * GET /api/chat/messages
 * Fetches group chat history for the authenticated team
 */
router.get("/chat/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const channelId = (req.query.channelId as string) || "eventhub-team";

  try {
    const dbMessages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.channelId, channelId))
      .orderBy(asc(chatMessagesTable.createdAt));

    if (dbMessages && dbMessages.length > 0) {
      res.json({
        messages: dbMessages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        channelId,
      });
      return;
    }
  } catch {}

  // Fallback to in-memory store
  const filtered = inMemoryChatMessages.filter((m) => m.channelId === channelId);
  res.json({
    messages: filtered,
    channelId,
  });
});

/**
 * POST /api/chat/messages
 * Broadcasts a new message from the authenticated user to all connected clients
 */
router.post("/chat/messages", requireAuth, chatRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId || 1;
  const userRole = req.session.userRole || (req.session as any).role || "attendee";
  const { message, channelId = "eventhub-team" } = req.body || {};

  // 1. Validation
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message cannot be empty." });
    return;
  }

  const cleanMessage = message.trim().slice(0, 1000);

  // 2. Resolve sender name
  let senderName = DEMO_USER_NAMES[userId]?.name || "Team Member";
  try {
    const [user] = await db
      .select({ name: usersTable.name, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (user?.name) {
      senderName = user.name;
    }
  } catch {}

  const now = new Date();
  let savedMessage: GroupChatMessageItem;

  // 3. Database insert with in-memory fallback
  try {
    const [inserted] = await db
      .insert(chatMessagesTable)
      .values({
        channelId,
        senderId: userId,
        senderName,
        senderRole: userRole,
        message: cleanMessage,
      })
      .returning();

    if (inserted) {
      savedMessage = {
        id: inserted.id,
        channelId: inserted.channelId,
        senderId: inserted.senderId || userId,
        senderName: inserted.senderName,
        senderRole: inserted.senderRole,
        message: inserted.message,
        createdAt: inserted.createdAt.toISOString(),
      };
    } else {
      throw new Error("Insert returned empty");
    }
  } catch {
    const msgId = Date.now() + Math.floor(Math.random() * 1000);
    savedMessage = {
      id: msgId,
      channelId,
      senderId: userId,
      senderName,
      senderRole: userRole,
      message: cleanMessage,
      createdAt: now.toISOString(),
    };
  }

  // Push to in-memory list
  inMemoryChatMessages.push(savedMessage);
  if (inMemoryChatMessages.length > 500) {
    inMemoryChatMessages.shift();
  }

  // 4. Realtime Socket.IO Broadcast to all connected participants
  const io = getIo();
  if (io) {
    io.emit("new_chat_message", savedMessage);
  }

  res.status(201).json(savedMessage);
});

/**
 * POST /api/chat/attendee
 * EXCLUSIVELY AVAILABLE TO ATTENDEES (AI Chatbot Concierge).
 */
router.post("/chat/attendee", requireAuth, chatRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const userRole = req.session.userRole || (req.session as any).role;

  // 1. Strict Server-Side Role Guard
  if (userRole !== "attendee") {
    res.status(403).json({
      error: "Access denied. The AI Event Assistant is exclusively available to attendees.",
      role: userRole,
    });
    return;
  }

  const { message, eventId } = req.body || {};

  // 2. Validate input
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required and cannot be empty." });
    return;
  }

  // 3. Resolve user display name
  let userName = "Attendee";
  try {
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId!))
      .limit(1);
    if (user?.name) {
      userName = user.name;
    }
  } catch {}

  try {
    const targetEventId = eventId && !isNaN(Number(eventId)) ? Number(eventId) : undefined;
    const aiResponse = await processAttendeeChatMessage(message, userId!, userName, targetEventId);
    res.status(200).json(aiResponse);
  } catch (err: any) {
    console.error("AI Assistant processing error:", err);
    res.status(500).json({
      error: "The AI Assistant is currently processing other requests. Please try again in a few moments.",
    });
  }
});

export default router;
