/**
 * Seed script — creates demo organizer, volunteers, attendees, events.
 * Run: pnpm --filter @workspace/api-server run seed
 */

import {
  db,
  usersTable,
  eventsTable,
  registrationsTable,
  volunteerApplicationsTable,
  tasksTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function generateQrToken(id: number): Promise<string> {
  const QR_SECRET = process.env.SESSION_SECRET ?? "eventhub-qr-secret";
  const payload = `reg:${id}:${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

const SALT_ROUNDS = 10;

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "organizer@eventhub.demo"));

  if (existing) {
    console.log("Already seeded. Skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("demo1234", SALT_ROUNDS);

  // Create users
  const [organizer] = await db
    .insert(usersTable)
    .values({
      name: "Alex Chen",
      email: "organizer@eventhub.demo",
      passwordHash,
      role: "organizer",
      phone: "+1 555-0101",
      collegeId: "ORG-001",
    })
    .returning();

  const [volunteer1] = await db
    .insert(usersTable)
    .values({
      name: "Jordan Lee",
      email: "volunteer@eventhub.demo",
      passwordHash,
      role: "volunteer",
      phone: "+1 555-0102",
      collegeId: "VOL-001",
    })
    .returning();

  const [attendee1] = await db
    .insert(usersTable)
    .values({
      name: "Sam Rivera",
      email: "attendee@eventhub.demo",
      passwordHash,
      role: "attendee",
      phone: "+1 555-0103",
      collegeId: "ATT-001",
    })
    .returning();

  const [attendee2] = await db
    .insert(usersTable)
    .values({
      name: "Morgan Davis",
      email: "attendee2@eventhub.demo",
      passwordHash,
      role: "attendee",
      phone: "+1 555-0104",
      collegeId: "ATT-002",
    })
    .returning();

  console.log("Users created.");

  // Create events
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const [techFest] = await db
    .insert(eventsTable)
    .values({
      organizerId: organizer!.id,
      title: "Annual Tech Fest 2026",
      description:
        "The biggest technology festival on campus. Featuring hackathons, workshops, guest speakers from top tech companies, and an innovation expo. Open to all students and faculty.",
      category: "Technology",
      venue: "Engineering Complex, Main Hall",
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(18, 0, 0, 0)),
      capacity: 500,
      registrationDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      status: "published",
    })
    .returning();

  const [culturalNight] = await db
    .insert(eventsTable)
    .values({
      organizerId: organizer!.id,
      title: "International Cultural Night",
      description:
        "A vibrant celebration of global cultures through dance, music, food, and art. Students from 40+ countries share their heritage in an unforgettable evening.",
      category: "Cultural",
      venue: "Student Union, Grand Ballroom",
      startTime: new Date(nextWeek.setHours(18, 0, 0, 0)),
      endTime: new Date(nextWeek.setHours(22, 30, 0, 0)),
      capacity: 300,
      registrationDeadline: new Date(nextWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: "published",
    })
    .returning();

  const [careerFair] = await db
    .insert(eventsTable)
    .values({
      organizerId: organizer!.id,
      title: "Spring Career Fair",
      description:
        "Connect with 80+ companies hiring interns and full-time employees. Bring your resume, dress professionally, and explore opportunities across engineering, business, design, and more.",
      category: "Career",
      venue: "Recreation Center",
      startTime: new Date(twoWeeks.setHours(10, 0, 0, 0)),
      endTime: new Date(twoWeeks.setHours(16, 0, 0, 0)),
      capacity: 1000,
      status: "published",
    })
    .returning();

  const [pastEvent] = await db
    .insert(eventsTable)
    .values({
      organizerId: organizer!.id,
      title: "Startup Pitch Competition",
      description:
        "Student teams pitch their startup ideas to a panel of investors and mentors. Top 3 teams win seed funding.",
      category: "Entrepreneurship",
      venue: "Business School, Auditorium B",
      startTime: new Date(twoDaysAgo.setHours(14, 0, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(18, 0, 0, 0)),
      capacity: 150,
      status: "published",
    })
    .returning();

  const [draftEvent] = await db
    .insert(eventsTable)
    .values({
      organizerId: organizer!.id,
      title: "Sports Day 2026",
      description: "Annual inter-departmental sports competition. Various sporting events throughout the day.",
      category: "Sports",
      venue: "Sports Complex",
      startTime: new Date(twoWeeks.setHours(8, 0, 0, 0)),
      endTime: new Date(twoWeeks.setHours(17, 0, 0, 0)),
      capacity: 200,
      status: "draft",
    })
    .returning();

  console.log("Events created.");

  // Create registrations for attendees
  const techFestReg1Id = await db
    .insert(registrationsTable)
    .values({
      eventId: techFest!.id,
      userId: attendee1!.id,
      status: "registered",
      qrToken: `temp-att1-tech`,
    })
    .returning();

  const qrToken1 = await generateQrToken(techFestReg1Id[0]!.id);
  await db
    .update(registrationsTable)
    .set({ qrToken: qrToken1 })
    .where(eq(registrationsTable.id, techFestReg1Id[0]!.id));

  const culturalReg1 = await db
    .insert(registrationsTable)
    .values({
      eventId: culturalNight!.id,
      userId: attendee1!.id,
      status: "registered",
      qrToken: `temp-att1-cultural`,
    })
    .returning();

  const qrToken2 = await generateQrToken(culturalReg1[0]!.id);
  await db
    .update(registrationsTable)
    .set({ qrToken: qrToken2 })
    .where(eq(registrationsTable.id, culturalReg1[0]!.id));

  const techFestReg2 = await db
    .insert(registrationsTable)
    .values({
      eventId: techFest!.id,
      userId: attendee2!.id,
      status: "registered",
      qrToken: `temp-att2-tech`,
    })
    .returning();

  const qrToken3 = await generateQrToken(techFestReg2[0]!.id);
  await db
    .update(registrationsTable)
    .set({ qrToken: qrToken3 })
    .where(eq(registrationsTable.id, techFestReg2[0]!.id));

  // Past event registration with check-in
  const pastReg = await db
    .insert(registrationsTable)
    .values({
      eventId: pastEvent!.id,
      userId: attendee1!.id,
      status: "registered",
      qrToken: `temp-past-att1`,
      checkedInAt: new Date(twoDaysAgo.getTime() + 15 * 60 * 1000),
    })
    .returning();

  const qrToken4 = await generateQrToken(pastReg[0]!.id);
  await db
    .update(registrationsTable)
    .set({ qrToken: qrToken4 })
    .where(eq(registrationsTable.id, pastReg[0]!.id));

  console.log("Registrations created.");

  // Volunteer application
  await db.insert(volunteerApplicationsTable).values({
    eventId: techFest!.id,
    userId: volunteer1!.id,
    status: "approved",
    message: "I have experience in event management and am excited to help!",
  });

  // Tasks for TechFest
  await db.insert(tasksTable).values([
    {
      eventId: techFest!.id,
      title: "Registration Desk",
      description: "Check in attendees at the main entrance, verify registrations, and distribute event kits.",
      stationLocation: "Main Entrance",
      startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(12, 0, 0, 0)),
      volunteersNeeded: 3,
      createdBy: organizer!.id,
    },
    {
      eventId: techFest!.id,
      title: "Venue Setup",
      description: "Set up tables, chairs, signage, and equipment in the main hall.",
      stationLocation: "Main Hall",
      startTime: new Date(tomorrow.setHours(7, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      volunteersNeeded: 5,
      createdBy: organizer!.id,
    },
    {
      eventId: techFest!.id,
      title: "QR Code Scanner",
      description: "Use the EventHub scan feature to check in attendees throughout the event.",
      stationLocation: "Side Entrance B",
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(18, 0, 0, 0)),
      volunteersNeeded: 2,
      createdBy: organizer!.id,
    },
  ]);

  console.log("Tasks created.");
  console.log("\nSeed complete!");
  console.log("\nDemo accounts (password: demo1234):");
  console.log("  Organizer: organizer@eventhub.demo");
  console.log("  Volunteer: volunteer@eventhub.demo");
  console.log("  Attendee:  attendee@eventhub.demo");
  console.log("  Attendee2: attendee2@eventhub.demo");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
