import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import {
  db,
  volunteerApplicationsTable,
  volunteerRequirementsTable,
  eventsTable,
  usersTable,
} from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";
import { getIo } from "../lib/socket";
import {
  globalVolunteerApplications,
  globalVolunteerRequirements,
  globalEvents,
  addPersistentNotification,
} from "../lib/store";
import {
  calculateVolunteerMatch,
  rankCandidatesForEvent,
  VolunteerCandidate,
  EventRoleRequirement,
} from "../lib/volunteer-ai-matching";

const router: IRouter = Router();

// ===========================================================================
// 1. POST /api/volunteers/apply (or /api/events/:id/volunteer)
// ===========================================================================
router.post(
  ["/volunteers/apply", "/events/:id/volunteer", "/events/:id/volunteer-apply"],
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.session.userId || 1;
    const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
    const eventId = parseInt(raw || req.body?.eventId || "1", 10);

    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const {
      fullName,
      email,
      phone,
      skills,
      experience,
      interests,
      preferredRoles,
      availability,
      resumeUrl,
      resumeText,
      message,
    } = req.body || {};

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim())
      : ["Communication", "Event Coordination"];

    const interestsArray = Array.isArray(interests)
      ? interests
      : typeof interests === "string"
      ? interests.split(",").map((i) => i.trim())
      : ["Campus Activities"];

    const rolesArray = Array.isArray(preferredRoles)
      ? preferredRoles
      : typeof preferredRoles === "string"
      ? preferredRoles.split(",").map((r) => r.trim())
      : ["Registration Coordinator"];

    // Find Event Requirements for initial AI Match Calculation
    const eventReqs = globalVolunteerRequirements.filter((r) => r.eventId === eventId);
    const targetReq: EventRoleRequirement = eventReqs[0] || {
      role: rolesArray[0] || "Event Support Lead",
      requiredSkills: ["Communication", "Organization"],
      preferredSkills: ["Event Coordination", "QR Scanning"],
    };

    const candidateProfile: VolunteerCandidate = {
      id: Date.now(),
      userId,
      fullName: fullName || req.session.userName || "Student Member",
      email: email || "volunteer@university.edu",
      phone: phone || "+91 98765 43210",
      skills: skillsArray,
      experience: experience || "Active participant in college fests and volunteer clubs.",
      interests: interestsArray,
      preferredRoles: rolesArray,
      availability: availability || "Full Day Available",
      resumeText: resumeText || "",
      status: "applied",
    };

    // Calculate AI Match Score & Reasoning
    const matchEvaluation = calculateVolunteerMatch(candidateProfile, targetReq);

    let savedApplication: any = null;

    try {
      const [inserted] = await db
        .insert(volunteerApplicationsTable)
        .values({
          eventId,
          userId,
          fullName: candidateProfile.fullName,
          email: candidateProfile.email,
          phone: candidateProfile.phone,
          skills: skillsArray.join(", "),
          experience: candidateProfile.experience,
          interests: interestsArray.join(", "),
          preferredRoles: rolesArray.join(", "),
          availability: candidateProfile.availability,
          resumeUrl: resumeUrl || null,
          resumeText: candidateProfile.resumeText || null,
          status: "applied",
          matchScore: matchEvaluation.matchScore,
          matchReason: matchEvaluation.reason,
          matchingSkills: JSON.stringify(matchEvaluation.matchingSkills),
          skillGaps: JSON.stringify(matchEvaluation.skillGaps),
          message: message || "Excited to contribute to this campus event!",
        })
        .returning();

      if (inserted) {
        savedApplication = inserted;
        candidateProfile.id = inserted.id;
      }
    } catch (dbErr) {
      console.warn("DB insert fallback to store for volunteer application:", dbErr);
    }

    if (!savedApplication) {
      savedApplication = {
        id: Math.floor(Math.random() * 9000) + 1000,
        eventId,
        userId,
        ...candidateProfile,
        matchScore: matchEvaluation.matchScore,
        matchReason: matchEvaluation.reason,
        matchingSkills: matchEvaluation.matchingSkills,
        skillGaps: matchEvaluation.skillGaps,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Save to Central In-Memory Store
    const storeItem = {
      id: savedApplication.id,
      eventId,
      userId,
      fullName: candidateProfile.fullName,
      email: candidateProfile.email,
      phone: candidateProfile.phone,
      skills: skillsArray,
      experience: candidateProfile.experience,
      interests: interestsArray,
      preferredRoles: rolesArray,
      availability: candidateProfile.availability,
      resumeUrl,
      resumeText: candidateProfile.resumeText,
      status: "applied" as const,
      matchScore: matchEvaluation.matchScore,
      matchReason: matchEvaluation.reason,
      matchingSkills: matchEvaluation.matchingSkills,
      skillGaps: matchEvaluation.skillGaps,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    globalVolunteerApplications.unshift(storeItem);

    // Notify Organizer
    const targetEvent = globalEvents.find((e) => e.id === eventId);
    addPersistentNotification({
      userId: targetEvent?.organizerId || 1,
      type: "VOLUNTEER_APPLIED",
      title: "New Volunteer Application Received",
      message: `${candidateProfile.fullName} applied for ${targetEvent?.title || "Campus Event"} (AI Match: ${matchEvaluation.matchScore}%).`,
      relatedEventId: eventId,
      isRead: false,
    });

    const io = getIo();
    if (io) {
      io.emit("volunteer_applied", { eventId, userId, applicationId: savedApplication.id, matchScore: matchEvaluation.matchScore });
      io.emit("volunteer_recommendations_ready", { eventId });
    }

    res.status(201).json({
      ...savedApplication,
      evaluation: matchEvaluation,
      message: "Volunteer application submitted successfully and AI match calculated.",
    });
  }
);

// ===========================================================================
// 2. GET /api/volunteers/me (Authenticated Volunteer Applications & Assignments)
// ===========================================================================
router.get("/volunteers/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  let dbApplications: any[] = [];
  try {
    const rows = await db
      .select({
        application: volunteerApplicationsTable,
        event: {
          id: eventsTable.id,
          title: eventsTable.title,
          venue: eventsTable.venue,
          startTime: eventsTable.startTime,
          endTime: eventsTable.endTime,
        },
      })
      .from(volunteerApplicationsTable)
      .innerJoin(eventsTable, eq(eventsTable.id, volunteerApplicationsTable.eventId))
      .where(eq(volunteerApplicationsTable.userId, userId))
      .orderBy(desc(volunteerApplicationsTable.appliedAt));

    dbApplications = rows.map(({ application, event }) => ({
      ...application,
      eventTitle: event.title,
      eventVenue: event.venue,
      eventStartTime: event.startTime,
      eventEndTime: event.endTime,
    }));
  } catch {}

  // Merge with memory store
  const memApps = globalVolunteerApplications.filter((a) => a.userId === userId);
  const combined = [...dbApplications, ...memApps];

  const seen = new Set<number>();
  const deduplicated: any[] = [];

  for (const app of combined) {
    if (seen.has(app.id)) continue;
    seen.add(app.id);
    const ev = globalEvents.find((e) => e.id === app.eventId);
    deduplicated.push({
      ...app,
      eventTitle: app.eventTitle || ev?.title || "Campus Event",
      eventVenue: app.eventVenue || ev?.venue || "Main Campus",
      eventStartTime: app.eventStartTime || ev?.startTime || new Date().toISOString(),
    });
  }

  res.json({
    applications: deduplicated,
    assignments: deduplicated.filter((a) => a.status === "assigned"),
  });
});

