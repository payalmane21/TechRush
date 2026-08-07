import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, registrationsTable, eventsTable, usersTable } from "@workspace/db";
import { CancelRegistrationParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { generateQrToken } from "../lib/auth";
import { generateQrCodeDataUrl } from "../lib/qrcode";

const router: IRouter = Router();

// POST /events/:id/register
router.post("/events/:id/register", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const eventId = parseInt(raw!, 10);
  if (isNaN(eventId)) { res.status(400).json({ error: "Invalid event ID" }); return; }

  const userId = req.session.userId!;

  // Check event exists and is published
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  if (event.status !== "published") { res.status(400).json({ error: "Event is not open for registration" }); return; }

  // Check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    res.status(400).json({ error: "Registration deadline has passed" });
    return;
  }

  // Check for existing registration
  const [existing] = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.eventId, eventId),
        eq(registrationsTable.userId, userId),
      ),
    );

  if (existing && existing.status !== "cancelled") {
    res.status(400).json({ error: "Already registered for this event" });
    return;
  }

  // Check capacity
  const [countRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(registrationsTable)
    .where(and(
      eq(registrationsTable.eventId, eventId),
      eq(registrationsTable.status, "registered"),
    ));

  const currentCount = Number(countRow?.count ?? 0);
  const status = currentCount >= event.capacity ? "waitlisted" : "registered";

  let registration;
  if (existing && existing.status === "cancelled") {
    // Re-register: update existing
    const qrToken = generateQrToken(existing.id);
    [registration] = await db
      .update(registrationsTable)
      .set({ status, qrToken, checkedInAt: null, checkedOutAt: null })
      .where(eq(registrationsTable.id, existing.id))
      .returning();
  } else {
    // Insert temp to get ID, then update qrToken
    const [tempReg] = await db
      .insert(registrationsTable)
      .values({
        eventId,
        userId,
        status,
        qrToken: `temp-${Date.now()}`,
      })
      .returning();

    const qrToken = generateQrToken(tempReg!.id);
    [registration] = await db
      .update(registrationsTable)
      .set({ qrToken })
      .where(eq(registrationsTable.id, tempReg!.id))
      .returning();
  }

  const qrCodeDataUrl = await generateQrCodeDataUrl(registration!.qrToken);

  res.status(201).json({
    ...registration!,
    qrCodeDataUrl,
  });
});

// GET /registrations/me
router.get("/registrations/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const registrations = await db
    .select({
      registration: registrationsTable,
      event: eventsTable,
    })
    .from(registrationsTable)
    .innerJoin(eventsTable, eq(eventsTable.id, registrationsTable.eventId))
    .where(eq(registrationsTable.userId, userId))
    .orderBy(desc(registrationsTable.registeredAt));

  const results = await Promise.all(
    registrations.map(async ({ registration, event }) => {
      const qrCodeDataUrl = registration.status !== "cancelled"
        ? await generateQrCodeDataUrl(registration.qrToken)
        : null;

      // Get event registration counts
      return {
        ...registration,
        qrCodeDataUrl,
        event: {
          ...event,
          registeredCount: 0,
          checkedInCount: 0,
        },
      };
    }),
  );

  res.json(results);
});

// DELETE /registrations/:id
router.delete("/registrations/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid registration ID" }); return; }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, id));

  if (!registration) { res.status(404).json({ error: "Registration not found" }); return; }
  if (registration.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db
    .update(registrationsTable)
    .set({ status: "cancelled" })
    .where(eq(registrationsTable.id, id));

  res.sendStatus(204);
});

export default router;
