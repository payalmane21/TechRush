import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventsTable } from "./events";
import { registrationsTable } from "./registrations";

export const paymentRecordStatusEnum = pgEnum("payment_record_status", [
  "created",
  "authorized",
  "captured",
  "failed",
  "refunded",
]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrationsTable.id),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  amount: integer("amount").notNull(), // amount in INR
  currency: text("currency").notNull().default("INR"),
  provider: text("provider").notNull().default("razorpay"),
  orderId: text("order_id").notNull().unique(),
  paymentId: text("payment_id"),
  signature: text("signature"),
  status: paymentRecordStatusEnum("status").notNull().default("created"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
