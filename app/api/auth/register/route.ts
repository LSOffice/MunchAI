import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  APIError,
  validateRequest,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import TempAccount from "@/models/TempAccount";
import MagicToken from "@/models/MagicToken";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["POST"]);
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!name || !email) {
      throw new APIError(400, "Name and email are required", "INVALID_REQUEST");
    }

    await connectMongo();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError(400, "Email already registered", "EMAIL_EXISTS");
    }

    // Check if temp account already exists
    let tempAccount = await TempAccount.findOne({ email });
    if (tempAccount) {
      // Check if they can resend (60 second cooldown)
      const lastResend = tempAccount.lastResendTime
        ? new Date(tempAccount.lastResendTime).getTime()
        : 0;
      const now = Date.now();
      const secondsSinceLastResend = (now - lastResend) / 1000;

      if (secondsSinceLastResend < 60) {
        throw new APIError(
          429,
          `Please wait ${Math.ceil(60 - secondsSinceLastResend)} seconds before resending`,
          "RESEND_COOLDOWN",
        );
      }

      // Delete old temp account to create fresh one
      await TempAccount.deleteOne({ email });
    }

    // Create temp account with verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    tempAccount = await TempAccount.create({
      email,
      name,
      verificationToken,
      verificationTokenExpiry,
      resendAttempts: 0,
    });

    // Create magic token for email link
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await MagicToken.create({
      token,
      email,
      purpose: "email-verification",
      expiresAt,
    });

    // Build verification link to verification page instead of API
    const origin =
      request.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const link = `${origin}/verify?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMagicLinkEmail(email, link);

    return successResponse(
      {
        tempAccountId: String(tempAccount._id),
        email,
        sent: true,
        message: "Verification email sent. Please check your email.",
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
