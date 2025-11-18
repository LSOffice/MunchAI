import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import RecipeModel from "@/models/Recipe";
import { auth } from "@/lib/auth";

// GET /api/recipes/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("GET", ["GET", "PATCH", "DELETE"]);
    const { id } = await params;
    await connectMongo();
    const doc = await RecipeModel.findById(id).lean();
    if (!doc) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }
    return successResponse({
      id: String(doc._id),
      title: doc.title,
      description: doc.description,
      servings: doc.servings,
      prepTime: doc.prepTime,
      cookTime: doc.cookTime,
      difficulty: doc.difficulty,
      ingredients: doc.ingredients,
      instructions: doc.instructions,
      tags: doc.tags,
      nutrition: doc.nutrition,
      imageUrl: doc.imageUrl,
      featured: doc.featured,
      source: doc.source,
      rating: doc.rating,
      saved: false,
    });
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
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const { id } = await params;
    const body = await request.json();
    await connectMongo();
    const updated = await RecipeModel.findByIdAndUpdate(id, body, {
      new: true,
    }).lean();
    if (!updated) throw new APIError(404, "Recipe not found", "NOT_FOUND");
    return successResponse({
      id: String(updated._id),
      title: updated.title,
      description: updated.description,
      servings: updated.servings,
      prepTime: updated.prepTime,
      cookTime: updated.cookTime,
      difficulty: updated.difficulty,
      ingredients: updated.ingredients,
      instructions: updated.instructions,
      tags: updated.tags,
      nutrition: updated.nutrition,
      imageUrl: updated.imageUrl,
      featured: updated.featured,
      source: updated.source,
      rating: updated.rating,
      saved: false,
    });
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
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const { id } = await params;
    await connectMongo();
    const res = await RecipeModel.findByIdAndDelete(id);
    if (!res) throw new APIError(404, "Recipe not found", "NOT_FOUND");
    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
