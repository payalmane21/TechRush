const PROD_URL = "https://tech-rush-api-server.vercel.app/api";

async function testProd() {
  console.log("Checking live Vercel endpoints at:", PROD_URL);

  try {
    const res = await fetch(`${PROD_URL}/health`);
    console.log("Status /health:", res.status);
    const text = await res.text();
    console.log("Response /health:", text.slice(0, 200));
  } catch (err) {
    console.error("Error /health:", err.message);
  }

  try {
    const res = await fetch(`${PROD_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mahik@gmail.com", password: "123456" }),
    });
    console.log("Status /auth/login:", res.status);
    const data = await res.json();
    console.log("Login user:", data.name, "Role:", data.role);
  } catch (err) {
    console.error("Error /auth/login:", err.message);
  }
}

testProd();
