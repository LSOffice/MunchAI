import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import TempAccount from "@/models/TempAccount";
import MagicToken from "@/models/MagicToken";

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

    // Delete temp account and token
    await Promise.all([
      TempAccount.deleteOne({ _id: tempAccount._id }),
      MagicToken.deleteOne({ _id: magicToken._id }),
    ]);

    return successResponse({
      message: "Email verified successfully. You can now sign in.",
      verified: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