// ===========================================================================
// 3. GET /api/events/:id/volunteer-requirements & POST
// ===========================================================================
router.get("/events/:id/volunteer-requirements", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
  const eventId = parseInt(raw!, 10);
  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }

  let dbReqs: any[] = [];
  try {
    const rows = await db
      .select()
      .from(volunteerRequirementsTable)
      .where(eq(volunteerRequirementsTable.eventId, eventId))
      .orderBy(desc(volunteerRequirementsTable.createdAt));
    dbReqs = rows || [];
  } catch {}

  const memReqs = globalVolunteerRequirements.filter((r) => r.eventId === eventId);
  const combined = [...dbReqs, ...memReqs];
  const seen = new Set<number>();
  const result = combined.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  res.json({ requirements: result });
});

router.post(
  "/events/:id/volunteer-requirements",
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
    const eventId = parseInt(raw!, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const {
      role,
      requiredSkills,
      preferredSkills,
      responsibilities,
      experienceRequirement,
      availabilityRequirement,
      numberRequired,
    } = req.body || {};

    if (!role || !role.trim()) {
      res.status(400).json({ error: "Role name is required" });
      return;
    }

    const reqSkillsArray = Array.isArray(requiredSkills) ? requiredSkills : typeof requiredSkills === "string" ? requiredSkills.split(",").map(s => s.trim()) : ["Communication"];
    const prefSkillsArray = Array.isArray(preferredSkills) ? preferredSkills : typeof preferredSkills === "string" ? preferredSkills.split(",").map(s => s.trim()) : ["Event Coordination"];

    const newReqItem = {
      id: Date.now(),
      eventId,
      role: role.trim(),
      requiredSkills: reqSkillsArray,
      preferredSkills: prefSkillsArray,
      responsibilities: responsibilities || "Coordinate event tasks and assist attendees.",
      experienceRequirement: experienceRequirement || "1+ year preferred",
      availabilityRequirement: availabilityRequirement || "Full Event Duration",
      numberRequired: Number(numberRequired) || 2,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.insert(volunteerRequirementsTable).values({
        eventId,
        role: newReqItem.role,
        requiredSkills: reqSkillsArray.join(", "),
        preferredSkills: prefSkillsArray.join(", "),
        responsibilities: newReqItem.responsibilities,
        experienceRequirement: newReqItem.experienceRequirement,
        availabilityRequirement: newReqItem.availabilityRequirement,
        numberRequired: newReqItem.numberRequired,
      });
    } catch {}

    globalVolunteerRequirements.push(newReqItem);

    res.status(201).json({
      requirement: newReqItem,
      message: "Volunteer role requirement added successfully.",
    });
  }
);

