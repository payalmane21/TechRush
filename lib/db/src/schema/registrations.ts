import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventsTable } from "./events";

export const registrationStatusEnum = pgEnum("registration_status", [
  "registered",
  "waitlisted",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "free",
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  attendeeName: text("attendee_name"),
  attendeeEmail: text("attendee_email"),
  attendeePhone: text("attendee_phone"),
  attendeeCollege: text("attendee_college"),
  status: registrationStatusEnum("status").notNull().default("registered"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("free"),
  amountPaid: integer("amount_paid").notNull().default(0), // in INR
  paymentId: text("payment_id"),
  qrToken: text("qr_token").notNull().unique(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  registeredAt: true,
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
