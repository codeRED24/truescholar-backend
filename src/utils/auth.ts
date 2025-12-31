import { betterAuth } from "better-auth";
import { Pool } from "pg";
import {
  openAPI,
  phoneNumber,
  admin,
  emailOTP,
  oneTap,
} from "better-auth/plugins";
import { sendEmail } from "./email";

// Generate a unique custom code for referrals
function generateCustomCode(name: string): string {
  const cleanName = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName || "USER"}${randomPart}`;
}

// Create pool instance for manual queries
const pool = new Pool({
  connectionString: `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST_NEST}:5432/${process.env.DB_NAME}`,
});

export const auth = betterAuth({
  baseURL: process.env.BACKEND_URL || "http://localhost:8001",
  basePath: "/api/auth",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL || "",
    process.env.STAGING_FRONTEND_URL || "",
    process.env.DEV_FRONTEND_URL || "",
  ].filter(Boolean),
  database: pool,

  // Extend user schema with additional profile fields
  user: {
    additionalFields: {
      college_id: {
        type: "number",
        required: false,
        input: true,
      },
      user_type: {
        type: "string",
        required: false,
        input: true,
      },
      gender: {
        type: "string",
        required: false,
        input: true,
      },
      dob: {
        type: "date",
        required: false,
        input: true,
      },
      country_origin: {
        type: "string",
        required: false,
        input: true,
      },
      college_roll_number: {
        type: "string",
        required: false,
        input: true,
      },
      custom_code: {
        type: "string",
        required: false,
        input: false, // Auto-generated, not user input
      },
      referred_by: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    // Note: Email verification is handled manually via emailOTP plugin + app flow
    // Users will be redirected to OTP page after signup
    sendResetPassword: async ({ user, url, token }, request) => {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      await sendEmail(
        "Reset Your Password - TrueScholar",
        "reset-password",
        {
          name: user.name || "User",
          email: user.email,
          resetUrl: resetUrl,
          expiryHours: 1,
        },
        user.email
      );

      console.log(`*** Password reset email sent to ${user.email}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/api/auth/email-otp/send-verification-otp": { window: 60, max: 3 },
      "/api/auth/phone-number/send-otp": { window: 60, max: 3 },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwt",
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmail(
          type === "email-verification"
            ? "Verify Your Email - TrueScholar"
            : type === "forget-password"
              ? "Reset Password OTP - TrueScholar"
              : "Sign In OTP - TrueScholar",
          "email-verification",
          {
            name: "User",
            otp: otp,
            email: email,
          },
          email
        );
        console.log(`*** Email OTP ${otp} sent to ${email} (type: ${type})`);
      },
      otpLength: 6,
      expiresIn: 600,
    }),
    // Phone OTP plugin
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }, ctx) => {
        // TODO: Integrate with SMS provider (Twilio, MSG91, etc.)
        console.log(`*** Phone OTP ${code} sent to ${phone}`);

        // await sendEmail(...);
      },
    }),
    openAPI(),
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
    oneTap(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Generate unique custom_code for new users
          const customCode = generateCustomCode(user.name || "");
          console.log(`*** Generating custom_code ${customCode} for new user`);
          return {
            data: {
              ...user,
              custom_code: customCode,
            },
          };
        },
      },
    },
  },
});
