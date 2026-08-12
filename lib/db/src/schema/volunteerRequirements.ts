import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const volunteerRequirementsTable = pgTable("volunteer_requirements", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id),
  role: text("role").notNull(),
  requiredSkills: text("required_skills"), // comma-separated or JSON list
  preferredSkills: text("preferred_skills"),
  responsibilities: text("responsibilities"),
  experienceRequirement: text("experience_requirement"),
  availabilityRequirement: text("availability_requirement"),
  numberRequired: integer("number_required").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerRequirementSchema = createInsertSchema(
  volunteerRequirementsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertVolunteerRequirement = z.infer<
  typeof insertVolunteerRequirementSchema
>;
export type VolunteerRequirement = typeof volunteerRequirementsTable.$inferSelect;
