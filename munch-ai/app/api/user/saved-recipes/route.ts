import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import RecipeModel from "@/models/Recipe";
import SavedRecipeModel from "@/models/SavedRecipe";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    await connectMongo();
    const docs = await SavedRecipeModel.find({ userId }).lean();
    const saved = docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      description: d.description,
      servings: d.servings,
      prepTime: d.prepTime,
      cookTime: d.cookTime,
      difficulty: d.difficulty,
      ingredients: d.ingredients,
      instructions: d.instructions,
      tags: d.tags,
      nutrition: d.nutrition,
      imageUrl: d.imageUrl,
      featured: d.featured,
      source: d.source,
      rating: d.rating,
      saved: true,
      savedAt: d.savedAt.toISOString(),
      notes: d.notes,
    }));
    return successResponse(saved);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["GET", "POST"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const body = await request.json();
    if (!body.id) {
      throw new APIError(400, "Recipe ID is required", "INVALID_REQUEST");
    }
    await connectMongo();
    const recipe = await RecipeModel.findById(body.id).lean();
    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }
    const doc = await SavedRecipeModel.create({
      userId,
      recipeId: recipe._id,
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      nutrition: recipe.nutrition,
      imageUrl: recipe.imageUrl,
      featured: recipe.featured,
      source: recipe.source,
      rating: recipe.rating,
      savedAt: new Date(),
      notes: body.notes || "",
    });
    return successResponse({ id: String(doc._id) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
