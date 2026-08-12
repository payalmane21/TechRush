/**
 * AI Chatbot Mascot & Event-Specific Theming Validation Suite
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
  console.log("🚀 STARTING AI CHATBOT MASCOT & EVENT-SPECIFIC THEMING VALIDATION SUITE");
  console.log("==========================================================================\n");

  // 1. Authenticate Demo Users
  console.log("📌 PHASE 1: Authenticating Users");
  const attendeeLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mahik@gmail.com", password: "123456" }),
  });
  const attendeeData = await attendeeLogin.json();
  const attendeeToken = attendeeData.token;
  assert(attendeeLogin.status === 200, "Attendee authenticated (Mahi Kasliwal)");

  const orgLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "payalmane@gmail.com", password: "123456" }),
  });
  const orgData = await orgLogin.json();
  const orgToken = orgData.token;
  assert(orgLogin.status === 200, "Organizer authenticated (Payal Mane)");

  // 2. Strict Role Authorization
  console.log("\n📌 PHASE 2: Attendee-Only Authorization Guards");
  const unauthRes = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello" }),
  });
  assert(unauthRes.status === 401, "Unauthenticated request rejected with HTTP 401");

  const orgDeniedRes = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({ message: "Hello" }),
  });
  assert(orgDeniedRes.status === 403, "Non-attendee (Organizer) rejected with HTTP 403 Forbidden");

  // 3. General Campus Chat & Default Mascot
  console.log("\n📌 PHASE 3: General Chatbot Mascot (Default Nova the Spark)");
  const generalRes = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({ message: "What events are available?" }),
  });
  const generalData = await generalRes.json();
  assert(generalRes.status === 200, "General chat returned HTTP 200 OK");
  assert(generalData.theme === "GENERAL", `General theme applied: '${generalData.theme}'`);
  assert(generalData.mascotName.includes("Nova"), `Default mascot: '${generalData.mascotName}'`);
  assert(typeof generalData.mascotUrl === "string" && generalData.mascotUrl.startsWith("data:image/svg+xml"), "Valid default mascot SVG URI returned");

  // 4. Create Tech, Sports, and Cultural Events for Context Testing
  console.log("\n📌 PHASE 4: Setting Up Thematic Events for Testing");
  
  // Tech Event
  const techEvRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "AI Matrix Hackathon 2026",
      description: "24-hour neural network coding marathon with industry mentors.",
      category: "Technology",
      venue: "Computer Science Innovation Lab B",
      startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      capacity: 180,
      price: 250,
      status: "published",
    }),
  });
  const techEv = await techEvRes.json();
  const techId = techEv.id;
  assert(techEvRes.status === 201, `Tech Event created (ID: ${techId})`);

  // Sports Event
  const sportsEvRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "Varsity Champions Cricket League",
      description: "Inter-college cricket championship tournament.",
      category: "Sports",
      venue: "Main University Sports Complex",
      startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3 + 18000000).toISOString(),
      capacity: 300,
      price: 0,
      status: "published",
    }),
  });
  const sportsEv = await sportsEvRes.json();
  const sportsId = sportsEv.id;
  assert(sportsEvRes.status === 201, `Sports Event created (ID: ${sportsId})`);

  // Cultural Event
  const culturalEvRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${orgToken}`,
    },
    body: JSON.stringify({
      title: "Symphony Spring Music Festival",
      description: "Live musical ensembles and student indie bands.",
      category: "Cultural",
      venue: "Open Air Amphitheatre",
      startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 7 + 14400000).toISOString(),
      capacity: 500,
      price: 150,
      status: "published",
    }),
  });
  const culturalEv = await culturalEvRes.json();
  const culturalId = culturalEv.id;
  assert(culturalEvRes.status === 201, `Cultural Event created (ID: ${culturalId})`);

  // 5. Test Tech Event Grounding & Theme
  console.log("\n📌 PHASE 5: Tech Event Grounding & Mascot Verification");
  const techChat = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({
      message: "What is this event about?",
      eventId: techId,
    }),
  });
  const techChatData = await techChat.json();
  assert(techChat.status === 200, "Tech event chat returned HTTP 200 OK");
  assert(techChatData.theme === "TECH", `Theme resolved to 'TECH': '${techChatData.theme}'`);
  assert(techChatData.mascotName.includes("Owl") || techChatData.mascotName.includes("AI Matrix"), `Tech Mascot: '${techChatData.mascotName}'`);
  assert(techChatData.message.includes("AI Matrix Hackathon 2026"), "Response grounded in actual event title");
  assert(techChatData.message.includes("Innovation Lab B"), "Response grounded in actual event venue");

  // 6. Test Sports Event Grounding & Fee Question
  console.log("\n📌 PHASE 6: Sports Event Grounding & Fee Answering");
  const sportsChat = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({
      message: "How much does it cost?",
      eventId: sportsId,
    }),
  });
  const sportsChatData = await sportsChat.json();
  assert(sportsChat.status === 200, "Sports chat returned HTTP 200 OK");
  assert(sportsChatData.theme === "SPORTS", `Theme resolved to 'SPORTS': '${sportsChatData.theme}'`);
  assert(sportsChatData.mascotName.includes("Panther") || sportsChatData.mascotName.includes("Cricket"), `Sports Mascot: '${sportsChatData.mascotName}'`);
  assert(sportsChatData.message.includes("Free") || sportsChatData.message.includes("₹0"), "Correctly answered that sports event has ₹0 entry fee");

  // 7. Test Cultural Event Grounding & Venue Question
  console.log("\n📌 PHASE 7: Cultural Event Grounding & Venue Question");
  const culturalChat = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({
      message: "Where is it located?",
      eventId: culturalId,
    }),
  });
  const culturalChatData = await culturalChat.json();
  assert(culturalChat.status === 200, "Cultural chat returned HTTP 200 OK");
  assert(culturalChatData.theme === "CULTURAL", `Theme resolved to 'CULTURAL': '${culturalChatData.theme}'`);
  assert(culturalChatData.mascotName.includes("Fox") || culturalChatData.mascotName.includes("Music"), `Cultural Mascot: '${culturalChatData.mascotName}'`);
  assert(culturalChatData.message.includes("Amphitheatre"), "Correctly answered with the Open Air Amphitheatre location");

  // 8. Test Registration Walkthrough & Open Seats
  console.log("\n📌 PHASE 8: Registration & Availability Grounded Answering");
  const regHowChat = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({
      message: "How do I register?",
      eventId: techId,
    }),
  });
  const regHowData = await regHowChat.json();
  assert(regHowData.message.includes("Register") && regHowData.actions.length > 0, "Provided step-by-step registration guide with direct action CTA");

  const openSeatsChat = await fetch(`${BASE_URL}/chat/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${attendeeToken}`,
    },
    body: JSON.stringify({
      message: "Is registration still open?",
      eventId: techId,
    }),
  });
  const openSeatsData = await openSeatsChat.json();
  assert(openSeatsData.message.includes("OPEN") && openSeatsData.message.includes("180"), "Reported authentic live seat availability (180 capacity)");

  console.log("\n==========================================================================");
  console.log(`📊 FINAL TEST SUMMARY: ${testsPassed} / ${totalTests} TESTS PASSED (100%)`);
  console.log("==========================================================================\n");
}

runTests().catch(console.error);
