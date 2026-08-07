import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventsTable } from "./events";

export const volunteerApplicationStatusEnum = pgEnum(
  "volunteer_application_status",
  ["pending", "approved", "rejected"],
);

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  status: volunteerApplicationStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(
  volunteerApplicationsTable,
).omit({ id: true, appliedAt: true });
export type InsertVolunteerApplication = z.infer<
  typeof insertVolunteerApplicationSchema
>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;
