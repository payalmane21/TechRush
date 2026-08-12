import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { eventsTable } from "./events";

export const volunteerApplicationStatusEnum = pgEnum(
  "volunteer_application_status",
  ["pending", "applied", "shortlisted", "assigned", "approved", "rejected", "withdrawn", "completed"],
);

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  skills: text("skills"),
  experience: text("experience"),
  interests: text("interests"),
  preferredRoles: text("preferred_roles"),
  availability: text("availability"),
  resumeUrl: text("resume_url"),
  resumeText: text("resume_text"),
  status: text("status").notNull().default("applied"),
  assignedRole: text("assigned_role"),
  matchScore: integer("match_score").default(0),
  matchReason: text("match_reason"),
  matchingSkills: text("matching_skills"),
  skillGaps: text("skill_gaps"),
  message: text("message"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(
  volunteerApplicationsTable,
).omit({ id: true, appliedAt: true, updatedAt: true });

export type InsertVolunteerApplication = z.infer<
  typeof insertVolunteerApplicationSchema
>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;
