import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { SavedRecipe } from "@/app/types";

// Mock current user ID - in production, get from auth middleware
const CURRENT_USER_ID = "1";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);

    const saved = db.savedRecipes.getAll();
    return successResponse(saved);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["GET", "POST"]);

    const body = await request.json();

    if (!body.id) {
      throw new APIError(400, "Recipe ID is required", "INVALID_REQUEST");
    }

    const recipe = db.recipes.getById(body.id);
    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    const savedRecipe: SavedRecipe = {
      ...recipe,
      savedAt: new Date().toISOString(),
      notes: body.notes || "",
    };

    const saved = db.savedRecipes.create(savedRecipe);
    return successResponse(saved, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
