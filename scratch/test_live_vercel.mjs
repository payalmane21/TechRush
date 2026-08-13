/**
 * Test live Vercel deployment endpoints
 */
const VERCEL_BASE = "https://tech-rush-api-server.vercel.app";

async function testVercel() {
  console.log("Testing live Vercel deployment at:", VERCEL_BASE);

  try {
    const res1 = await fetch(`${VERCEL_BASE}/api/health`);
    console.log("GET /api/health status:", res1.status, res1.headers.get("content-type"));
    const text1 = await res1.text();
    console.log("GET /api/health body:", text1.slice(0, 200));
  } catch (err) {
    console.error("GET /api/health error:", err);
  }

  try {
    const res2 = await fetch(`${VERCEL_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mahik@gmail.com", password: "123456" }),
    });
    console.log("POST /api/auth/login status:", res2.status, res2.headers.get("content-type"));
    const text2 = await res2.text();
    console.log("POST /api/auth/login body:", text2.slice(0, 200));
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
  }
}

testVercel();
