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
    const mealTypes =
      searchParams
        .get("mealTypes")
        ?.split(",")
        .filter((t) => t) || [];
    const source = searchParams.get("source");
    const minCookTime = searchParams.get("minCookTime");
    const maxCookTime = searchParams.get("maxCookTime");
    const maxTotalTime = searchParams.get("maxTotalTime");

    await connectMongo();
    const query: any = {};
    if (difficulty && difficulty !== "all") query.difficulty = difficulty;
    if (source) query.source = source;
    if (mealTypes.length > 0) {
      query.mealTypes = { $in: mealTypes };
    }

    // Handle cooking time filter
    if (minCookTime) {
      query.cookTime = { ...query.cookTime, $gte: parseInt(minCookTime) };
    }
    if (maxCookTime) {
      query.cookTime = { ...query.cookTime, $lte: parseInt(maxCookTime) };
    }

    // Handle total time filter (prepTime + cookTime)
    if (maxTotalTime) {
      const maxTotal = parseInt(maxTotalTime);
      // Use $expr to calculate total time on the fly
      query.$expr = {
        $lte: [{ $add: ["$prepTime", "$cookTime"] }, maxTotal],
      };
    }

    // Handle both ingredient names and tags
    if (tags.length) {
      query.$or = [
        { tags: { $in: tags } },
        { "ingredients.name": { $in: tags.map((t) => new RegExp(t, "i")) } },
      ];
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "ingredients.name": { $regex: q, $options: "i" } },
      ];
    }

    console.log("Recipe query:", JSON.stringify(query, null, 2));

    const docs = await RecipeModel.find(query).lean();
    const results = docs.map((d) => ({
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
      mealTypes: d.mealTypes,
      nutrition: d.nutrition,
      imageUrl: d.imageUrl,
      featured: d.featured,
      source: d.source,
      rating: d.rating,
      saved: false,
    }));
    return successResponse(results);
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

    if (!body.title || !body.ingredients || !body.instructions) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }

    await connectMongo();
    const created = await RecipeModel.create({
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
    });

    const recipe = {
      id: String(created._id),
      title: created.title,
      description: created.description,
      servings: created.servings,
      prepTime: created.prepTime,
      cookTime: created.cookTime,
      difficulty: created.difficulty,
      ingredients: created.ingredients,
      instructions: created.instructions,
      tags: created.tags,
      source: created.source,
      rating: created.rating,
      saved: false,
    };
    return successResponse(recipe, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