// ===========================================================================
// 4. GET /api/events/:id/volunteers (Organizer/Admin View Applicants + Match Scores)
// ===========================================================================
router.get(
  ["/events/:id/volunteers", "/volunteers/applications"],
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
    const eventId = raw ? parseInt(raw, 10) : null;

    let dbApplications: any[] = [];
    try {
      const query = db
        .select({
          application: volunteerApplicationsTable,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
          event: {
            id: eventsTable.id,
            title: eventsTable.title,
          },
        })
        .from(volunteerApplicationsTable)
        .innerJoin(usersTable, eq(usersTable.id, volunteerApplicationsTable.userId))
        .innerJoin(eventsTable, eq(eventsTable.id, volunteerApplicationsTable.eventId));

      const rows = eventId ? await query.where(eq(volunteerApplicationsTable.eventId, eventId)) : await query;
      dbApplications = rows.map(({ application, user, event }) => ({
        ...application,
        volunteerName: user.name,
        volunteerEmail: user.email,
        eventTitle: event.title,
      }));
    } catch {}

    const memApps = eventId
      ? globalVolunteerApplications.filter((a) => a.eventId === eventId)
      : globalVolunteerApplications;

    const combined = [...dbApplications, ...memApps];
    const seen = new Set<number>();
    const result: any[] = [];

    for (const app of combined) {
      if (seen.has(app.id)) continue;
      seen.add(app.id);

      const ev = globalEvents.find((e) => e.id === app.eventId);
      result.push({
        ...app,
        volunteerName: app.volunteerName || app.fullName || "Student Volunteer",
        volunteerEmail: app.volunteerEmail || app.email || "volunteer@university.edu",
        eventTitle: app.eventTitle || ev?.title || "Campus Event",
      });
    }

    // Sort descending by matchScore
    result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    res.json({
      volunteers: result,
      totalCount: result.length,
    });
  }
);

