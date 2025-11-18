import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { MealPlanEntry } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);

    const plans = db.mealPlans.getAll();
    return successResponse(plans);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["GET", "POST"]);

    const body = await request.json();

    if (!body.recipeId || !body.date || !body.mealType) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }

    const recipe = db.recipes.getById(body.recipeId);
    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    const entry: MealPlanEntry = {
      id: Date.now().toString(),
      recipeId: body.recipeId,
      recipe: recipe,
      date: body.date,
      mealType: body.mealType,
    };

    const created = db.mealPlans.create(entry);
    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
