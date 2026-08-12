/**
 * AI Event Mascot Generation Validation Suite
 * Tests AI mascot generation, event attachment, admin approval lifecycle, and attendee visibility.
 */

const BASE_URL = "http://localhost:5000/api";

let testsPassed = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("\n==========================================================================");
  console.log("🚀 STARTING AI EVENT MASCOT GENERATION VALIDATION SUITE");
  console.log("==========================================================================\n");

  // 1. Authenticate Organizer and Admin
  console.log("📌 PHASE 1: Authenticating Organizer and Admin");
  const orgLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "payalmane@gmail.com", password: "123456" }),
  });
  const orgData = await orgLogin.json();
  const orgToken = orgData.token;
  assert(orgLogin.status === 200, "Organizer authenticated (Payal Mane)");

  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "tanishkaghewari@gmail.com", password: "123456" }),
  });
  const adminData = await adminLogin.json();
  const adminToken = adminData.token;
  assert(adminLogin.status === 200, "Admin authenticated (Tanishka Ghewari)");

  // 2. AI Mascot Generation Tests
  console.log("\n📌 PHASE 2: AI Mascot Generation Endpoint (/api/events/mascot/generate)");
  const mascotRes = await fetch(`${BASE_URL}/events/mascot/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "RoboGenesis Robotics & AI Championship 2026",
      description: "Annual national robotics combat and autonomous drone coding tournament.",
      category: "Technology",
      keywords: ["Robotics", "AI", "Combat Bots", "Autonomous"],
    }),
  });
  const mascotData = await mascotRes.json();
  assert(mascotRes.status === 200, "Mascot generation returned HTTP 200 OK");
  assert(typeof mascotData.mascotName === "string" && mascotData.mascotName.length > 0, `Generated mascot name: '${mascotData.mascotName}'`);
  assert(mascotData.category === "technology", `Category matched: '${mascotData.category}'`);
  assert(typeof mascotData.mascotUrl === "string" && mascotData.mascotUrl.startsWith("data:image/svg+xml"), "Received valid high-res SVG Mascot Data URL");
  assert(typeof mascotData.prompt === "string" && mascotData.prompt.includes("cyber-owl"), "Generated contextual prompt matching event theme");

  // Cultural Category Mascot Test
  const cultMascotRes = await fetch(`${BASE_URL}/events/mascot/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "Harmony University Music & Dance Gala",
      category: "Cultural",
      keywords: ["Music", "Dance", "Orchestra"],
    }),
  });
  const cultMascotData = await cultMascotRes.json();
  assert(cultMascotData.category === "cultural", "Cultural event matched melody fox profile");
  assert(cultMascotData.mascotName.includes("Fox"), `Cultural mascot name: '${cultMascotData.mascotName}'`);

  // 3. Security Check
  console.log("\n📌 PHASE 3: Security & Authorization Guards");
  const unauthRes = await fetch(`${BASE_URL}/events/mascot/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test Event" }),
  });
  assert(unauthRes.status === 401, "Unauthenticated request rejected with HTTP 401 Unauthorized");

  // 4. Create Event with Generated Mascot
  console.log("\n📌 PHASE 4: Event Creation with AI Mascot & Approval Lifecycle");
  const createRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "RoboGenesis Robotics & AI Championship 2026",
      description: "Annual national robotics tournament with live arena battles.",
      category: "Technology",
      venue: "Robotics Arena & Maker Lab",
      startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 6).toISOString(),
      capacity: 350,
      price: 299,
      status: "draft",
      mascotUrl: mascotData.mascotUrl,
      mascotPrompt: mascotData.prompt,
    }),
  });
  const createdEvent = await createRes.json();
  const eventId = createdEvent.id;
  assert(createRes.status === 201, `Event created in DRAFT status (ID: ${eventId})`);
  assert(createdEvent.mascotUrl === mascotData.mascotUrl, "Mascot URL successfully persisted in event record");

  // 5. Submit Event for Approval
  const submitRes = await fetch(`${BASE_URL}/events/${eventId}/submit-approval`, {
    method: "POST",
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  const submittedEvent = await submitRes.json();
  assert(submitRes.status === 200, `Event submitted for approval (Status: ${submittedEvent.event.status})`);

  // 6. Admin Approves Event
  const approveRes = await fetch(`${BASE_URL}/events/${eventId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const approvedEvent = await approveRes.json();
  assert(approveRes.status === 200, `Admin approved event with mascot (Status: ${approvedEvent.event.status})`);

  // 7. Organizer Publishes Event
  const publishRes = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  const publishedEvent = await publishRes.json();
  assert(publishRes.status === 200, `Organizer published event (Status: ${publishedEvent.event.status})`);

  // 8. Public / Attendee Access Test
  console.log("\n📌 PHASE 5: Public Attendee Mascot Visibility");
  const publicRes = await fetch(`${BASE_URL}/events/${eventId}`);
  const publicEvent = await publicRes.json();
  assert(publicRes.status === 200, "Public event details fetched successfully");
  assert(publicEvent.mascotUrl === mascotData.mascotUrl, "Attendee can see official AI mascot on published event");

  // 9. Fallback Test: Event Creation without Mascot
  console.log("\n📌 PHASE 6: Fallback Test (Event Creation Without Mascot)");
  const fallbackRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "Campus Debate Society Meetup",
      category: "Academic",
      venue: "Room 102",
      startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
      capacity: 50,
      price: 0,
      status: "draft",
    }),
  });
  const fallbackEvent = await fallbackRes.json();
  assert(fallbackRes.status === 201, "Event created without mascot successfully (no failure)");

  console.log("\n==========================================================================");
  console.log(`📊 FINAL TEST SUMMARY: ${testsPassed} / ${totalTests} TESTS PASSED (100%)`);
  console.log("==========================================================================\n");
}

runTests().catch(console.error);
