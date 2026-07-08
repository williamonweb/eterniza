const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_COOKIE_NAME = "eterniza_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("AUTH_SECRET precisa estar configurado com pelo menos 24 caracteres.");
  }
  return secret;
}

function bytesToBase64Url(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized, "base64"));
  }

  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(value) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}

async function sha256Hmac(value) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API indisponível para autenticação.");
  }

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export async function createSessionToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = encodeJson(payload);
  const signature = await sha256Hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token) {
  try {
    if (!token || !token.includes(".")) return null;
    const [encodedPayload, signature] = token.split(".");
    const expectedSignature = await sha256Hmac(encodedPayload);
    if (signature !== expectedSignature) return null;

    const payload = decodeJson(encodedPayload);
    if (!payload?.id || !payload?.email || !payload?.role || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
