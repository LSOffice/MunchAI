"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RecipeCard from "../components/RecipeCard";
import { SavedRecipe } from "../types";
import { apiFetch } from "@/lib/utils";

export default function SavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedRes = await apiFetch("/api/user/saved-recipes");
        const savedData = await savedRes.json();
        setSavedRecipes(savedData.data || []);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Saved Recipes ❤️
          </h1>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Your favorite recipes.{" "}
            <Link
              href="/meal-plan"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              Plan your meals →
            </Link>
          </p>
        </div>

        {/* Saved Recipes */}
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
    </div>
  );
}