// ===========================================================================
// 5. POST /api/events/:id/volunteers/match (Run / Re-run AI Matching Engine)
// ===========================================================================
router.post(
  "/events/:id/volunteers/match",
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
    const eventId = parseInt(raw!, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const eventCandidates = globalVolunteerApplications.filter((a) => a.eventId === eventId);
    const eventReqs = globalVolunteerRequirements.filter((r) => r.eventId === eventId);

    if (eventReqs.length === 0) {
      // Create default requirement if none defined yet
      eventReqs.push({
        id: 1,
        eventId,
        role: "Registration Coordinator",
        requiredSkills: ["Communication", "Crowd Management", "Organization"],
        preferredSkills: ["Event Coordination", "QR Scanning"],
        responsibilities: "Manage student check-in desks and scanner validation.",
        experienceRequirement: "1+ year preferred",
        availabilityRequirement: "Full Day",
        numberRequired: 2,
        createdAt: new Date().toISOString(),
      });
    }

    // Transform Candidates
    const candidatesForEngine: VolunteerCandidate[] = eventCandidates.map((c) => ({
      id: c.id,
      userId: c.userId,
      fullName: c.fullName,
      email: c.email,
      skills: Array.isArray(c.skills) ? c.skills : typeof c.skills === "string" ? (c.skills as string).split(",") : [],
      experience: c.experience || "",
      interests: Array.isArray(c.interests) ? c.interests : [],
      preferredRoles: Array.isArray(c.preferredRoles) ? c.preferredRoles : [],
      availability: c.availability || "",
      resumeText: c.resumeText || "",
      status: c.status,
    }));

    // Run AI Matching Engine
    const rankedRecommendations = rankCandidatesForEvent(candidatesForEngine, eventReqs);

    // Update Scores in Store & Database
    for (const roleName in rankedRecommendations) {
      for (const rec of rankedRecommendations[roleName]) {
        const target = globalVolunteerApplications.find((a) => a.id === rec.candidateId);
        if (target) {
          target.matchScore = rec.matchScore;
          target.matchReason = rec.reason;
          target.matchingSkills = rec.matchingSkills;
          target.skillGaps = rec.skillGaps;
          target.updatedAt = new Date().toISOString();
        }

        try {
          await db
            .update(volunteerApplicationsTable)
            .set({
              matchScore: rec.matchScore,
              matchReason: rec.reason,
              matchingSkills: JSON.stringify(rec.matchingSkills),
              skillGaps: JSON.stringify(rec.skillGaps),
              updatedAt: new Date(),
            })
            .where(eq(volunteerApplicationsTable.id, rec.candidateId));
        } catch {}
      }
    }

    const io = getIo();
    if (io) {
      io.emit("volunteer_recommendations_ready", { eventId });
    }

    res.json({
      eventId,
      rankedRecommendations,
      evaluatedCandidatesCount: eventCandidates.length,
      evaluatedRolesCount: eventReqs.length,
      message: "AI Skill Matching successfully completed with explainable score components.",
    });
  }
);

