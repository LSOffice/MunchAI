import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { db } from "@/lib/db";
import { Recipe } from "@/app/types";

const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Tomato Basil Pasta",
    description: "Fresh pasta with tomatoes, garlic, and basil",
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    difficulty: "easy",
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Tomatoes", quantity: 3, unit: "piece" },
    ],
    instructions: [
      "Cook pasta according to package directions",
      "Sauté tomatoes with garlic",
      "Mix pasta with tomatoes",
      "Serve with fresh basil",
    ],
    tags: ["Italian", "pasta", "vegetarian"],
    nutrition: { calories: 450, protein: 15, carbs: 65, fat: 8 },
    source: "verified",
    rating: 4.8,
    saved: false,
  },
  {
    id: "2",
    title: "Spinach and Cheese Pasta",
    description: "Creamy spinach pasta with melted cheese",
    servings: 2,
    prepTime: 5,
    cookTime: 15,
    difficulty: "easy",
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Spinach", quantity: 200, unit: "g" },
      { name: "Cheese", quantity: 100, unit: "g" },
    ],
    instructions: [
      "Cook pasta",
      "Sauté spinach",
      "Mix pasta with spinach and melted cheese",
      "Season to taste",
    ],
    tags: ["Italian", "pasta", "vegetarian"],
    nutrition: { calories: 520, protein: 20, carbs: 65, fat: 15 },
    source: "ai-generated",
    rating: 4.5,
    saved: false,
  },
  {
    id: "3",
    title: "Grilled Chicken with Tomato Salad",
    description: "Protein-packed meal with fresh vegetables",
    servings: 1,
    prepTime: 15,
    cookTime: 20,
    difficulty: "medium",
    ingredients: [
      { name: "Chicken Breast", quantity: 200, unit: "g" },
      { name: "Tomatoes", quantity: 2, unit: "piece" },
    ],
    instructions: [
      "Season and grill chicken",
      "Prepare tomato salad",
      "Plate together",
    ],
    tags: ["healthy", "protein", "gluten-free"],
    nutrition: { calories: 380, protein: 35, carbs: 15, fat: 12 },
    source: "verified",
    rating: 4.7,
    saved: false,
  },
];

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

    let results: Recipe[] = mockRecipes;

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
