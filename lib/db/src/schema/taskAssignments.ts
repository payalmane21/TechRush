import { pgTable, serial, integer, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { tasksTable } from "./tasks";

export const taskAssignmentStatusEnum = pgEnum("task_assignment_status", [
  "assigned",
  "confirmed",
  "completed",
]);

export const taskAssignmentsTable = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasksTable.id),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => usersTable.id),
  status: taskAssignmentStatusEnum("status").notNull().default("assigned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskAssignmentSchema = createInsertSchema(
  taskAssignmentsTable,
).omit({ id: true, createdAt: true });
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;
export type TaskAssignment = typeof taskAssignmentsTable.$inferSelect;
