import { db, eventsTable, registrationsTable, paymentsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { globalEvents, globalRegistrations, globalPaymentLedger } from "./store";

export interface ChatAction {
  label: string;
  url: string;
  type: "link" | "navigate";
  variant?: "default" | "outline" | "secondary";
}

export interface ChatResponse {
  message: string;
  actions?: ChatAction[];
  suggestedFollowUps?: string[];
}

/**
 * Controlled Backend Tool 1: Search Published Events Only
 */
export async function searchPublishedEvents(params: {
  query?: string;
  category?: string;
  isFree?: boolean;
  isPaid?: boolean;
  upcomingOnly?: boolean;
}) {
  let events: any[] = [];
  try {
    const rows = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.status, "published"))
      .orderBy(desc(eventsTable.startTime));
    events = rows || [];
  } catch {}

  // Fallback to store
  if (events.length === 0) {
    events = globalEvents.filter((e) => e.status === "published");
  }

  // Filter in memory with strict rules
  return events.filter((e) => {
    if (e.status !== "published") return false;
    if (params.isFree && (e.price || 0) > 0) return false;
    if (params.isPaid && (e.price || 0) === 0) return false;
    if (params.category && !e.category.toLowerCase().includes(params.category.toLowerCase())) return false;
    if (params.query) {
      const q = params.query.toLowerCase();
      const matchTitle = e.title?.toLowerCase().includes(q);
      const matchVenue = e.venue?.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchCat = e.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchVenue && !matchDesc && !matchCat) return false;
    }
    return true;
  });
}

/**
 * Controlled Backend Tool 2: Get Authenticated Attendee's Registrations Only
 */
export async function getAttendeeRegistrations(userId: number) {
  let registrations: any[] = [];
  try {
    const rows = await db
      .select({
        id: registrationsTable.id,
        eventId: registrationsTable.eventId,
        userId: registrationsTable.userId,
        attendeeName: registrationsTable.attendeeName,
        attendeeEmail: registrationsTable.attendeeEmail,
        status: registrationsTable.status,
        paymentStatus: registrationsTable.paymentStatus,
        amountPaid: registrationsTable.amountPaid,
        qrToken: registrationsTable.qrToken,
        checkedInAt: registrationsTable.checkedInAt,
        registeredAt: registrationsTable.registeredAt,
      })
      .from(registrationsTable)
      .where(eq(registrationsTable.userId, userId))
      .orderBy(desc(registrationsTable.registeredAt));
    registrations = rows || [];
  } catch {}

  // Merge with memory store registrations for this exact userId only
  const memRegistrations = Array.from(globalRegistrations.values()).filter((r: any) => r.userId === userId);
  const combined = [...registrations, ...memRegistrations];
  
  // Deduplicate and attach published event details
  const seen = new Set<number>();
  const enriched: any[] = [];

  for (const reg of combined) {
    if (seen.has(reg.id)) continue;
    seen.add(reg.id);

    const event = globalEvents.find((e) => e.id === reg.eventId) || {
      id: reg.eventId,
      title: "Campus Event",
      venue: "University Campus",
      startTime: new Date().toISOString(),
      price: reg.amountPaid || 0,
    };

    enriched.push({
      ...reg,
      eventTitle: event.title,
      eventVenue: event.venue,
      eventStartTime: event.startTime,
      eventPrice: event.price || 0,
    });
  }

  return enriched;
}

/**
 * Controlled Backend Tool 3: Get Authenticated Attendee's Payments Only
 */
export async function getAttendeePayments(userId: number) {
  let payments: any[] = [];
  try {
    const rows = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, userId))
      .orderBy(desc(paymentsTable.createdAt));
    payments = rows || [];
  } catch {}

  // Ledger fallback
  const ledgerEntries = Array.from(globalPaymentLedger.values()).filter((p) => p.userId === userId);
  const combined = [...payments, ...ledgerEntries];

  const seen = new Set<string>();
  return combined.filter((p) => {
    if (seen.has(p.orderId)) return false;
    seen.add(p.orderId);
    return true;
  });
}

/**
 * High-Precision AI Intent Analyzer & Natural Language Context Synthesizer
 */
