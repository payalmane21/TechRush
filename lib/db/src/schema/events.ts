import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "pending_approval",
  "approved",
  "published",
  "rejected",
  "cancelled",
  "closed",
  "archived",
]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id")
    .notNull()
    .references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  bannerUrl: text("banner_url"),
  venue: text("venue").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull(),
  price: integer("price").notNull().default(0), // Price in INR (0 = Free, >0 = Paid)
  registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
  status: text("status").notNull().default("draft"),
  
  // Approval Lifecycle & Audit Trail Fields
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  submittedBy: integer("submitted_by").references(() => usersTable.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedBy: integer("approved_by").references(() => usersTable.id),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  rejectedBy: integer("rejected_by").references(() => usersTable.id),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
