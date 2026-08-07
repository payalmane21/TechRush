import { Resend } from "resend";
import nodemailer from "nodemailer";
import crypto from "crypto";

// In-Memory Token & OTP Store: Email -> { otp: string; token: string; expiresAt: number; lastSentAt: number }
interface VerificationEntry {
  otp: string;
  token: string;
  expiresAt: number;
  lastSentAt: number;
}

const verificationStore = new Map<string, VerificationEntry>();
const tokenToEmailMap = new Map<string, string>();

// Clean expired verification tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of verificationStore.entries()) {
    if (entry.expiresAt < now) {
      verificationStore.delete(email);
      tokenToEmailMap.delete(entry.token);
    }
  }
}, 5 * 60 * 1000);

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

// Backward compatibility helper alias
export function generateOtp(email: string): { otp: string; expiresAt: number } {
  const data = generateVerificationData(email);
  return { otp: data.otp, expiresAt: data.expiresAt };
}

/**
 * Verifies an OTP code or token strictly against stored credentials
 */
export function verifyOtpCode(email: string, inputOtpOrToken: string): boolean {
  const normEmail = email.toLowerCase().trim();
  const cleanInput = inputOtpOrToken.trim();

  let targetEmail = normEmail;
  // Check if input is a hex token
  if (cleanInput.length > 10 && tokenToEmailMap.has(cleanInput)) {
    targetEmail = tokenToEmailMap.get(cleanInput)!;
  }

  const entry = verificationStore.get(targetEmail);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    verificationStore.delete(targetEmail);
    tokenToEmailMap.delete(entry.token);
    return false;
  }

  if (entry.otp !== cleanInput && entry.token !== cleanInput) {
    return false;
  }

  // Verification succeeded—consume token & OTP
  verificationStore.delete(targetEmail);
  tokenToEmailMap.delete(entry.token);
  return true;
}

/**
 * Verifies a token directly
 */
export function verifyToken(token: string): { valid: boolean; email?: string; error?: string } {
  const cleanToken = token.trim();
  const email = tokenToEmailMap.get(cleanToken);

  if (!email) {
    return { valid: false, error: "Invalid verification link or token." };
  }

  const entry = verificationStore.get(email);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) {
      verificationStore.delete(email);
    }
    tokenToEmailMap.delete(cleanToken);
    return { valid: false, error: "Verification link has expired (valid for 10 minutes). Please request a new one." };
  }

  verificationStore.delete(email);
  tokenToEmailMap.delete(cleanToken);
  return { valid: true, email };
}

// Brand Styling
const MAROON = "#801B3B";
const MAROON_DARK = "#66152F";
const TEXT_DARK = "#1E293B";
const BG_LIGHT = "#F8FAFC";

function wrapEmailTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: ${BG_LIGHT}; color: ${TEXT_DARK}; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, ${MAROON} 0%, ${MAROON_DARK} 100%); padding: 32px 40px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; }
    .content { padding: 40px; }
    .otp-box { background: #f1f5f9; border: 2px dashed ${MAROON}; border-radius: 16px; padding: 20px; text-align: center; margin: 25px 0; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: ${MAROON}; font-family: monospace; }
    .btn { display: inline-block; background-color: ${MAROON}; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 20px; transition: background-color 0.2s; }
    .btn:hover { background-color: ${MAROON_DARK}; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; }
    .security-notice { background: #fffbe6; border-left: 4px solid #f59e0b; padding: 12px 16px; font-size: 12px; color: #92400e; border-radius: 8px; margin-top: 25px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 EventHub</h1>
      <p>Campus Activity & Volunteer Management System</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EventHub Portal. All rights reserved.<br>
      Support: <a href="mailto:support@eventhub.edu" style="color:${MAROON}">support@eventhub.edu</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderEmailVerificationTemplate(name: string, otp: string, verificationLink: string): string {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: ${TEXT_DARK}">Verify Your Email Address</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569">Hi <strong>${name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569">Thank you for registering on EventHub! Please use the 6-digit verification code below or click the button to activate your account. This link expires in <strong>10 minutes</strong>.</p>
    
    <div class="otp-box">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Verification Code</div>
      <div class="otp-code">${otp}</div>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address Now →</a>
    </div>

    <div class="security-notice">
      🔒 <strong>Security Notice:</strong> Never share this code or link with anyone. EventHub staff will never ask for your verification code.
    </div>
  `;
  return wrapEmailTemplate("Verify Your EventHub Account", content);
}

export function renderWelcomeEmailTemplate(name: string): string {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: ${TEXT_DARK}">Welcome to EventHub, ${name}! 🎉</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569">Your account has been successfully verified! You now have full access to campus events, hackathons, and volunteer opportunities.</p>
    
    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:5000/events" class="btn" target="_blank">Explore Campus Events →</a>
    </div>
  `;
  return wrapEmailTemplate("Welcome to EventHub", content);
}

export function renderPasswordResetTemplate(name: string, resetLink: string): string {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: ${TEXT_DARK}">Reset Your Password</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569">Hi <strong>${name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569">Click the button below to choose a new password for your EventHub account. This link will expire in <strong>15 minutes</strong>.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="btn" target="_blank">Reset Password Now →</a>
    </div>

    <div class="security-notice">
      ⚠️ If you did not request a password reset, you can safely ignore this email.
    </div>
  `;
  return wrapEmailTemplate("Reset Your EventHub Password", content);
}

/**
 * Universal Email Dispatcher supporting Hackathon Demo Mode
 * Controlled via EMAIL_DEMO_MODE=true and VERIFIED_DEMO_EMAIL=...
 */
export async function sendEmailNotification(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const isDemoMode = process.env.EMAIL_DEMO_MODE === "true" || process.env.EMAIL_DEMO_MODE === "1";
  const verifiedDemoEmail = process.env.VERIFIED_DEMO_EMAIL || "payalmane2107@gmail.com";

  // In Demo Mode, redirect email delivery destination to the verified demo inbox
  const destinationEmail = isDemoMode ? verifiedDemoEmail : options.to;

  let finalHtml = options.html;
  let finalSubject = options.subject;

  if (isDemoMode && options.to.toLowerCase() !== destinationEmail.toLowerCase()) {
    finalSubject = `[Demo Redirect for ${options.to}] ${options.subject}`;
    const demoBanner = `
      <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-family: 'Inter', sans-serif;">
        <div style="font-size: 14px; font-weight: 800; color: #1e40af; margin-bottom: 6px;">💡 Hackathon Demo Mode Active</div>
        <div style="font-size: 13px; color: #1e3a8a; line-height: 1.6;">
          This verification email was redirected to your verified demo inbox (<code>${destinationEmail}</code>).<br>
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

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [destinationEmail],
        subject: finalSubject,
        html: finalHtml,
      });

      if (!error && data?.id) {
        console.log(`📧 [Resend API - Demo Mode: ${isDemoMode}] Delivered real email to ${destinationEmail} (Original User: ${options.to}, ID: ${data.id})`);
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

      await transporter.sendMail({
        from: `"EventHub Verification" <${emailUser}>`,
        to: destinationEmail,
        subject: finalSubject,
        html: finalHtml,
      });

      console.log(`📧 [Gmail SMTP - Demo Mode: ${isDemoMode}] Delivered real email to ${destinationEmail} (Original User: ${options.to})`);
      return true;
    } catch (err: any) {
      console.error("❌ [Gmail SMTP Transmission Error]:", err.message);
      throw err;
    }
  }

  throw new Error(
    "Real email provider credentials missing in .env. Please set RESEND_API_KEY or EMAIL_USER & EMAIL_PASS."
  );
}
