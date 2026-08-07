import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { registrationsTable } from "./registrations";

export const checkinActionEnum = pgEnum("checkin_action", [
  "check_in",
  "check_out",
]);

export const checkinLogsTable = pgTable("checkin_logs", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id")
    .notNull()
    .references(() => registrationsTable.id),
  scannedBy: integer("scanned_by").references(() => usersTable.id),
  action: checkinActionEnum("action").notNull(),
  station: text("station"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckinLogSchema = createInsertSchema(checkinLogsTable).omit({
  id: true,
});
export type InsertCheckinLog = z.infer<typeof insertCheckinLogSchema>;
export type CheckinLog = typeof checkinLogsTable.$inferSelect;
