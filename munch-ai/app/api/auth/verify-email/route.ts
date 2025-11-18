import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import TempAccount from "@/models/TempAccount";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      throw new APIError(400, "Email is required", "INVALID_REQUEST");
    }

    await connectMongo();

    // Check if temp account still exists (verification not completed)
    const tempAccount = await TempAccount.findOne({ email });

    return successResponse({
      verified: !tempAccount, // If temp account doesn't exist, verification is complete
      email,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw new APIError(400, "Email is required", "INVALID_REQUEST");
    }

    await connectMongo();
    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new APIError(
        404,
        "Email not found. Please sign up first.",
        "USER_NOT_FOUND",
      );
    }

    // Check if user has any passkeys registered
    const hasPasskey = (user.passkeys && user.passkeys.length > 0) || false;

    return successResponse({
      email: user.email,
      hasPasskey,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
