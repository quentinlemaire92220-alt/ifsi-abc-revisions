// Server-side only. Never bundle this file or its secrets into GitHub Pages.
// Auth: Supabase signed access token + exact owner UUID. Source: private Google Sheet.
const STATES = new Set(["Présent", "Absent", "À vérifier"]);
const FIELDS: Record<string, number> = { transcript: 3, captures: 4, official: 5 };
const TAB = "'Mes sources'";
const enc = new TextEncoder();

// Allowlist the exact public GitHub Pages origin, not a path or a trailing-slash
// dependent secret. CORS is only browser isolation; ownerAuthenticated is the
// authorization barrier and still runs on every GET/PATCH.
const origin = "https://quentinlemaire92220-alt.github.io";
// SUPABASE_ANON_KEY is legacy: recent Supabase projects use named publishable keys.
// A publishable key has only browser-level privileges; it is NOT an admin credential.
const endpoint = Deno.env.get("SUPABASE_URL") || "https://ywicbdntavuitkcqvmqx.supabase.co";
function supabasePublicKey() {
  const legacy = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacy) return legacy;
  try {
    const named = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    if (typeof named.default === "string" && named.default.startsWith("sb_publishable_")) return named.default;
  } catch { /* Fall back to the public key already shipped with the pilot UI. */ }
  return "sb_publishable_eY2KDhhPj660ASV3gxbnnQ_VrCOak3P";
}
const anonKey = supabasePublicKey();
const ownerId = Deno.env.get("IFSI_SOURCE_OWNER_UID") || "";
const spreadsheetId = Deno.env.get("IFSI_SOURCE_SHEET_ID") || "";
const credentialJson = Deno.env.get("IFSI_GOOGLE_SERVICE_ACCOUNT_JSON") || "";

