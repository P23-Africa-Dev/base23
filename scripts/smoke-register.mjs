/**
 * Smoke-test registration against the public Laravel API (CSRF + register).
 * Run: node scripts/smoke-register.mjs
 */
const API = process.env.API_URL || "https://api.noel54.com";

async function main() {
  const email = `smoke_${Date.now()}@example.com`;
  const jar = new Map();

  const storeCookies = (res) => {
    const raw = res.headers.getSetCookie?.() || [];
    for (const c of raw) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  };

  const cookieHeader = () =>
    [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

  const csrfRes = await fetch(`${API}/sanctum/csrf-cookie`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  storeCookies(csrfRes);
  if (!csrfRes.ok && csrfRes.status !== 204) {
    throw new Error(`csrf failed: ${csrfRes.status}`);
  }

  const xsrf = decodeURIComponent(jar.get("XSRF-TOKEN") || "");
  if (!xsrf) {
    console.warn("No XSRF-TOKEN cookie — continuing anyway");
  }

  const body = {
    name: "Smoke Hirer",
    email,
    password: "Password1!",
    password_confirmation: "Password1!",
    account_type: "company",
    company_name: "Smoke Co",
  };

  const regRes = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: cookieHeader(),
      "X-XSRF-TOKEN": xsrf,
      Origin: "https://base23.vercel.app",
      Referer: "https://base23.vercel.app/register?type=company",
    },
    body: JSON.stringify(body),
  });

  const text = await regRes.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  console.log("status", regRes.status);
  console.log(JSON.stringify(json, null, 2));

  if (regRes.status !== 200 || !json.success) {
    process.exitCode = 1;
    return;
  }

  if (json.user?.account_type !== "company") {
    console.error("expected company account_type");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
