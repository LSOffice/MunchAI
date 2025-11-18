import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { Recipe } from "@/app/types";

// GET /api/recipes/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("GET", ["GET", "PATCH", "DELETE"]);
    const { id } = await params;

    const recipe: Recipe | undefined = db?.recipes?.getById
      ? db.recipes.getById(id)
      : undefined;

    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    return successResponse(recipe);
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/recipes/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("PATCH", ["GET", "PATCH", "DELETE"]);
    const { id } = await params;
    const body = await request.json();

    if (!db?.recipes || typeof db.recipes.update !== "function") {
      throw new APIError(
        501,
        "Update not supported without DB",
        "NOT_IMPLEMENTED",
      );
    }

    const existing = db.recipes.getById(id);
    if (!existing) throw new APIError(404, "Recipe not found", "NOT_FOUND");

    const updated = db.recipes.update(id, body as Partial<Recipe>);
    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/recipes/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("DELETE", ["GET", "PATCH", "DELETE"]);
    const { id } = await params;

    if (!db?.recipes || typeof db.recipes.delete !== "function") {
      throw new APIError(
        501,
        "Delete not supported without DB",
        "NOT_IMPLEMENTED",
      );
    }

    const ok = db.recipes.delete(id);
    if (!ok) throw new APIError(404, "Recipe not found", "NOT_FOUND");

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
