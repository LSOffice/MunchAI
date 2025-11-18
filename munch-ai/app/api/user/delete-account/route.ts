import { NextRequest } from "next/server";
import { successResponse, errorResponse, APIError } from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }

    await connectMongo();

    // Delete user and all associated data
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new APIError(404, "User not found", "NOT_FOUND");
    }

    // Delete associated data (ingredients, recipes, saved recipes, meal plans)
    const { default: IngredientModel } = await import("@/models/Ingredient");
    const { default: SavedRecipeModel } = await import("@/models/SavedRecipe");
    const { default: MealPlanModel } = await import("@/models/MealPlan");

    await Promise.all([
      IngredientModel.deleteMany({ userId }),
      SavedRecipeModel.deleteMany({ userId }),
      MealPlanModel.deleteMany({ userId }),
    ]);

    return successResponse({ message: "Account deleted successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}
