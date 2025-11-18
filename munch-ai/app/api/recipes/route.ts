import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { Recipe } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const difficulty = searchParams.get("difficulty");
    const tags =
      searchParams
        .get("tags")
        ?.split(",")
        .filter((t) => t) || [];
    const source = searchParams.get("source");

    let results: Recipe[] = db?.recipes?.getAll ? db.recipes.getAll() : [];

    // Filter by search query
    if (q) {
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q.toLowerCase()) ||
          r.description.toLowerCase().includes(q.toLowerCase()),
      );
    }

    // Filter by difficulty
    if (difficulty && difficulty !== "all") {
      results = results.filter((r) => r.difficulty === difficulty);
    }

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter((recipe) => {
        const recipeTags = recipe.tags.map((t) => t.toLowerCase());
        const ingredientNames = recipe.ingredients.map((i) =>
          i.name.toLowerCase(),
        );
        const searchableItems = new Set([...recipeTags, ...ingredientNames]);
        return tags.every((tag) => searchableItems.has(tag.toLowerCase()));
      });
    }

    // Filter by source
    if (source) {
      results = results.filter((r) => r.source === source);
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

    if (!body.title || !body.ingredients || !body.instructions) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description || "",
      servings: body.servings || 2,
      prepTime: body.prepTime || 0,
      cookTime: body.cookTime || 0,
      difficulty: body.difficulty || "medium",
      ingredients: body.ingredients,
      instructions: body.instructions,
      tags: body.tags || [],
      source: body.source || "ai-generated",
      rating: 0,
      saved: false,
    };

    const recipe = db.recipes.create(newRecipe);
    return successResponse(recipe, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
