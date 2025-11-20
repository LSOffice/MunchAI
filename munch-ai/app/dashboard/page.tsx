"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Recipe, Ingredient, SavedRecipe, MealPlanEntry } from "@/app/types";
import { apiFetch } from "@/lib/utils";

export default function Dashboard() {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featuredRes, ingredientsRes, savedRes, mealRes] =
          await Promise.all([
            apiFetch("/api/recipes/featured"),
            apiFetch("/api/ingredients"),
            apiFetch("/api/user/saved-recipes"),
            apiFetch("/api/user/meal-plan"),
          ]);

        const [featuredData, ingredientsData, savedData, mealData] =
          await Promise.all([
            featuredRes.json(),
            ingredientsRes.json(),
            savedRes.json(),
            mealRes.json(),
          ]);

        setRecentRecipes(featuredData.data || []);
        setIngredients(ingredientsData.data || []);
        setSavedRecipes(savedData.data || []);
        setMealPlan(mealData.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const expiringIngredients = ingredients.filter((ing) => {
    const daysLeft = Math.floor(
      (new Date(ing.expirationDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3 && daysLeft >= 0;
  });

  const expiringCount = expiringIngredients.length;

  const stats = [
    {
      label: "Ingredients in Stock",
      value: ingredients.length.toString(),
      icon: "📦",
    },
    {
      label: "Recipes Saved",
      value: savedRecipes.length.toString(),
      icon: "❤️",
    },
    { label: "Meals Planned", value: mealPlan.length.toString(), icon: "📅" },
    { label: "Expiring Soon", value: expiringCount.toString(), icon: "⏰" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Welcome Back, Chef! 👨‍🍳
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            Ready to cook something amazing with what you have?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="text-2xl sm:text-3xl">{stat.icon}</div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Link
              href="/scanner"
              className="group rounded-lg border-2 border-dashed border-gray-300 p-4 sm:p-6 text-center transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-900/10"
            >
              <div className="mb-2 text-3xl sm:text-4xl">📸</div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Scan Receipt
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Add ingredients to your inventory
              </p>
            </Link>

            <Link
              href="/inventory"
              className="group rounded-lg border-2 border-dashed border-gray-300 p-4 sm:p-6 text-center transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-900/10"
            >
              <div className="mb-2 text-3xl sm:text-4xl">🥦</div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                View Inventory
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage your ingredients
              </p>
            </Link>

            <Link
              href="/recipes"
              className="group rounded-lg border-2 border-dashed border-gray-300 p-4 sm:p-6 text-center transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-900/10"
            >
              <div className="mb-2 text-3xl sm:text-4xl">🍳</div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Find Recipes
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Search for recipes with AI
              </p>
            </Link>
          </div>
        </div>

        {/* Expiring Soon Alert */}
        {expiringCount > 0 && (
          <div className="mb-6 sm:mb-8 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3 sm:p-4 dark:bg-yellow-900/20">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 text-xl sm:text-2xl">⏰</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-yellow-800 dark:text-yellow-400">
                  {expiringCount} ingredient{expiringCount !== 1 ? "s" : ""}{" "}
                  expiring in the next 3 days
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  {expiringIngredients.map((ing) => ing.name).join(", ")} are
                  expiring soon. Try making a recipe with them!
                </p>
                <Link
                  href="/inventory"
                  className="mt-2 inline-block text-xs sm:text-sm font-semibold text-yellow-800 underline hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                  View inventory →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Suggested Recipes
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {recentRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800"
              >
                <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {recipe.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {recipe.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="flex-1 rounded bg-orange-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                      View Recipe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
