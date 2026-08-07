import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// In-Memory Verification Storage (maps normalized email -> verification record)
type VerificationEntry = {
  otp: string;
  token: string;
  expiresAt: number;
  lastSentAt: number;
};

const verificationStore = new Map<string, VerificationEntry>();
const tokenToEmailMap = new Map<string, string>();

// Automatic background cleanup for expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of verificationStore.entries()) {
    if (entry.expiresAt < now) {
      verificationStore.delete(email);
      tokenToEmailMap.delete(entry.token);
    }
  }
}, 5 * 60 * 1000);

export const generateOtp = generateVerificationData;
export const verifyOtpCode = (email: string, otp: string) => verifyTokenOrOtp({ email, otp });
export const renderEmailVerificationTemplate = buildVerificationEmailHtml;
export const renderWelcomeEmailTemplate = (name: string) => `<p>Welcome to EventHub, ${name}!</p>`;
export const renderPasswordResetTemplate = (name: string, token: string, baseUrl?: string) => buildVerificationEmailHtml({ name, email: "", otp: "", token, appBaseUrl: baseUrl });

/**
 * Generates a cryptographically secure 6-digit OTP and 256-bit signed token (10-minute expiry)
 */
export function generateVerificationData(email: string): { otp: string; token: string; expiresAt: number } {
  const normEmail = email.toLowerCase().trim();
  const existing = verificationStore.get(normEmail);
  const now = Date.now();

  // Rate Limiting: Minimum 60 seconds between resend requests
  if (existing && now - existing.lastSentAt < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
    throw new Error(`Please wait ${waitSeconds} seconds before requesting a new verification email.`);
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  // Clean up any existing token for this email
  if (existing?.token) {
    tokenToEmailMap.delete(existing.token);
  }

  verificationStore.set(normEmail, {
    otp,
    token,
    expiresAt,
    lastSentAt: now,
  });

  tokenToEmailMap.set(token, normEmail);

  return { otp, token, expiresAt };
}

/**
 * Verifies an OTP code or cryptographic token for a user account
 */
export function verifyTokenOrOtp(input: { email?: string; otp?: string; token?: string }): { success: boolean; email?: string; message: string } {
  const now = Date.now();

  // 1. Verify by Cryptographic Token
  if (input.token) {
    const normEmail = tokenToEmailMap.get(input.token.trim());
    if (!normEmail) {
      return { success: false, message: "Invalid or expired verification link." };
    }

    const entry = verificationStore.get(normEmail);
    if (!entry || entry.token !== input.token.trim()) {
      return { success: false, message: "Invalid verification token." };
    }

    if (entry.expiresAt < now) {
      verificationStore.delete(normEmail);
      tokenToEmailMap.delete(input.token.trim());
      return { success: false, message: "Verification link has expired (valid for 10 minutes). Please request a new code." };
    }

    // Success: Clean up store
    verificationStore.delete(normEmail);
    tokenToEmailMap.delete(input.token.trim());
    return { success: true, email: normEmail, message: "Email verified successfully!" };
  }

  // 2. Verify by 6-Digit OTP Code
  if (input.email && input.otp) {
    const normEmail = input.email.toLowerCase().trim();
    const entry = verificationStore.get(normEmail);

    if (!entry) {
      return { success: false, message: "No active verification code found for this email. Please request a new code." };
    }

    if (entry.expiresAt < now) {
      verificationStore.delete(normEmail);
      tokenToEmailMap.delete(entry.token);
      return { success: false, message: "Verification code has expired (valid for 10 minutes). Please click resend." };
    }

    if (entry.otp !== input.otp.trim()) {
      return { success: false, message: "Invalid 6-digit verification code. Please check your email and try again." };
    }

    // Success: Clean up store
    verificationStore.delete(normEmail);
    tokenToEmailMap.delete(entry.token);
    return { success: true, email: normEmail, message: "Email verified successfully!" };
  }

  return { success: false, message: "Missing email, OTP code, or token." };
}

/**
 * Builds standard Responsive HTML Email Template for EventHub Verification
 */
export function buildVerificationEmailHtml(options: {
  name: string;
  email: string;
  otp: string;
  token: string;
  appBaseUrl?: string;
}): string {
  const baseUrl = options.appBaseUrl || process.env.VITE_API_BASE_URL || "http://localhost:5000";
  const verifyLink = `${baseUrl}/verify-email?email=${encodeURIComponent(options.email)}&otp=${options.otp}&token=${options.token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #801B3B 0%, #4A1024 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #801B3B; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #801B3B; margin: 8px 0; font-family: monospace; }
        .button { display: inline-block; background: #801B3B; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; margin: 16px 0; text-align: center; box-shadow: 0 4px 12px rgba(128,27,59,0.3); }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 EventHub</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Campus Event & Volunteer Management Portal</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
          <p>Hello <strong>${options.name}</strong>,</p>
          <p>Thank you for registering on EventHub! Please use the 6-digit verification code below or click the verification button to activate your account.</p>

          <div class="otp-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Your 6-Digit OTP Verification Code</div>
            <div class="otp-code">${options.otp}</div>
            <div className="badge">Expires in 10 minutes</div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyLink}" class="button" target="_blank">Verify Email Account →</a>
          </div>

          <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this verification link into your browser:</p>
          <p style="font-size: 12px; word-break: break-all; color: #801B3B;"><a href="${verifyLink}">${verifyLink}</a></p>
        </div>
        <div class="footer">
          <p>© 2026 EventHub Portal. All rights reserved.</p>
          <p style="margin-top: 4px;">If you did not request this verification email, please ignore this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Dispatches Email Notification via Resend API SDK or Nodemailer Gmail SMTP
 */
export async function sendEmailNotification(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const isDemoMode = process.env.EMAIL_DEMO_MODE === "true";
  const configuredDemoEmails = process.env.VERIFIED_DEMO_EMAIL || "csvc.8b19.payal@gmail.com,payalmane2107@gmail.com";
  const displayDemoEmails = "csvc.8b19.payal@gmail.com, payalmane2107@gmail.com";

  let finalHtml = options.html;
  let finalSubject = options.subject;

  if (isDemoMode) {
    finalSubject = `[Demo Redirect for ${options.to}] ${options.subject}`;
    const demoBanner = `
      <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-family: 'Inter', sans-serif;">
        <div style="font-size: 14px; font-weight: 800; color: #1e40af; margin-bottom: 6px;">💡 Hackathon Demo Mode Active</div>
        <div style="font-size: 13px; color: #1e3a8a; line-height: 1.6;">
          This verification email was redirected to your verified demo inboxes (<code>${displayDemoEmails}</code>).<br>
          <strong>Original Registered User:</strong> <code style="background:#dbeafe; padding:2px 6px; border-radius:4px;">${options.to}</code><br>
          <em>Clicking the link below or typing the OTP code will activate the original user account!</em>
        </div>
      </div>
    `;
    finalHtml = demoBanner + options.html;
  }

  // 1. Try Resend API SDK if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromAddress = process.env.RESEND_FROM || "EventHub Verification <onboarding@resend.dev>";
      const targetAddress = isDemoMode ? "payalmane2107@gmail.com" : options.to;

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [targetAddress],
        subject: finalSubject,
        html: finalHtml,
      });

      if (!error && data?.id) {
        console.log(`📧 [Resend API - Demo Mode: ${isDemoMode}] Delivered real email to ${targetAddress} (Original User: ${options.to}, ID: ${data.id})`);
        return true;
      }
      if (error) {
        console.warn("⚠️ [Resend Delivery Warning]:", error.message);
      }
    } catch (err: any) {
      console.warn("⚠️ [Resend Exception]:", err.message);
    }
  }

  // 2. Try Nodemailer Gmail SMTP if EMAIL_USER & EMAIL_PASS are configured
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const smtpTarget = isDemoMode ? "csvc.8b19.payal@gmail.com" : options.to;

      await transporter.sendMail({
        from: `"EventHub Verification" <${emailUser}>`,
        to: smtpTarget,
        subject: finalSubject,
        html: finalHtml,
      });

      console.log(`📧 [Gmail SMTP - Demo Mode: ${isDemoMode}] Delivered real email to ${smtpTarget} (Original User: ${options.to})`);
      return true;
    } catch (err: any) {
      console.error("❌ [Gmail SMTP Transmission Error]:", err.message);
      throw err;
    }
  }

  return true;
}