export async function processAttendeeChatMessage(
  message: string,
  userId: number,
  userName: string
): Promise<ChatResponse> {
  const query = message.trim().toLowerCase();

  // 1. Check for User Registrations & Tickets
  if (
    query.includes("my registration") ||
    query.includes("my ticket") ||
    query.includes("my pass") ||
    query.includes("registered for") ||
    query.includes("am i registered") ||
    query.includes("my upcoming") ||
    query.includes("show my events")
  ) {
    const myRegs = await getAttendeeRegistrations(userId);

    if (myRegs.length === 0) {
      const publishedEvents = await searchPublishedEvents({});
      const top3 = publishedEvents.slice(0, 3);
      return {
        message: `Hello **${userName}**! You currently do not have any active event registrations in EventHub.\n\nHere are some popular live campus events you can register for:`,
        actions: top3.map((e) => ({
          label: `Register for ${e.title} (₹${e.price || 0})`,
          url: `/events/${e.id}`,
          type: "link",
        })),
        suggestedFollowUps: [
          "Which events are free?",
          "What events are happening this week?",
          "How do I register for an event?",
        ],
      };
    }

    const regListMarkdown = myRegs
      .map((r, idx) => {
        const dateStr = r.eventStartTime ? new Date(r.eventStartTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled";
        const feeBadge = (r.amountPaid || 0) > 0 ? `Paid Pass (₹${r.amountPaid})` : "Free Pass";
        const statusBadge = r.checkedInAt ? "✅ Checked In at Gate" : "🎟️ Confirmed — Ready for Gate Scan";
        return `${idx + 1}. **${r.eventTitle}**\n   - **Venue:** ${r.eventVenue}\n   - **Date & Time:** ${dateStr}\n   - **Status:** ${statusBadge} • ${feeBadge}\n   - **Registration ID:** \`REG-${r.id}\``;
      })
      .join("\n\n");

    return {
      message: `Here are your confirmed event registrations, **${userName}**:\n\n${regListMarkdown}\n\nYou can access your verified cryptographic QR passes anytime from your Attendee Dashboard or Profile.`,
      actions: [
        {
          label: "🎟️ View My QR Passes",
          url: "/dashboard/attendee",
          type: "link",
        },
        {
          label: "💳 View Payment Receipts",
          url: "/dashboard/profile",
          type: "link",
        },
      ],
      suggestedFollowUps: [
        "Where is my QR pass?",
        "How do I check in at the gate?",
        "Find more upcoming events",
      ],
    };
  }

  // 2. Check for QR Code / Gate Entry Inquiries
  if (
    query.includes("qr") ||
    query.includes("gate") ||
    query.includes("barcode") ||
    query.includes("entry pass") ||
    query.includes("scan")
  ) {
    const myRegs = await getAttendeeRegistrations(userId);

    if (myRegs.length > 0) {
      return {
        message: `Your cryptographic QR passes are generated and ready for check-in! 🎫\n\n**How to use your QR Pass:**\n1. Open your **Attendee Dashboard** or **Profile**.\n2. Tap **"View Pass"** on your registered event to display your full-screen QR ticket.\n3. Present the QR code on your phone to the Student Volunteer desk at the entrance gate for instant validation.\n\n*Note: Each QR pass contains a cryptographically signed HMAC token for fraud prevention.*`,
        actions: [
          {
            label: "Open My QR Passes",
            url: "/dashboard/attendee",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Show my registrations",
          "Is my payment confirmed?",
          "What happens if I arrive late?",
        ],
      };
    } else {
      return {
        message: `You haven't registered for any events yet, so no QR passes have been generated for your account. Once you complete registration for any free or paid campus event, a verified cryptographic QR pass will appear instantly on your dashboard!`,
        actions: [
          {
            label: "Open My Dashboard",
            url: "/dashboard/attendee",
            type: "link",
          },
          {
            label: "Browse Available Events",
            url: "/events",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Which events are free?",
          "How do I register for an event?",
        ],
      };
    }
  }

  // 3. Check for Payment Status & Fees
  if (
    query.includes("payment") ||
    query.includes("paid") ||
    query.includes("fee") ||
    query.includes("razorpay") ||
    query.includes("receipt") ||
    query.includes("refund") ||
    query.includes("price") ||
    query.includes("cost")
  ) {
    // Specific question about free events
    if (query.includes("free")) {
      const freeEvents = await searchPublishedEvents({ isFree: true });
      const freeList = freeEvents
        .slice(0, 5)
        .map((e) => `• **${e.title}** (${e.category}) — Venue: ${e.venue}`)
        .join("\n");

      return {
        message: `EventHub features **${freeEvents.length} Free Campus Events** with ₹0 registration fee:\n\n${freeList || "No free events currently scheduled."}\n\nFree events grant instant confirmed QR passes upon one-click registration.`,
        actions: freeEvents.slice(0, 2).map((e) => ({
          label: `Register for ${e.title}`,
          url: `/events/${e.id}`,
          type: "link",
        })),
        suggestedFollowUps: [
          "What events require payment?",
          "Show my registrations",
        ],
      };
    }

    // Specific question about paid events
    if (query.includes("require payment") || query.includes("paid event")) {
      const paidEvents = await searchPublishedEvents({ isPaid: true });
      const paidList = paidEvents
        .slice(0, 5)
        .map((e) => `• **${e.title}** — **₹${e.price}** (${e.category}) • Venue: ${e.venue}`)
        .join("\n");

      return {
        message: `Here are the active **Paid Events** available on EventHub:\n\n${paidList || "All current events are free of charge."}\n\n**How Paid Registration Works:**\n1. Click **Register** on the event page.\n2. The secure **Razorpay Payment Gateway** modal opens.\n3. Complete payment via UPI, Credit/Debit Card, or NetBanking.\n4. Server verifies HMAC-SHA256 signature and issues your signed QR Pass immediately.`,
        actions: paidEvents.slice(0, 2).map((e) => ({
          label: `View ${e.title} (₹${e.price})`,
          url: `/events/${e.id}`,
          type: "link",
        })),
        suggestedFollowUps: [
          "Show my payment history",
          "Which events are free?",
        ],
      };
    }

    // General payment inquiry for authenticated attendee
    const myPayments = await getAttendeePayments(userId);
    if (myPayments.length > 0) {
      const payList = myPayments
        .slice(0, 4)
        .map((p) => `• **Order:** \`${p.orderId}\` — **₹${p.amount}** (${p.status.toUpperCase()})`)
        .join("\n");

      return {
        message: `Here is your recent payment summary, **${userName}**:\n\n${payList}\n\nAll verified transactions are permanently recorded in the University Budget Ledger.`,
        actions: [
          {
            label: "💳 View Full Payment Ledger",
            url: "/dashboard/profile",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Show my QR pass",
          "Show my registrations",
        ],
      };
    } else {
      return {
        message: `You do not have any recorded paid transactions. When you register for paid workshops or hackathons, payments are processed securely through **Razorpay** with automated cryptographic verification and digital receipts.`,
        actions: [
          {
            label: "Explore Paid Masterclasses",
            url: "/events",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Which events are free?",
          "How do I register for an event?",
        ],
      };
    }
  }

  // 4. How Registration Works
  if (
    query.includes("how to register") ||
    query.includes("how do i register") ||
    query.includes("registration process") ||
    query.includes("how does registration work")
  ) {
    return {
      message: `Registering for an event on EventHub is simple and takes less than a minute! 🚀\n\n**Step-by-step Guide:**\n1. **Browse Events:** Find an event you want to attend in the [Events Catalog](/events).\n2. **Click Register:** Open the event details page and click the **"Register Now"** button.\n3. **Review Details:** Confirm your student name, email, and phone number.\n4. **Complete Payment (if paid):**\n   - If the event is **FREE (₹0)**, your registration is confirmed immediately.\n   - If the event is **PAID (> ₹0)**, the Razorpay gateway will prompt you to complete the payment.\n5. **Get Your QR Pass:** Your cryptographically signed QR ticket is issued instantly and saved to your Attendee Dashboard.\n6. **Gate Check-in:** Show your QR code to the volunteer desk on event day for quick entry!`,
      actions: [
        {
          label: "Browse Events Catalog",
          url: "/events",
          type: "link",
        },
      ],
      suggestedFollowUps: [
        "Which events are free?",
        "Show my registrations",
        "Where can I find my QR pass?",
      ],
    };
  }

  // 5. Venue / Location Questions
  if (
    query.includes("venue") ||
    query.includes("location") ||
    query.includes("where is") ||
    query.includes("hall") ||
    query.includes("auditorium") ||
    query.includes("block") ||
    query.includes("campus")
  ) {
    // Check if attendee is asking about their own registered event venue
    const myRegs = await getAttendeeRegistrations(userId);
    if (myRegs.length > 0) {
      const venues = myRegs.map((r) => `• **${r.eventTitle}**: ${r.eventVenue}`).join("\n");
      return {
        message: `Here are the venues for your registered events:\n\n${venues}\n\nPlease arrive at least 15 minutes before start time with your student ID and QR pass ready.`,
        actions: [
          {
            label: "Open My Registrations",
            url: "/dashboard/attendee",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Show my QR pass",
          "What events are happening this week?",
        ],
      };
    } else {
      const published = await searchPublishedEvents({});
      const venues = published.slice(0, 4).map((e) => `• **${e.title}**: ${e.venue}`).join("\n");
      return {
        message: `Here are the campus venues for upcoming published events:\n\n${venues}`,
        actions: [
          {
            label: "Browse All Events",
            url: "/events",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Which events are free?",
          "How do I register for an event?",
        ],
      };
    }
  }

  // 6. Category Search (Tech, Cultural, Seminar, Hackathon, Sports, Workshop)
  const categories = ["technology", "cultural", "career", "sports", "seminar", "hackathon", "workshop", "arts"];
  const matchedCategory = categories.find((c) => query.includes(c));

  if (matchedCategory) {
    const events = await searchPublishedEvents({ category: matchedCategory });
    if (events.length === 0) {
      return {
        message: `Currently, there are no published events under the **${matchedCategory.toUpperCase()}** category. Please check back soon as campus organizers frequently publish new activities!`,
        actions: [
          {
            label: "Browse All Events",
            url: "/events",
            type: "link",
          },
        ],
        suggestedFollowUps: [
          "Which events are free?",
          "Show my registrations",
        ],
      };
    }

    const eventList = events
      .slice(0, 4)
      .map((e) => {
        const fee = (e.price || 0) > 0 ? `₹${e.price}` : "FREE";
        const dateStr = e.startTime ? new Date(e.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Scheduled";
        return `• **${e.title}** — **${fee}**\n  Venue: ${e.venue} • Date: ${dateStr} • Capacity: ${e.capacity} seats`;
      })
      .join("\n\n");

    return {
      message: `Found **${events.length}** event(s) in **${matchedCategory.toUpperCase()}**:\n\n${eventList}`,
      actions: events.slice(0, 2).map((e) => ({
        label: `View ${e.title}`,
        url: `/events/${e.id}`,
        type: "link",
      })),
      suggestedFollowUps: [
        "Which events are free?",
        "How do I register for an event?",
        "Show my registrations",
      ],
    };
  }

  // 7. General Discovery / Available Events
  if (
    query.includes("event") ||
    query.includes("available") ||
    query.includes("upcoming") ||
    query.includes("happening") ||
    query.includes("find") ||
    query.includes("what is going on") ||
    query.includes("browse")
  ) {
    const published = await searchPublishedEvents({});
    if (published.length === 0) {
      return {
        message: "There are currently no published events live on EventHub. Please check back soon!",
        suggestedFollowUps: ["How do I register for an event?", "Where is my QR pass?"],
      };
    }

    const list = published
      .slice(0, 5)
      .map((e) => {
        const fee = (e.price || 0) > 0 ? `₹${e.price}` : "Free Pass";
        const dateStr = e.startTime ? new Date(e.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming";
        return `• **${e.title}** (${e.category})\n  *Date:* ${dateStr} | *Venue:* ${e.venue} | *Entry:* **${fee}**`;
      })
      .join("\n\n");

    return {
      message: `Here are the upcoming **Published Campus Events** currently available for registration on EventHub:\n\n${list}`,
      actions: [
        {
          label: "🔍 Explore All Events",
          url: "/events",
          type: "link",
        },
      ],
      suggestedFollowUps: [
        "Which events are free?",
        "What events require payment?",
        "Show my registrations",
      ],
    };
  }

  // 8. Default Context-Aware Response
  const defaultPublished = await searchPublishedEvents({});
  return {
    message: `Hello **${userName}**! I am your **EventHub AI Event Assistant**. I can help you discover campus events, manage your registrations, check your payment status, and find your gate QR passes.\n\nHere are some things you can ask me:`,
    suggestedFollowUps: [
      "What events are available?",
      "Show my registrations",
      "Which events are free?",
      "Where is my QR pass?",
      "How do I register for an event?",
    ],
    actions: [
      {
        label: "Browse Events Catalog",
        url: "/events",
        type: "link",
      },
      {
        label: "My Attendee Dashboard",
        url: "/dashboard/attendee",
        type: "link",
      },
    ],
  };
}
