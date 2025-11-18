"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { Recipe } from "@/app/types";

export default function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [servings, setServings] = useState(2);
  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        const data = await response.json();
        setRecipe(data.data);
        setServings(data.data?.servings || 2);
      } catch (error) {
        console.error("Failed to load recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleSave = async () => {
    if (!recipe) return;
    try {
      if (!isSaved) {
        await fetch("/api/user/saved-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...recipe, saved: true }),
        });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/recipes"
            className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-700"
          >
            ← Back to Recipes
          </Link>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recipe not found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  const scaleFactor = servings / (recipe.servings || 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/recipes"
          className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          ← Back to Recipes
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
              {recipe.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {recipe.description}
            </p>
          </div>

          {/* Recipe Badge */}
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            {recipe.source === "verified" && (
              <div className="mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-xl">✓</span>
                <span className="text-sm font-medium">Verified Recipe</span>
              </div>
            )}
            {recipe.rating && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recipe.rating}
                </span>
                <span className="text-2xl text-yellow-400">★</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="mb-8 h-96 w-full rounded-lg bg-gradient-to-br from-orange-400 to-orange-600"></div>

        {/* Info Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl">⏱️</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Prep Time
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {recipe.prepTime}m
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl">🍳</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Cook Time
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {recipe.cookTime}m
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl">👥</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Servings
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {servings}
              </span>
              <button
                onClick={() => setServings(servings + 1)}
                className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-800">
            <div className="text-2xl">📊</div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Difficulty
            </p>
            <p className="text-xl font-bold capitalize text-gray-900 dark:text-white">
              {recipe.difficulty}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                {recipe.ingredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between border-b border-gray-200 py-3 last:border-b-0 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ingredient.name}
                          {ingredient.optional && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              (optional)
                            </span>
                          )}
                        </p>
                        {ingredient.substitutions && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Can substitute with:{" "}
                            {ingredient.substitutions.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="ml-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {Math.round(ingredient.quantity * scaleFactor * 10) / 10}{" "}
                      {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
              <button
                onClick={handleSave}
                className={`w-full rounded-lg py-3 font-medium transition-colors ${
                  isSaved
                    ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {isSaved ? "♥ Saved" : "Save Recipe"}
              </button>

              <button className="w-full rounded-lg bg-orange-500 py-3 font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700">
                Add to Meal Plan
              </button>
            </div>

            {/* Rating */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Your Rating
              </h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`text-3xl transition-colors ${
                      star <= userRating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-700"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                  You rated this {userRating} star{userRating !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Nutrition (if available) */}
            {recipe.nutrition && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="w-full text-left font-semibold text-gray-900 dark:text-white"
                >
                  📊 Nutrition (per serving)
                </button>
                {showNutrition && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Calories
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(
                          (recipe.nutrition.calories / recipe.servings) *
                            servings,
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Protein
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(
                          (recipe.nutrition.protein / recipe.servings) *
                            servings,
                        )}
                        g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Carbs
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(
                          (recipe.nutrition.carbs / recipe.servings) * servings,
                        )}
                        g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Fat
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(
                          (recipe.nutrition.fat / recipe.servings) * servings,
                        )}
                        g
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
