"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Recipe, Ingredient, SavedRecipe, MealPlanEntry } from "@/app/types";
import { apiFetch } from "@/lib/utils";
import {
  ChefHat,
  ScanLine,
  Refrigerator,
  Search,
  Clock,
  TrendingUp,
  Heart,
  Calendar,
  ArrowRight,
  AlertCircle,
  Utensils,
} from "lucide-react";

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
      label: "In Stock",
      value: ingredients.length.toString(),
      icon: Refrigerator,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Saved Recipes",
      value: savedRecipes.length.toString(),
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: "Meals Planned",
      value: mealPlan.length.toString(),
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Expiring Soon",
      value: expiringCount.toString(),
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Welcome Back, <span className="text-orange-600">Chef!</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Here's what's happening in your kitchen today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-700 hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Utensils className="h-4 w-4" />
              Start Cooking
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Link
                  href="/scanner"
                  className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-orange-500/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-800 dark:hover:border-orange-500/50"
                >
                  <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                    <ScanLine className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Scan Receipt
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add ingredients via photo
                  </p>
                </Link>

                <Link
                  href="/inventory"
                  className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-orange-500/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-800 dark:hover:border-orange-500/50"
                >
                  <div className="mb-4 rounded-full bg-green-50 p-4 text-green-600 transition-colors group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                    <Refrigerator className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Inventory
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your pantry
                  </p>
                </Link>

                <Link
                  href="/recipes"
                  className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-orange-500/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-800 dark:hover:border-orange-500/50"
                >
                  <div className="mb-4 rounded-full bg-purple-50 p-4 text-purple-600 transition-colors group-hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Find Recipes
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Search with AI
                  </p>
                </Link>
              </div>
            </section>

            {/* Suggested Recipes */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Suggested for You
                </h2>
                <Link
                  href="/recipes"
                  className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {recentRecipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipes/${recipe.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-300 dark:bg-orange-900/20 dark:text-orange-800">
                          <ChefHat className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                        {recipe.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {recipe.description}
                      </p>
                      <div className="mt-auto pt-4 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {recipe.prepTime + recipe.cookTime} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Utensils className="h-3.5 w-3.5" />
                          {recipe.servings} servings
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Expiring Soon Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Expiring Soon
                </h2>
              </div>

              {expiringCount > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-900/10">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      You have{" "}
                      <span className="font-bold">{expiringCount}</span> items
                      expiring within 3 days.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {expiringIngredients.slice(0, 5).map((ing) => (
                      <li
                        key={ing.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {ing.name}
                        </span>
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {new Date(ing.expirationDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/inventory"
                    className="block w-full rounded-lg border border-gray-200 bg-white py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    View All Inventory
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-2 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    All Good!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nothing expiring soon.
                  </p>
                </div>
              )}
            </div>

            {/* Daily Tip or Mini Widget */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
              <div className="mb-4 flex items-center gap-2 opacity-90">
                <ChefHat className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Pro Tip
                </span>
              </div>
              <p className="mb-4 text-lg font-medium leading-relaxed">
                "Clean as you go! It makes the cooking process much less
                stressful and the food tastes better."
              </p>
              <div className="flex items-center gap-2 text-xs opacity-75">
                <span>— Chef Gordon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
