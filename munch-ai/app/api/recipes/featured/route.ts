import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateRequest } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import RecipeModel from "@/models/Recipe";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET"]);

    await connectMongo();
    const docs = await RecipeModel.find({
      $or: [{ featured: true }, { source: "verified" }],
    }).lean();
    const featured = docs.map((d) => ({
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
      saved: false,
    }));
    return successResponse(featured);
  } catch (error) {
    return errorResponse(error);
  }
}
