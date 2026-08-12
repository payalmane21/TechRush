import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getUserNotifications, globalNotifications, addPersistentNotification } from "../lib/store";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /notifications - list notifications for current user/admin
router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId;
  const role = req.session.role;

  let dbRows: any[] = [];
  try {
    const { or } = await import("drizzle-orm");
    const queryCondition = role === "admin"
      ? or(eq(notificationsTable.userId, userId), eq(notificationsTable.userId, 999), eq(notificationsTable.userId, 0))
      : eq(notificationsTable.userId, userId);

    dbRows = await db
      .select()
      .from(notificationsTable)
      .where(queryCondition)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
  } catch {}

  const memNotifications = getUserNotifications(userId, role);
  
  // Merge and deduplicate by title & createdAt/id
  const seen = new Set<string>();
  const combined = [...dbRows, ...memNotifications].filter((n) => {
    const key = `${n.type}:${n.title}:${n.relatedEventId || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const unreadCount = combined.filter((n) => !n.isRead).length;

  res.json({
    notifications: combined,
    unreadCount,
  });
});

// PATCH /notifications/:id/read - mark single notification as read
router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid notification ID" });
    return;
  }

  const found = globalNotifications.find(n => n.id === id);
  if (found) {
    found.isRead = true;
  }

  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id));
  } catch {}

  res.json({ success: true, id, isRead: true });
});

// POST /notifications/mark-all-read - mark all as read
router.post("/notifications/mark-all-read", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId;
  const role = req.session.role;

  globalNotifications.forEach(n => {
    if (role === "admin" || n.userId === userId) {
      n.isRead = true;
    }
  });

  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
  } catch {}

  res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