function response(requestOrigin: string | null, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Vary": "Origin",
      ...(requestOrigin && requestOrigin === origin ? { "Access-Control-Allow-Origin": origin } : {}),
    },
  });
}
function b64url(bytes: Uint8Array) {
  return btoa(Array.from(bytes, x => String.fromCharCode(x)).join(""))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function googleAccessToken() {
  const creds = JSON.parse(credentialJson);
  if (typeof creds.client_email !== "string" || typeof creds.private_key !== "string") throw Error("Invalid credentials");
  const pem = creds.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const keyBytes = Uint8Array.from(atob(pem), ch => ch.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyBytes, {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"}, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const data = b64url(enc.encode(JSON.stringify({alg: "RS256", typ: "JWT"}))) + "." +
    b64url(enc.encode(JSON.stringify({
      iss: creds.client_email,
      aud: "https://oauth2.googleapis.com/token",
      scope: "https://www.googleapis.com/auth/spreadsheets",
      iat: now, exp: now + 3500,
    })));
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(data)));
  const assertion = data + "." + b64url(signature);
  const tokenReply = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion}),
  });
  if (!tokenReply.ok) throw Error("Google token exchange failed");
  const token = (await tokenReply.json()).access_token;
  if (typeof token !== "string" || !token) throw Error("Google access token absent");
  return token;
}
function sheetRange(range: string) {
  return "https://sheets.googleapis.com/v4/spreadsheets/" + encodeURIComponent(spreadsheetId) +
    "/values/" + encodeURIComponent(TAB + "!" + range);
}
async function readRows(token: string): Promise<string[][]> {
  const r = await fetch(sheetRange("A2:G1000") + "?valueRenderOption=FORMATTED_VALUE", {
    headers: {Authorization: "Bearer " + token}, cache: "no-store",
  });
  if (!r.ok) throw Error("Google Sheets read failed");
  const values = (await r.json()).values;
  if (values !== undefined && !Array.isArray(values)) throw Error("Unexpected Sheets response");
  return values || [];
}
function normalizeState(s: unknown) {
  // Unknown is never automatically transformed into "Absent".
  return STATES.has(s as string) ? s as string : "À vérifier";
}
function projectRows(rows: string[][]) {
  const used = new Set<string>();
  return rows.map((row, ix) => {
    const key = String(row[0] || "").trim();
    if (!key) return null;
    if (!/^[a-z0-9_-]+::p[0-9]{2}$/.test(key)) throw Error("Invalid source key");
    // Ambiguous course rows must never be silently mapped to the first match.
    if (used.has(key)) throw Error("Duplicate course key");
    used.add(key);
    return {
      key, row: ix + 2,
      transcript: normalizeState(row[3]), captures: normalizeState(row[4]),
      official: normalizeState(row[5]), production: String(row[6] || "À vérifier").slice(0, 80),
    };
  }).filter(Boolean);
}
async function ownerAuthenticated(request: Request) {
  if (!/^[0-9a-f-]{36}$/i.test(ownerId)) return false;
  const h = request.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) return false;
  const token = h.slice(7);
  const result = await fetch(endpoint + "/auth/v1/user", {
    headers: {Authorization: "Bearer " + token, apikey: anonKey}, cache: "no-store",
  });
  if (!result.ok) return false;
  const user = await result.json();
  // JWT signature/session is validated by Supabase Auth, never trust a client-supplied email.
  return user.id === ownerId && Boolean(user.email_confirmed_at);
}
Deno.serve(async (req: Request) => {
  const reqOrigin = req.headers.get("Origin");
  // CORS preflight never contains an Authorization header. Handle it before
  // session, credentials, or Google API access; deny foreign origins.
  if (req.method === "OPTIONS" && reqOrigin === origin) {
    return new Response(null, {status: 204, headers: {
      "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Max-Age": "600", "Vary": "Origin",
    }});
  }
  if (reqOrigin !== origin) return response(null, 403, {error: "Origin forbidden"});
  if (req.method !== "GET" && req.method !== "PATCH")
    return response(reqOrigin, 405, {error: "Method not allowed"});
  // This list contains environment variable NAMES only, never their values.
  // Logs permit precise diagnosis while browser responses reveal no private details.
  const missing = [
    !endpoint && "SUPABASE_URL", !anonKey && "SUPABASE_PUBLISHABLE_KEYS",
    !ownerId && "IFSI_SOURCE_OWNER_UID", !spreadsheetId && "IFSI_SOURCE_SHEET_ID",
    !credentialJson && "IFSI_GOOGLE_SERVICE_ACCOUNT_JSON",
  ].filter(Boolean);
  if (missing.length) {
    console.warn("IFSI sources server configuration missing:", missing.join(", "));
    return response(reqOrigin, 503, {error: "Private integration not configured"});
  }
  try {
    if (!(await ownerAuthenticated(req))) return response(reqOrigin, 403, {error: "Owner-only"});
    const token = await googleAccessToken();
    const rows = projectRows(await readRows(token));
    if (req.method === "GET") return response(reqOrigin, 200, {rows: rows.map(({row, ...rest}: any) => rest)});
    const body = await req.json().catch(() => null);
    const key = body?.courseKey, field = body?.field, expected = body?.expected, next = body?.next;
    if (typeof key !== "string" || !/^[a-z0-9_-]+::p[0-9]{2}$/.test(key) ||
        !Object.hasOwn(FIELDS, field) || !STATES.has(expected) || !STATES.has(next))
      return response(reqOrigin, 400, {error: "Invalid update"});
    const target = rows.find((row: any) => row.key === key) as any;
    if (!target) return response(reqOrigin, 404, {error: "Course not found"});
    if (target[field] !== expected)
      return response(reqOrigin, 409, {error: "Source changed, refresh required"});
    const column = "ABCDEF"[FIELDS[field]];
    const update = await fetch(sheetRange(column + target.row) + "?valueInputOption=RAW", {
      method: "PUT",
      headers: {"Authorization": "Bearer " + token, "Content-Type": "application/json"},
      body: JSON.stringify({range: TAB + "!" + column + target.row, majorDimension: "ROWS", values: [[next]]}),
    // Google Sheets has no conditional cell update. A read-before-write detects stale states,
    // but cannot eliminate the final concurrent-write window.
    });
    // Sheets value update requires the valueInputOption query parameter.
    if (!update.ok) throw Error("Google Sheets write failed");
    return response(reqOrigin, 200, {courseKey: key, field, value: next});
  } catch {
    return response(reqOrigin, 502, {error: "Private source service unavailable"});
  }
});
