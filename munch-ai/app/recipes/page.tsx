"use client";

import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";
import { Recipe, Ingredient } from "../types";

// Updated mock featured recipes to match the Recipe interface

export default function RecipeSearch() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock inventory
  const availableIngredients: Ingredient[] = [
    {
      id: "1",
      name: "Tomatoes",
      quantity: 4,
      unit: "piece",
      category: "produce",
      expirationDate: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Spinach",
      quantity: 1,
      unit: "bunch",
      category: "produce",
      expirationDate: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Milk",
      quantity: 1,
      unit: "liter",
      category: "dairy",
      expirationDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Chicken Breast",
      quantity: 500,
      unit: "g",
      category: "meat",
      expirationDate: new Date(
        Date.now() + 1 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Olive Oil",
      quantity: 750,
      unit: "ml",
      category: "pantry",
      expirationDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Pasta",
      quantity: 500,
      unit: "g",
      category: "pantry",
      expirationDate: new Date(
        Date.now() + 200 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
    {
      id: "7",
      name: "Cheese",
      quantity: 200,
      unit: "g",
      category: "dairy",
      expirationDate: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      dateAdded: new Date().toISOString(),
    },
  ];

  const dietaryOptions = [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "nut-free",
  ];

  useEffect(() => {
    // Fetch featured recipes from the API
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/recipes/featured");
        const data = await res.json();
        if (mounted) setFeaturedRecipes(data.data || []);
      } catch (e) {
        console.error("Failed to load featured recipes:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();

      const allFilters = [...selectedIngredients, ...dietaryFilters];
      if (allFilters.length > 0) {
        params.append("tags", allFilters.join(","));
      }

      if (difficulty !== "all") {
        params.append("difficulty", difficulty);
      }

      const response = await fetch(`/api/recipes?${params.toString()}`);
      const data = await response.json();
      setRecipes(data.data || []);
    } catch (error) {
      console.error("Failed to search recipes:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((i) => i !== ingredientName)
        : [...prev, ingredientName],
    );
  };

  const toggleDietary = (option: string) => {
    setDietaryFilters((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const response = await fetch("/api/user/saved-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      // Optionally, update the local state to reflect the saved recipe
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, saved: true } : recipe,
        ),
      );
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Find Recipes 🔍
          </h1>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Select ingredients you'd like to cook with, and we'll find recipes
            for you.
          </p>
        </div>

        {/* Featured Recipes Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Featured Recipes
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSave={(id) => console.log("Save recipe:", id)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4 sm:space-y-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
              {/* Ingredients */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Select Ingredients
                </h3>
                <div className="space-y-2">
                  {availableIngredients.map((ing) => (
                    <label key={ing.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ing.name)}
                        onChange={() => toggleIngredient(ing.name)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {ing.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Difficulty
                </h3>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Dietary Options */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Dietary Preferences
                </h3>
                <div className="space-y-2">
                  {dietaryOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dietaryFilters.includes(option)}
                        onChange={() => toggleDietary(option)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600"
                      />
                      <span className="ml-2 text-xs sm:text-sm capitalize text-gray-700 dark:text-gray-300">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={selectedIngredients.length === 0}
                className="w-full rounded-lg bg-orange-500 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {isSearching ? "Searching..." : "Search Recipes"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {recipes.length > 0 ? (
              <div>
                <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Found {recipes.length} recipes matching your selection
                </p>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSave={(id) => console.log("Save recipe:", id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 text-5xl sm:text-6xl">🍳</div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedIngredients.length === 0
                    ? "Select ingredients to get started"
                    : "No recipes found"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {selectedIngredients.length === 0
                    ? "Choose ingredients from your inventory to see matching recipes"
                    : "Try selecting different ingredients or adjusting your filters"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
