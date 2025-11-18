import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import MealPlanModel from "@/models/MealPlan";
import RecipeModel from "@/models/Recipe";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    await connectMongo();
    const docs = await MealPlanModel.find({ userId }).lean();
    // Optionally populate recipe details
    const ids = docs.map((d) => d.recipeId);
    const recipes = await RecipeModel.find({ _id: { $in: ids } }).lean();
    const byId = new Map(recipes.map((r) => [String(r._id), r]));
    const plans = docs.map((d) => ({
      id: String(d._id),
      recipeId: String(d.recipeId),
      recipe: (() => {
        const r = byId.get(String(d.recipeId));
        return r
          ? {
              id: String(r._id),
              title: r.title,
              description: r.description,
              servings: r.servings,
              prepTime: r.prepTime,
              cookTime: r.cookTime,
              difficulty: r.difficulty,
              ingredients: r.ingredients,
              instructions: r.instructions,
              tags: r.tags,
              nutrition: r.nutrition,
              imageUrl: r.imageUrl,
              featured: r.featured,
              source: r.source,
              rating: r.rating,
              saved: false,
            }
          : (null as any);
      })(),
      date: d.date.toISOString(),
      mealType: d.mealType,
    }));
    return successResponse(plans);
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

    if (!body.recipeId || !body.date || !body.mealType) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }
    await connectMongo();
    const recipe = await RecipeModel.findById(body.recipeId).lean();
    if (!recipe) {
      throw new APIError(404, "Recipe not found", "NOT_FOUND");
    }
    const created = await MealPlanModel.create({
      userId,
      recipeId: recipe._id,
      date: new Date(body.date),
      mealType: body.mealType,
    });
    return successResponse({ id: String(created._id) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
