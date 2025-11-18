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
    const ingredient = db.ingredients.getById(id);

    if (!ingredient) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }

    return successResponse(ingredient);
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

    const ingredient = db.ingredients.getById(id);
    if (!ingredient) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }

    const updated = db.ingredients.update(id, body);
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
    const success = db.ingredients.delete(id);

    if (!success) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
