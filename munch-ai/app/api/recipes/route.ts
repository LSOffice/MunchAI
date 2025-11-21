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
    const cuisines =
      searchParams
        .get("cuisines")
        ?.split(",")
        .filter((c) => c) || [];
    const source = searchParams.get("source");
    const minCookTime = searchParams.get("minCookTime");
    const maxCookTime = searchParams.get("maxCookTime");
    const maxTotalTime = searchParams.get("maxTotalTime");

    await connectMongo();
    const query: any = {};
    const orConditions: any[] = [];

    if (difficulty && difficulty !== "all") query.difficulty = difficulty;
    if (source) query.source = source;
    if (mealTypes.length > 0) {
      query.mealTypes = { $in: mealTypes };
    }
    if (cuisines.length > 0) {
      query.tags = { $in: cuisines.map((c) => new RegExp(c, "i")) };
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
      orConditions.push(
        { tags: { $in: tags } },
        { "ingredients.name": { $in: tags.map((t) => new RegExp(t, "i")) } },
      );
    }

    if (q) {
      orConditions.push(
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "ingredients.name": { $regex: q, $options: "i" } },
      );
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    console.log("Recipe query:", JSON.stringify(query, null, 2));

    const docs = await RecipeModel.find(query).lean();

    // Score and sort recipes based on filter matches and user preferences
    const scoredRecipes = docs.map((d) => {
      let score = 0;

      // Base score from rating (higher rated recipes score higher)
      score += (d.rating || 0) * 10;

      // Bonus for exact difficulty match
      if (difficulty && difficulty !== "all" && d.difficulty === difficulty) {
        score += 50;
      }

      // Bonus for each tag that matches user filters
      tags.forEach((tag) => {
        if (
          d.tags.some((dTag: any) =>
            dTag.toLowerCase().includes(tag.toLowerCase()),
          )
        ) {
          score += 30;
        }
        if (
          d.ingredients.some((ing: any) =>
            ing.name.toLowerCase().includes(tag.toLowerCase()),
          )
        ) {
          score += 20;
        }
      });

      // Bonus for meal type match
      if (mealTypes.length > 0) {
        const mealTypeMatches = d.mealTypes.filter((mt: any) =>
          mealTypes.includes(mt),
        ).length;
        score += mealTypeMatches * 40;
      }

      // Bonus for source (verified recipes score higher)
      if (d.source === "verified") {
        score += 15;
      }

      // Slight bonus for featured recipes
      if (d.featured) {
        score += 5;
      }

      return { recipe: d, score };
    });

    // Sort by score descending (highest first), then by rating
    scoredRecipes.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.recipe.rating || 0) - (a.recipe.rating || 0);
    });

    const results = scoredRecipes.map(({ recipe: d }) => ({
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
