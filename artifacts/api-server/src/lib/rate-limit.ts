import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Rate Limiter for Login Endpoint (Max 50 attempts per 15 minutes - supports team presentations on same IP)
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts from this IP. Please wait a few minutes before trying again.",
  },
});

/**
 * Rate Limiter for Signup Endpoint (Max 5 accounts per 15 minutes)
 */
export const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many accounts created from this IP. Please wait 15 minutes before creating another account.",
  },
});

/**
 * Rate Limiter for OTP Verification Endpoint (Max 5 attempts per 10 minutes)
 */
export const otpVerificationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many invalid OTP verification attempts. Please wait 10 minutes before trying again.",
  },
});

/**
 * Rate Limiter for Resend OTP Endpoint (Max 1 attempt per 60 seconds)
 */
export const resendOtpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Please wait 60 seconds before requesting a new verification code.",
  },
});

// Brute-force Lockout Engine (Email -> { failedCount: number; lockedUntil: number })
interface LockoutEntry {
  failedCount: number;
  lockedUntil: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

export function checkAccountLockout(email: string): { isLocked: boolean; remainingMinutes?: number } {
  const normEmail = email.toLowerCase().trim();
  const entry = lockoutStore.get(normEmail);
  if (!entry) return { isLocked: false };

  if (Date.now() < entry.lockedUntil) {
    const remainingMs = entry.lockedUntil - Date.now();
    return { isLocked: true, remainingMinutes: Math.ceil(remainingMs / (60 * 1000)) };
  }

  // Lockout expired—reset counter
  if (entry.lockedUntil > 0 && Date.now() >= entry.lockedUntil) {
    lockoutStore.delete(normEmail);
  }

  return { isLocked: false };
}

export function recordFailedLoginAttempt(email: string): { isLocked: boolean; failedCount: number } {
  const normEmail = email.toLowerCase().trim();
  const entry = lockoutStore.get(normEmail) || { failedCount: 0, lockedUntil: 0 };
  entry.failedCount += 1;

  if (entry.failedCount >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
    lockoutStore.set(normEmail, entry);
    console.warn(`🔒 [Brute-Force Shield] Account locked for ${normEmail} due to 5 failed login attempts`);
    return { isLocked: true, failedCount: entry.failedCount };
  }

  lockoutStore.set(normEmail, entry);
  return { isLocked: false, failedCount: entry.failedCount };
}

export function resetFailedLoginAttempts(email: string): void {
  const normEmail = email.toLowerCase().trim();
  lockoutStore.delete(normEmail);
}