// ===========================================================================
// 6. POST /api/events/:id/volunteers/:volunteerId/assign (Organizer Decision)
// ===========================================================================
router.post(
  "/events/:id/volunteers/:volunteerId/assign",
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const rawEvent = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
    const rawVol = req.params.volunteerId ? (Array.isArray(req.params.volunteerId) ? req.params.volunteerId[0] : req.params.volunteerId) : null;
    const eventId = parseInt(rawEvent!, 10);
    const applicationId = parseInt(rawVol!, 10);
    const { role } = req.body || {};

    const assignedRoleName = role || "Registration Coordinator";

    // Update in-memory store
    const appItem = globalVolunteerApplications.find((a) => a.id === applicationId);
    if (appItem) {
      appItem.status = "assigned";
      appItem.assignedRole = assignedRoleName;
      appItem.updatedAt = new Date().toISOString();
    }

    try {
      await db
        .update(volunteerApplicationsTable)
        .set({
          status: "assigned",
          assignedRole: assignedRoleName,
          updatedAt: new Date(),
        })
        .where(eq(volunteerApplicationsTable.id, applicationId));
    } catch {}

    const targetEvent = globalEvents.find((e) => e.id === eventId);

    // Create Persistent Notification for Volunteer
    if (appItem) {
      addPersistentNotification({
        userId: appItem.userId,
        type: "VOLUNTEER_ASSIGNED",
        title: "🎉 Volunteer Assignment Confirmed!",
        message: `You have been officially assigned as ${assignedRoleName} for "${targetEvent?.title || "Campus Event"}".`,
        relatedEventId: eventId,
        isRead: false,
      });
    }

    const io = getIo();
    if (io) {
      io.emit("volunteer_assigned", {
        eventId,
        applicationId,
        userId: appItem?.userId,
        role: assignedRoleName,
        eventTitle: targetEvent?.title,
      });
    }

    res.json({
      success: true,
      applicationId,
      status: "assigned",
      assignedRole: assignedRoleName,
      message: `Volunteer successfully assigned to ${assignedRoleName}.`,
    });
  }
);

// ===========================================================================
// 7. POST /api/events/:id/volunteers/:volunteerId/shortlist & reject
// ===========================================================================
router.post(
  "/events/:id/volunteers/:volunteerId/shortlist",
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const rawVol = req.params.volunteerId ? (Array.isArray(req.params.volunteerId) ? req.params.volunteerId[0] : req.params.volunteerId) : null;
    const applicationId = parseInt(rawVol!, 10);

    const appItem = globalVolunteerApplications.find((a) => a.id === applicationId);
    if (appItem) {
      appItem.status = "shortlisted";
      appItem.updatedAt = new Date().toISOString();
    }

    try {
      await db
        .update(volunteerApplicationsTable)
        .set({ status: "shortlisted", updatedAt: new Date() })
        .where(eq(volunteerApplicationsTable.id, applicationId));
    } catch {}

    res.json({ success: true, applicationId, status: "shortlisted" });
  }
);

router.post(
  "/events/:id/volunteers/:volunteerId/reject",
  requireAuth,
  requireRole("organizer", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    const rawVol = req.params.volunteerId ? (Array.isArray(req.params.volunteerId) ? req.params.volunteerId[0] : req.params.volunteerId) : null;
    const applicationId = parseInt(rawVol!, 10);

    const appItem = globalVolunteerApplications.find((a) => a.id === applicationId);
    if (appItem) {
      appItem.status = "rejected";
      appItem.updatedAt = new Date().toISOString();
    }

    try {
      await db
        .update(volunteerApplicationsTable)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(volunteerApplicationsTable.id, applicationId));
    } catch {}

    res.json({ success: true, applicationId, status: "rejected" });
  }
);

// ===========================================================================
// 8. PATCH /api/volunteers/:id/withdraw (Volunteer self-withdrawal)
// ===========================================================================
router.patch("/volunteers/:id/withdraw", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const raw = req.params.id ? (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) : null;
  const applicationId = parseInt(raw!, 10);

  const appItem = globalVolunteerApplications.find((a) => a.id === applicationId);
  if (appItem && appItem.userId !== userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Unauthorized to withdraw another volunteer's application." });
    return;
  }

  if (appItem) {
    appItem.status = "withdrawn";
    appItem.updatedAt = new Date().toISOString();
  }

  try {
    await db
      .update(volunteerApplicationsTable)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(eq(volunteerApplicationsTable.id, applicationId));
  } catch {}

  res.json({ success: true, applicationId, status: "withdrawn" });
});

export default router;
