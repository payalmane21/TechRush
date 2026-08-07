import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import {
  db,
  tasksTable,
  taskAssignmentsTable,
  eventsTable,
  usersTable,
  volunteerApplicationsTable,
} from "@workspace/db";
import {
  ListEventTasksParams,
  CreateTaskParams,
  CreateTaskBody,
  AssignTaskParams,
  AssignTaskBody,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../lib/auth";

const router: IRouter = Router();

// GET /events/:id/tasks
router.get("/events/:id/tasks", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const eventId = parseInt(raw!, 10);
  if (isNaN(eventId)) { res.status(400).json({ error: "Invalid event ID" }); return; }

  const tasks = await db
    .select({
      task: tasksTable,
      assignedCount: sql<number>`cast(count(${taskAssignmentsTable.id}) as int)`,
    })
    .from(tasksTable)
    .leftJoin(taskAssignmentsTable, and(
      eq(taskAssignmentsTable.taskId, tasksTable.id),
      eq(taskAssignmentsTable.status, "assigned"),
    ))
    .where(eq(tasksTable.eventId, eventId))
    .groupBy(tasksTable.id);

  res.json(
    tasks.map(({ task, assignedCount }) => ({
      ...task,
      assignedCount: assignedCount ?? 0,
    })),
  );
});

// POST /events/:id/tasks
router.post("/events/:id/tasks", requireAuth, requireRole("organizer", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const eventId = parseInt(raw!, 10);
  if (isNaN(eventId)) { res.status(400).json({ error: "Invalid event ID" }); return; }

  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  const [task] = await db
    .insert(tasksTable)
    .values({
      eventId,
      title: data.title,
      description: data.description ?? null,
      stationLocation: data.stationLocation ?? null,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      volunteersNeeded: data.volunteersNeeded,
      createdBy: req.session.userId!,
    })
    .returning();

  res.status(201).json({ ...task!, assignedCount: 0 });
});

// PUT /tasks/:id/assign
router.put("/tasks/:id/assign", requireAuth, requireRole("organizer", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const taskId = parseInt(raw!, 10);
  if (isNaN(taskId)) { res.status(400).json({ error: "Invalid task ID" }); return; }

  const parsed = AssignTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { volunteerId } = parsed.data;

  // Check for existing assignment
  const [existing] = await db
    .select()
    .from(taskAssignmentsTable)
    .where(
      and(
        eq(taskAssignmentsTable.taskId, taskId),
        eq(taskAssignmentsTable.volunteerId, volunteerId),
      ),
    );

  if (existing) {
    res.json(existing);
    return;
  }

  const [assignment] = await db
    .insert(taskAssignmentsTable)
    .values({
      taskId,
      volunteerId,
      status: "assigned",
    })
    .returning();

  res.json(assignment!);
});

// GET /tasks/me
router.get("/tasks/me", requireAuth, requireRole("volunteer", "organizer", "admin"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const results = await db
    .select({
      task: tasksTable,
      assignment: taskAssignmentsTable,
      eventTitle: eventsTable.title,
      eventVenue: eventsTable.venue,
      assignedCount: sql<number>`cast(count(${taskAssignmentsTable.id}) as int)`,
    })
    .from(taskAssignmentsTable)
    .innerJoin(tasksTable, eq(tasksTable.id, taskAssignmentsTable.taskId))
    .innerJoin(eventsTable, eq(eventsTable.id, tasksTable.eventId))
    .where(eq(taskAssignmentsTable.volunteerId, userId))
    .groupBy(tasksTable.id, taskAssignmentsTable.id, eventsTable.title, eventsTable.venue);

  res.json(
    results.map(({ task, assignment, eventTitle, eventVenue, assignedCount }) => ({
      ...task,
      assignedCount: assignedCount ?? 0,
      assignmentStatus: assignment.status,
      eventTitle: eventTitle ?? "",
      eventVenue: eventVenue ?? "",
    })),
  );
});

export default router;
