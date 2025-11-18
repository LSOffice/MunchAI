import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { UserProfile } from "@/app/types";

// Mock current user ID - in production, get from auth middleware
const CURRENT_USER_ID = "1";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "PATCH"]);

    const user = db.users.getById(CURRENT_USER_ID);

    if (!user) {
      throw new APIError(404, "User not found", "NOT_FOUND");
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    validateRequest("PATCH", ["GET", "PATCH"]);

    const body = await request.json();

    const user = db.users.getById(CURRENT_USER_ID);
    if (!user) {
      throw new APIError(404, "User not found", "NOT_FOUND");
    }

    const updated = db.users.update(CURRENT_USER_ID, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
