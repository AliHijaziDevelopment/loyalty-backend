import crypto from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

function encode(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode(token) {
  return JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
}

function sign(encodedPayload) {
  return crypto.createHmac("sha256", env.qrTokenSecret).update(encodedPayload).digest("base64url");
}

function resolveWindowExpiry(ttlMinutes) {
  const ttlMs = Math.max(1, ttlMinutes) * 60 * 1000;
  const now = Date.now();
  return Math.ceil(now / ttlMs) * ttlMs;
}

export function createSignedQrToken(payload, ttlMinutes = env.qrTokenTtlMinutes) {
  const expiresAt = resolveWindowExpiry(ttlMinutes);
  const encodedPayload = encode({
    v: 1,
    ...payload,
    exp: expiresAt,
  });

  return {
    token: `${encodedPayload}.${sign(encodedPayload)}`,
    expiresAt,
  };
}

export function verifyQrToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    throw new AppError(400, "QR token is invalid.");
  }

  const [encodedPayload, providedSignature] = token.split(".");
  const expectedSignature = sign(encodedPayload);

  if (
    !providedSignature
    || providedSignature.length !== expectedSignature.length
    || !crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))
  ) {
    throw new AppError(400, "QR token signature is invalid.");
  }

  const payload = decode(encodedPayload);

  const isVisitPayload = Boolean(payload?.nonce);
  const isRewardClaimPayload = payload?.kind === "reward_claim" && Boolean(payload?.claimId) && Boolean(payload?.qrSecret);

  if ((!isVisitPayload && !isRewardClaimPayload) || !payload?.exp) {
    throw new AppError(400, "QR token payload is invalid.");
  }

  if (Date.now() > payload.exp) {
    throw new AppError(400, "QR token has expired.");
  }

  return payload;
}

export function createQrToken(nonce, ttlMinutes = env.qrTokenTtlMinutes) {
  return createSignedQrToken({ nonce }, ttlMinutes);
}
