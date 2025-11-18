import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("GET", ["GET", "PATCH", "DELETE"]);

    const { id } = await params;
    const recipe = db.recipes.getById(id);

    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    return successResponse(recipe);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("PATCH", ["GET", "PATCH", "DELETE"]);

    const { id } = await params;
    const body = await request.json();

    const recipe = db.recipes.getById(id);
    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    const updated = db.recipes.update(id, body);
    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("DELETE", ["GET", "PATCH", "DELETE"]);

    const { id } = await params;
    const success = db.recipes.delete(id);

    if (!success) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
