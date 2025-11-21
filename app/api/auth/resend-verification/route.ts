import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import TempAccount from "@/models/TempAccount";
import MagicToken from "@/models/MagicToken";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw new APIError(400, "Email is required", "INVALID_REQUEST");
    }

    await connectMongo();

    // Check temp account exists
    const tempAccount = await TempAccount.findOne({ email });
    if (!tempAccount) {
      throw new APIError(400, "Registration not found", "NOT_FOUND");
    }

    // Check cooldown (60 seconds)
    const lastResend = tempAccount.lastResendTime
      ? new Date(tempAccount.lastResendTime).getTime()
      : 0;
    const now = Date.now();
    const secondsSinceLastResend = (now - lastResend) / 1000;

    if (secondsSinceLastResend < 60) {
      return successResponse({
        sent: false,
        message: `Please wait ${Math.ceil(60 - secondsSinceLastResend)} seconds before resending`,
        remainingSeconds: Math.ceil(60 - secondsSinceLastResend),
      });
    }

    // Create new magic token for email link
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await MagicToken.create({
      token,
      email,
      purpose: "email-verification",
      expiresAt,
    });

    // Update last resend time
    tempAccount.lastResendTime = new Date();
    tempAccount.resendAttempts = (tempAccount.resendAttempts || 0) + 1;
    await tempAccount.save();

    // Build verification link
    const origin =
      request.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const link = `${origin}/api/auth/verify-registration?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMagicLinkEmail(email, link);

    return successResponse({
      sent: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
