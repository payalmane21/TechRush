/**
 * Diagnostic inspect of Vercel response headers
 */
const VERCEL_BASE = "https://tech-rush-api-server.vercel.app";

async function inspectHeaders() {
  console.log("=== Inspecting root / ===");
  const res = await fetch(`${VERCEL_BASE}/`);
  console.log("Status:", res.status);
  for (const [key, value] of res.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  const text = await res.text();
  console.log("Body snippet:", text.slice(0, 200));

  console.log("\n=== Inspecting /api/health ===");
  const res2 = await fetch(`${VERCEL_BASE}/api/health`);
  console.log("Status:", res2.status);
  for (const [key, value] of res2.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  const text2 = await res2.text();
  console.log("Body snippet:", text2.slice(0, 200));
}

inspectHeaders();
