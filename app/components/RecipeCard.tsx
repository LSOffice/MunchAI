"use client";

import Link from "next/link";
import Image from "next/image";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipeId: string) => void;
  onRate?: (recipeId: string, rating: number) => void;
  onAddToMealPlan?: (recipeId: string) => void;
  mealPlanParams?: string;
}

export default function RecipeCard({
  recipe,
  onSave,
  onRate,
  onAddToMealPlan,
  mealPlanParams,
}: RecipeCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Image */}
      {recipe.imageUrl && (
        <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold text-gray-900 dark:bg-gray-900/90 dark:text-white">
            {recipe.difficulty}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-4">
        <Link
          href={`/recipes/${recipe.id}${mealPlanParams ? `?${mealPlanParams}` : ""}`}
        >
          <h3 className="mb-2 text-sm sm:text-lg font-semibold text-gray-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400 line-clamp-2">
            {recipe.title}
          </h3>
        </Link>

        <p className="mb-2 sm:mb-3 line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {recipe.description}
        </p>

        {/* Metadata */}
        <div className="mb-2 sm:mb-3 flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{recipe.prepTime + recipe.cookTime} min</span>
          <span>•</span>
          <span>{recipe.servings} servings</span>
          {recipe.source === "verified" && (
            <>
              <span>•</span>
              <span className="text-green-600 dark:text-green-400">
                ✓ Verified
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mb-2 sm:mb-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 sm:pt-3 dark:border-gray-800">
          <div className="flex items-center gap-1">
            {recipe.rating && (
              <>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {recipe.rating.toFixed(1)}
                </span>
                <span className="text-yellow-400">★</span>
              </>
            )}
          </div>

          <div className="flex gap-1 sm:gap-2">
            {onAddToMealPlan ? (
              <button
                onClick={() => onAddToMealPlan(recipe.id)}
                className="rounded bg-orange-500 px-2 sm:px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                Add to Meal
              </button>
            ) : (
              <>
                {onSave && (
                  <button
                    onClick={() => onSave(recipe.id)}
                    className={`rounded px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors ${
                      recipe.saved
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {recipe.saved ? "♥" : "Save"}
                  </button>
                )}
                <Link
                  href={`/recipes/${recipe.id}${mealPlanParams ? `?${mealPlanParams}` : ""}`}
                  className="rounded bg-orange-500 px-2 sm:px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  View
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
