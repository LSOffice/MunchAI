import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";

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
