import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import MagicToken from "@/models/MagicToken";
import { errorResponse, successResponse, APIError } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    // Rate limit: 30 requests per 10 seconds per IP (allows for 2s polling interval + some buffer)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip, 30, 10000)) {
      throw new APIError(429, "Too many requests", "RATE_LIMIT");
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      throw new APIError(400, "Request ID is required", "INVALID_REQUEST");
    }

    await connectMongo();
    const magicToken = await MagicToken.findOne({ requestId });

    if (!magicToken) {
      throw new APIError(404, "Request not found", "NOT_FOUND");
    }

    if (new Date() > magicToken.expiresAt) {
      throw new APIError(400, "Request expired", "EXPIRED");
    }

    if (magicToken.usedAt) {
      // Token has been verified by the user clicking the link
      return successResponse({
        success: true,
        token: magicToken.token,
      });
    }

    // Still pending
    return successResponse({ pending: true });
  } catch (error) {
    return errorResponse(error);
  }
}
