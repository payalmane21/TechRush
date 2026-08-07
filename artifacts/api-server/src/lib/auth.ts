import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const SALT_ROUNDS = 12; // Hardened bcrypt cost factor
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "eventhub-access-jwt-secret-2026";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "eventhub-refresh-jwt-secret-2026";
const QR_SECRET = process.env.QR_SECRET || "eventhub-qr-secret-2026";

/**
 * Hardened Bcrypt Password Hashing (Cost Factor 12)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Short-Lived Access Token (15 Minutes)
 */
export function generateAccessToken(
  user: { id: number; email: string; role: string },
): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: "access" },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
}

/**
 * Long-Lived Refresh Token (7 Days)
 */
export function generateRefreshToken(
  user: { id: number; email: string; role: string },
): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: "7d" },
  );
}

/**
 * Backwards Compatible Legacy Token Generator
 */
export function generateJwtToken(
  user: { id: number; email: string; role: string },
  rememberMe: boolean = false,
): string {
  return generateAccessToken(user);
}

export function verifyAccessToken(token: string): { id: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.type === "access") {
      return { id: decoded.id, email: decoded.email, role: decoded.role };
    }
    return decoded ? { id: decoded.id, email: decoded.email, role: decoded.role } : null;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { id: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as any;
    if (decoded && decoded.type === "refresh") {
      return { id: decoded.id, email: decoded.email, role: decoded.role };
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyJwtToken(token: string): { id: number; email: string; role: string } | null {
  return verifyAccessToken(token);
}

/**
 * HTTPS-Ready httpOnly Cookie Setter for Refresh Tokens
 */
export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction, // Enabled on HTTPS production
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear Refresh Token Cookie
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/auth/refresh",
  });
}

/**
 * XSS & HTML Input Sanitizer
 */
export function sanitizeInput(input: any): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeUserOutput<T extends Record<string, any>>(user: T): Omit<T, "passwordHash" | "otp" | "resetToken"> {
  if (!user) return user;
  const copy = { ...user };
  delete copy.passwordHash;
  delete copy.otp;
  delete copy.resetToken;
  return copy;
}

export function generateQrToken(registrationId: number): string {
  const payload = `reg:${registrationId}:${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyQrToken(token: string): number | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const expectedSig = crypto
      .createHmac("sha256", QR_SECRET)
      .update(payload)
      .digest("hex")
      .slice(0, 16);
    if (sig !== expectedSig) return null;
    const match = payload.match(/^reg:(\d+):/);
    if (!match) return null;
    return parseInt(match[1]!, 10);
  } catch {
    return null;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userRole?: string;
  }
}

// Unified Auth Middleware supporting both Session Cookies & JWT Bearer Tokens
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session) {
    (req as any).session = {};
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.session.userId = decoded.id;
      req.session.userRole = decoded.role;
      return next();
    }
  }

  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required. Please log in." });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session) {
      (req as any).session = {};
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.session.userId = decoded.id;
        req.session.userRole = decoded.role;
      }
    }

    if (!req.session?.userId) {
      res.status(401).json({ error: "Authentication required. Please log in." });
      return;
    }
    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      res.status(403).json({ error: "Access denied. Required role: " + roles.join(" or ") });
      return;
    }
    next();
  };
}
