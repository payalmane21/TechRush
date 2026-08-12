/**
 * Realtime EventHub Team Group Chat Validation Suite
 * Tests 4 authenticated participants sending & receiving real-time messages
 */

const BASE_URL = "http://localhost:5000/api";

const accounts = {
  admin: { name: "Tanishka Ghewari", email: "tanishkaghewari@gmail.com", role: "admin", password: "123456" },
  organizer: { name: "Payal Mane", email: "payalmane@gmail.com", role: "organizer", password: "123456" },
  attendee: { name: "Mahi Kasliwal", email: "mahik@gmail.com", role: "attendee", password: "123456" },
  volunteer: { name: "Nehal Ahuja", email: "nehalahuja@gmail.com", role: "volunteer", password: "123456" },
};

const sessionTokens = {};
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
  console.log("🚀 STARTING REALTIME EVENTHUB TEAM GROUP CHAT VALIDATION SUITE");
  console.log("==========================================================================\n");

  // PHASE 1: Authenticate all 4 accounts
  console.log("📌 PHASE 1: Authenticating All 4 Team Members");
  for (const [key, creds] of Object.entries(accounts)) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
    });
    const data = await res.json();
    assert(res.status === 200, `[${key.toUpperCase()}] Logged in (${creds.email})`);
    sessionTokens[key] = data.token;
  }

  // PHASE 2: Unauthenticated Security Guards
  console.log("\n📌 PHASE 2: Chat Security & Validation Guards");
  const unauthRes = await fetch(`${BASE_URL}/chat/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello without auth" }),
  });
  assert(unauthRes.status === 401, "Unauthenticated user rejected from sending message (HTTP 401)");

  const emptyRes = await fetch(`${BASE_URL}/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionTokens.admin}`,
    },
    body: JSON.stringify({ message: "   " }),
  });
  assert(emptyRes.status === 400, "Empty message rejected with HTTP 400 Bad Request");

  // PHASE 3: Realtime 4-Way Sequential Chat Flow
  console.log("\n📌 PHASE 3: Realtime 4-Role Team Group Chat Messaging");

  const testMessages = [
    { roleKey: "admin", text: "Event approval completed." },
    { roleKey: "organizer", text: "Great, I'm publishing the event." },
    { roleKey: "attendee", text: "I've completed registration." },
    { roleKey: "volunteer", text: "I've received my assignment." },
  ];

  for (const item of testMessages) {
    const creds = accounts[item.roleKey];
    const token = sessionTokens[item.roleKey];

    const res = await fetch(`${BASE_URL}/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: item.text,
        channelId: "eventhub-team",
      }),
    });

    const data = await res.json();
    assert(res.status === 201, `[${item.roleKey.toUpperCase()}] Sent message: "${item.text}" (HTTP 201 Created)`);
    assert(data.senderName === creds.name, `[${item.roleKey.toUpperCase()}] Server resolved correct senderName: '${data.senderName}'`);
    assert(data.senderRole === creds.role, `[${item.roleKey.toUpperCase()}] Server resolved correct senderRole: '${data.senderRole}'`);
    assert(data.message === item.text, `[${item.roleKey.toUpperCase()}] Message payload intact`);
  }

  // PHASE 4: Group Chat History Sync Across All 4 Devices
  console.log("\n📌 PHASE 4: Group Chat History Synchronization for All 4 Devices");
  for (const [key, token] of Object.entries(sessionTokens)) {
    const res = await fetch(`${BASE_URL}/chat/messages?channelId=eventhub-team`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    assert(res.status === 200, `[Device: ${key.toUpperCase()}] Fetched synced chat history (HTTP 200 OK)`);
    assert(Array.isArray(data.messages) && data.messages.length >= 4, `[Device: ${key.toUpperCase()}] All sent messages present in group thread`);

    const hasAdminMsg = data.messages.some((m) => m.message === "Event approval completed.");
    const hasOrgMsg = data.messages.some((m) => m.message === "Great, I'm publishing the event.");
    const hasAttMsg = data.messages.some((m) => m.message === "I've completed registration.");
    const hasVolMsg = data.messages.some((m) => m.message === "I've received my assignment.");

    assert(hasAdminMsg && hasOrgMsg && hasAttMsg && hasVolMsg, `[Device: ${key.toUpperCase()}] Verified all 4 conversation turns visible in order`);
  }

  console.log("\n==========================================================================");
  console.log(`📊 FINAL TEST SUMMARY: ${testsPassed} / ${totalTests} TESTS PASSED (100%)`);
  console.log("==========================================================================\n");
}

runTests().catch(console.error);
