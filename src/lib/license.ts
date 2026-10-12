import crypto from "crypto";

// Simple offline-verifiable license key for self-hosted commercial software.
// This is NOT DRM-grade (the customer has full access to the running app),
// it's "honest customer" licensing like most self-hosted products use --
// good enough to gate the UI and support a sales process, not to stop a
// determined pirate. The secret below must be set ONLY in the vendor's own
// key-generation environment, never shipped inside the customer's app build
// in a way that would let them mint their own keys (kept as an env var that
// is NOT part of install.ps1's generated .env).

export type LicensePayload = {
  schoolName: string;
  expiresAt: string | null; // ISO date, or null = perpetual
  plan: string;
};

function getSecret(): string {
  const secret = process.env.LICENSE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("LICENSE_SIGNING_SECRET not set -- required to sign/verify license keys");
  }
  return secret;
}

export function generateLicenseKey(payload: LicensePayload): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(body).digest("hex").slice(0, 32);
  return `${body}.${signature}`;
}

export function verifyLicenseKey(
  key: string
): { valid: true; payload: LicensePayload } | { valid: false; error: string } {
  const [body, signature] = key.split(".");
  if (!body || !signature) {
    return { valid: false, error: "Malformed license key" };
  }
  let expectedSig: string;
  try {
    expectedSig = crypto.createHmac("sha256", getSecret()).update(body).digest("hex").slice(0, 32);
  } catch {
    return { valid: false, error: "Server not configured to verify licenses" };
  }
  if (signature !== expectedSig) {
    return { valid: false, error: "Invalid license key (signature mismatch)" };
  }
  let payload: LicensePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { valid: false, error: "Malformed license key payload" };
  }
  if (payload.expiresAt && new Date(payload.expiresAt).getTime() < Date.now()) {
    return { valid: false, error: "License expired" };
  }
  return { valid: true, payload };
}
