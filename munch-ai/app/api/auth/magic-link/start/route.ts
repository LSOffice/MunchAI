import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import MagicToken from "@/models/MagicToken";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "@/lib/mailer";
import { errorResponse, successResponse, APIError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || "").trim();
    if (!email) throw new APIError(400, "Email is required", "INVALID_REQUEST");

    await connectMongo();
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        email,
        name,
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
      });
    } else if (name && !existing.name) {
      existing.name = name;
      await existing.save();
    }

    // Rate limit: Check if a token was created for this email in the last 60 seconds
    const recentToken = await MagicToken.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentToken) {
      throw new APIError(
        429,
        "Please wait a minute before requesting another link",
        "RATE_LIMIT",
      );
    }

    const token = randomBytes(32).toString("hex");
    const requestId = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    const created = await MagicToken.create({
      token,
      email,
      requestId,
      purpose: "login",
      expiresAt,
    });

    const origin =
      req.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const link = `${origin}/api/auth/magic-link/verify?token=${token}`;
    await sendMagicLinkEmail(email, link);

    return successResponse({ sent: true, requestId });
  } catch (error) {
    return errorResponse(error);
  }
}
