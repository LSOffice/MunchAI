import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateRequest } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import RecipeModel from "@/models/Recipe";
import UserModel from "@/models/User";

// Determine meal type based on time of day
function getMealType(): "breakfast" | "lunch" | "dinner" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "breakfast";
  if (hour >= 12 && hour < 17) return "lunch";
  return "dinner";
}

// Get tags for the current meal type
function getMealTypeTags(mealType: "breakfast" | "lunch" | "dinner"): string[] {
  const tagMap = {
    breakfast: ["breakfast", "brunch", "morning"],
    lunch: ["lunch", "salad", "sandwich"],
    dinner: ["dinner", "main course", "pasta"],
  };
  return tagMap[mealType];
}

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET"]);

    await connectMongo();

    // Get user session and preferences
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;

    let userPreferences = {
      cuisinePreferences: [] as string[],
      dietaryRestrictions: [] as string[],
      allergies: [] as string[],
    };

    if (userId) {
      const user = (await UserModel.findById(userId).lean()) as any;
      if (user) {
        userPreferences = {
          cuisinePreferences: user.cuisinePreferences || [],
          dietaryRestrictions: user.dietaryRestrictions || [],
          allergies: user.allergies || [],
        };
      }
    }

    // Get current meal type
    const mealType = getMealType();
    const mealTypeTags = getMealTypeTags(mealType);

    // Build query to find matching recipes
    const query: any = {
      $or: [{ featured: true }, { source: "verified" }],
    };

    // Filter by dietary restrictions and allergies if user has preferences
    if (userPreferences.dietaryRestrictions.length > 0) {
      // Exclude recipes with tags matching allergies
      query.tags = {
        $nin: userPreferences.allergies.map((a) => a.toLowerCase()),
      };
    }

    // Get all potential recipes
    let recipes = await RecipeModel.find(query).lean();

    // Score and sort recipes based on user preferences
    const scoredRecipes = recipes
      .map((recipe: any) => {
        let score = 0;

        // Prefer recipes matching meal type (higher weight)
        if (
          mealTypeTags.some((tag) =>
            recipe.tags.some((t: string) => t.toLowerCase().includes(tag)),
          )
        ) {
          score += 30;
        }

        // Prefer recipes with user's favorite cuisines
        if (userPreferences.cuisinePreferences.length > 0) {
          const cuisineMatch = userPreferences.cuisinePreferences.some(
            (cuisine) =>
              recipe.tags.some((tag: string) =>
                tag.toLowerCase().includes(cuisine.toLowerCase()),
              ),
          );
          if (cuisineMatch) score += 20;
        }

        // Prefer recipes matching dietary restrictions
        if (userPreferences.dietaryRestrictions.length > 0) {
          const dietaryMatch = userPreferences.dietaryRestrictions.some(
            (diet) =>
              recipe.tags.some((tag: string) =>
                tag.toLowerCase().includes(diet.toLowerCase()),
              ),
          );
          if (dietaryMatch) score += 15;
        }

        // Prefer recipes with higher ratings
        score += (recipe.rating || 0) * 2;

        // Prefer verified recipes
        if (recipe.source === "verified") score += 10;

        return {
          ...recipe,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Limit to 3 recipes

    const featured = scoredRecipes.map((d: any) => ({
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
