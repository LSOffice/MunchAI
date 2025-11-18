import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { Ingredient } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let results = db.ingredients.getAll();

    if (category) {
      results = results.filter((i) => i.category === category);
    }

    return successResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["GET", "POST"]);

    const body = await request.json();

    if (!body.name || !body.quantity || !body.unit) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: body.name,
      quantity: body.quantity,
      unit: body.unit,
      category: body.category || "other",
      expirationDate:
        body.expirationDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      dateAdded: new Date().toISOString(),
      imageUrl: body.imageUrl,
    };

    const ingredient = db.ingredients.create(newIngredient);
    return successResponse(ingredient, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
