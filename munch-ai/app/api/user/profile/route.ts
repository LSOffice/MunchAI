import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "PATCH"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    await connectMongo();
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new APIError(404, "User not found", "NOT_FOUND");
    }
    return successResponse({
      id: String(user._id),
      name: user.name,
      email: user.email,
      dietaryRestrictions: user.dietaryRestrictions || [],
      allergies: user.allergies || [],
      cuisinePreferences: user.cuisinePreferences || [],
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    validateRequest("PATCH", ["GET", "PATCH"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const body = await request.json();
    await connectMongo();
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(body.name ? { name: body.name } : {}),
        ...(body.dietaryRestrictions
          ? { dietaryRestrictions: body.dietaryRestrictions }
          : {}),
        ...(body.allergies ? { allergies: body.allergies } : {}),
        ...(body.cuisinePreferences
          ? { cuisinePreferences: body.cuisinePreferences }
          : {}),
      },
      { new: true },
    ).lean();
    if (!updated) {
      throw new APIError(404, "User not found", "NOT_FOUND");
    }
    return successResponse({
      id: String(updated._id),
      name: updated.name,
      email: updated.email,
      dietaryRestrictions: updated.dietaryRestrictions || [],
      allergies: updated.allergies || [],
      cuisinePreferences: updated.cuisinePreferences || [],
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: new Date(updated.updatedAt).toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
