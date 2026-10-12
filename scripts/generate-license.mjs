#!/usr/bin/env node
/**
 * VENDOR-ONLY TOOL -- do not ship this to customers.
 * Generates a license key for a new customer school install.
 *
 * Usage:
 *   LICENSE_SIGNING_SECRET=your-secret node scripts/generate-license.mjs \
 *     --school "Green Valley Public School" --plan standard --days 365
 *
 * Omit --days for a perpetual (never-expiring) license.
 */
import crypto from "crypto";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    out[args[i].replace(/^--/, "")] = args[i + 1];
  }
  return out;
}

const { school, plan = "standard", days } = parseArgs();
const secret = process.env.LICENSE_SIGNING_SECRET;

if (!school) {
  console.error("Usage: LICENSE_SIGNING_SECRET=... node scripts/generate-license.mjs --school \"Name\" [--plan standard] [--days 365]");
  process.exit(1);
}
if (!secret) {
  console.error("Set LICENSE_SIGNING_SECRET env var (keep this secret, never commit it).");
  process.exit(1);
}

const expiresAt = days ? new Date(Date.now() + Number(days) * 86400000).toISOString() : null;
const payload = { schoolName: school, expiresAt, plan };
const json = JSON.stringify(payload);
const body = Buffer.from(json, "utf8").toString("base64url");
const signature = crypto.createHmac("sha256", secret).update(body).digest("hex").slice(0, 32);
const key = `${body}.${signature}`;

console.log("License key for:", school);
console.log("Plan:", plan);
console.log("Expires:", expiresAt || "never (perpetual)");
console.log("");
console.log(key);
