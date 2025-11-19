import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import TempAccount from "@/models/TempAccount";
import MagicToken from "@/models/MagicToken";
import { SignJWT } from "jose";
import { getAuthSecret } from "@/lib/secrets";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      throw new APIError(
        400,
        "Token and email are required",
        "INVALID_REQUEST",
      );
    }

    await connectMongo();

    // Handle polling case - when user is on register page and temp account is deleted
    if (token === "verified") {
      // Check if user was already created
      const user = await User.findOne({ email });
      if (user) {
        // User already exists, just generate login token
        const secret = new TextEncoder().encode(getAuthSecret());
        const loginToken = await new SignJWT({ uid: String(user._id) })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(secret);

        return successResponse({
          message: "Email verified successfully.",
          verified: true,
          loginToken,
        });
      }

      // If no user yet, check for temp account to create one
      const tempAccount = await TempAccount.findOne({ email });
      if (tempAccount) {
        // Create permanent user account
        const newUser = await User.create({
          name: tempAccount.name,
          email: tempAccount.email,
          passkeys: [],
          dietaryRestrictions: [],
          allergies: [],
          cuisinePreferences: [],
        });

        // Generate JWT token for auto-login
        const secret = new TextEncoder().encode(getAuthSecret());
        const loginToken = await new SignJWT({ uid: String(newUser._id) })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(secret);

        // Delete temp account
        await TempAccount.deleteOne({ _id: tempAccount._id });

        return successResponse({
          message: "Email verified successfully.",
          verified: true,
          loginToken,
        });
      }

      throw new APIError(400, "No registration found", "NOT_FOUND");
    }

    // Verify token exists and is not expired
    const magicToken = await MagicToken.findOne({
      token,
      email,
      purpose: "email-verification",
    });

    if (!magicToken) {
      throw new APIError(400, "Invalid or expired token", "INVALID_TOKEN");
    }

    if (new Date() > magicToken.expiresAt) {
      await MagicToken.deleteOne({ _id: magicToken._id });
      throw new APIError(400, "Token has expired", "TOKEN_EXPIRED");
    }

    // Check temp account exists
    const tempAccount = await TempAccount.findOne({ email });
    if (!tempAccount) {
      throw new APIError(400, "Registration not found", "NOT_FOUND");
    }

    // Create permanent user account
    const user = await User.create({
      name: tempAccount.name,
      email: tempAccount.email,
      passkeys: [],
      dietaryRestrictions: [],
      allergies: [],
      cuisinePreferences: [],
    });

    // Generate JWT token for auto-login
    const secret = new TextEncoder().encode(getAuthSecret());
    const loginToken = await new SignJWT({ uid: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Delete temp account and token
    await Promise.all([
      TempAccount.deleteOne({ _id: tempAccount._id }),
      MagicToken.deleteOne({ _id: magicToken._id }),
    ]);

    return successResponse({
      message: "Email verified successfully.",
      verified: true,
      loginToken,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
