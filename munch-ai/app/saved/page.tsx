"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RecipeCard from "../components/RecipeCard";
import { Recipe, SavedRecipe, MealPlanEntry } from "../types";
import { apiFetch } from "@/lib/utils";

export default function SavedRecipes() {
  const [activeTab, setActiveTab] = useState<"saved" | "mealplan">("saved");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedRes, mealRes] = await Promise.all([
          apiFetch("/api/user/saved-recipes"),
          apiFetch("/api/user/meal-plan"),
        ]);

        const [savedData, mealData] = await Promise.all([
          savedRes.json(),
          mealRes.json(),
        ]);

        setSavedRecipes(savedData.data || []);
        setMealPlan(mealData.data || []);
      } catch (error) {
        console.error("Failed to load saved recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRemoveSaved = async (recipeId: string) => {
    try {
      await apiFetch(`/api/user/saved-recipes/${recipeId}`, {
        method: "DELETE",
      });

      setSavedRecipes(savedRecipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("Failed to remove recipe:", error);
    }
  };

  const handleRemoveMealPlan = async (entryId: string) => {
    try {
      await fetch(`/api/user/meal-plan/${entryId}`, {
        method: "DELETE",
      });

      setMealPlan(mealPlan.filter((m) => m.id !== entryId));
    } catch (error) {
      console.error("Failed to remove meal plan entry:", error);
    }
  };

  const groupedMealPlan = mealPlan.reduce(
    (acc, entry) => {
      const date = new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, MealPlanEntry[]>,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Saved Recipes & Meal Plans ❤️
          </h1>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Manage your favorite recipes and plan your meals
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="flex gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-2 sm:pb-3 text-sm sm:text-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === "saved"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Saved Recipes ({savedRecipes.length})
            </button>
            <button
              onClick={() => setActiveTab("mealplan")}
              className={`pb-2 sm:pb-3 text-sm sm:text-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === "mealplan"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Meal Plan ({mealPlan.length})
            </button>
          </div>
        </div>

        {/* Saved Recipes Tab */}
        {activeTab === "saved" && (
          <div>
            {savedRecipes.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 text-5xl sm:text-6xl">❤️</div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  No saved recipes yet
                </h3>
                <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Explore recipes and save your favorites here
                </p>
                <Link
                  href="/recipes"
                  className="inline-block rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Find Recipes
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Meal Plan Tab */}
        {activeTab === "mealplan" && (
          <div>
            {Object.keys(groupedMealPlan).length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {Object.entries(groupedMealPlan).map(([date, entries]) => (
                  <div
                    key={date}
                    className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800"
                  >
                    <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {date}
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex flex-col sm:flex-row sm:items-start sm:justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 gap-2 sm:gap-3 dark:border-gray-700 dark:bg-gray-700/50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">
                              {entry.mealType}
                            </p>
                            <Link
                              href={`/recipes/${entry.recipeId}`}
                              className="mt-1 text-base sm:text-lg font-semibold text-gray-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400 break-words"
                            >
                              {entry.recipe.title}
                            </Link>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {entry.recipe.prepTime + entry.recipe.cookTime}{" "}
                              min • {entry.recipe.servings} servings
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveMealPlan(entry.id)}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add to Meal Plan Button */}
                <button className="w-full rounded-lg border-2 border-dashed border-gray-300 py-4 sm:py-6 text-center transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-900/10">
                  <span className="text-sm sm:text-lg font-semibold text-gray-600 dark:text-gray-400">
                    + Add Recipe to Meal Plan
                  </span>
                </button>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 text-5xl sm:text-6xl">📅</div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  No meals planned yet
                </h3>
                <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Add recipes to your meal plan to organize your week
                </p>
                <Link
                  href="/recipes"
                  className="inline-block rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Find Recipes
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
