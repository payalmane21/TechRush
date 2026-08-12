import { Router, type IRouter, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../lib/auth";
import { processAttendeeChatMessage } from "../lib/ai-assistant";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Abuse protection rate limiter: 30 requests per minute per IP
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment before asking the AI assistant again.",
  },
});

/**
 * POST /api/chat/attendee
 * EXCLUSIVELY AVAILABLE TO ATTENDEES.
 * Non-attendees (organizer, admin, volunteer) receive 403 Forbidden.
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

  const { message } = req.body || {};

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
    const aiResponse = await processAttendeeChatMessage(message, userId!, userName);
    res.status(200).json(aiResponse);
  } catch (err: any) {
    console.error("AI Assistant processing error:", err);
    res.status(500).json({
      error: "The AI Assistant is currently processing other requests. Please try again in a few moments.",
    });
  }
});

export default router;
