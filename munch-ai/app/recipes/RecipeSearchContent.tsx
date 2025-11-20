"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RecipeCard from "../components/RecipeCard";
import { Recipe, Ingredient } from "../types";
import { Slider } from "@/components/ui/slider";
import { apiFetch } from "@/lib/utils";

export default function RecipeSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToMealPlan = searchParams.get("addToMealPlan");
  const mealPlanDate = searchParams.get("date");
  const mealPlanType = searchParams.get("mealType");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergyFilters, setAllergyFilters] = useState<string[]>([]);
  const [cuisineFilters, setCuisineFilters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");
  const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
  const [mealTypeFilter, setMealTypeFilter] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  const dietaryOptions = [
    { id: "vegan", label: "vegan", emoji: "🌱" },
    { id: "vegetarian", label: "vegetarian", emoji: "🥗" },
    { id: "gluten-free", label: "gluten-free", emoji: "🌾" },
    { id: "dairy-free", label: "dairy-free", emoji: "🥛" },
    { id: "keto", label: "keto", emoji: "🥓" },
    { id: "paleo", label: "paleo", emoji: "🍖" },
  ];

  const allergyOptions = [
    { id: "peanuts", label: "peanuts", emoji: "🥜" },
    { id: "tree-nuts", label: "tree nuts", emoji: "🌳" },
    { id: "shellfish", label: "shellfish", emoji: "🦐" },
    { id: "fish", label: "fish", emoji: "🐟" },
    { id: "eggs", label: "eggs", emoji: "🥚" },
    { id: "dairy", label: "dairy", emoji: "🧀" },
    { id: "soy", label: "soy", emoji: "🫘" },
  ];

  const cuisineOptions = [
    { id: "italian", label: "italian", emoji: "🇮🇹" },
    { id: "asian", label: "asian", emoji: "🥢" },
    { id: "mediterranean", label: "mediterranean", emoji: "🫒" },
    { id: "mexican", label: "mexican", emoji: "🌮" },
    { id: "indian", label: "indian", emoji: "🍛" },
    { id: "thai", label: "thai", emoji: "🌶️" },
    { id: "greek", label: "greek", emoji: "🏛️" },
    { id: "american", label: "american", emoji: "🍔" },
  ];

  const mealTypeOptions = [
    { id: "breakfast", label: "breakfast", emoji: "🌅" },
    { id: "lunch", label: "lunch", emoji: "🍽️" },
    { id: "dinner", label: "dinner", emoji: "🍴" },
    { id: "snacks", label: "snacks", emoji: "🍿" },
  ];

  // Fetch user's ingredients, featured recipes, and preferences
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ingredientsRes, featuredRes, profileRes] = await Promise.all([
          apiFetch("/api/ingredients"),
          apiFetch("/api/recipes/featured"),
          apiFetch("/api/user/profile"),
        ]);

        const [ingredientsData, featuredData, profileData] = await Promise.all([
          ingredientsRes.json(),
          featuredRes.json(),
          profileRes.json().catch(() => ({ data: {} })),
        ]);

        if (mounted) {
          setUserIngredients(ingredientsData.data || []);
          setFeaturedRecipes(featuredData.data || []);

          // Auto-select and search by meal type if coming from meal plan
          if (mealPlanType) {
            setMealTypeFilter([mealPlanType]);
            setHasSearched(true);
          }

          setLoadingIngredients(false);
        }
      } catch (e) {
        console.error("Failed to load data:", e);
        if (mounted) setLoadingIngredients(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mealPlanType]);

  // Auto-search when coming from meal plan (trigger on hasSearched change)
  useEffect(() => {
    if (mealPlanType && hasSearched && mealTypeFilter.length > 0) {
      handleSearch();
    }
  }, [hasSearched]);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();

      const allFilters = [...selectedIngredients, ...dietaryFilters];
      if (allFilters.length > 0) {
        params.append("tags", allFilters.join(","));
      }

      if (difficulty !== "all") {
        params.append("difficulty", difficulty);
      }

      // Add meal type filter
      if (mealTypeFilter.length > 0) {
        params.append("mealTypes", mealTypeFilter.join(","));
      }

      // Add total time filter (prepTime + cookTime) based on slider
      params.append("maxTotalTime", maxCookingTime.toString());

      const response = await apiFetch(`/api/recipes?${params.toString()}`);
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

  const toggleAllergy = (option: string) => {
    setAllergyFilters((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const toggleCuisine = (option: string) => {
    setCuisineFilters((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const toggleMealType = (option: string) => {
    setMealTypeFilter((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const response = await apiFetch("/api/user/saved-recipes", {
        method: "POST",
        body: { recipeId },
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

  const handleAddToMealPlan = async (recipeId: string) => {
    try {
      if (!mealPlanDate || !mealPlanType) {
        console.error("Missing meal plan date or type:", {
          mealPlanDate,
          mealPlanType,
        });
        throw new Error("Missing meal plan date or type");
      }

      console.log("Adding to meal plan:", {
        date: mealPlanDate,
        mealType: mealPlanType,
        recipeId,
      });

      const response = await apiFetch("/api/user/meal-plan", {
        method: "POST",
        body: {
          date: mealPlanDate,
          mealType: mealPlanType,
          recipeId,
        },
      });

      console.log("Response status:", response.status, response.ok);

      if (!response.ok) {
        const responseText = await response.text();
        console.error(
          "Failed to add to meal plan. Status:",
          response.status,
          "Response:",
          responseText,
        );
        throw new Error(
          `Failed to add to meal plan (${response.status}): ${responseText}`,
        );
      }

      const data = await response.json();
      console.log("Successfully added to meal plan:", data);

      // Navigate back to meal plan
      router.push("/meal-plan");
    } catch (error) {
      console.error("Error adding to meal plan:", error);
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
            {featuredRecipes.map((recipe) => {
              const mealPlanParams = addToMealPlan
                ? `addToMealPlan=true&date=${mealPlanDate}&mealType=${mealPlanType}`
                : undefined;
              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mealPlanParams={mealPlanParams}
                  onSave={(id) => console.log("Save recipe:", id)}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="fixed bottom-0 left-0 right-0 top-20 z-40 overflow-y-auto space-y-4 sm:space-y-6 rounded-none border-t border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800 lg:static lg:top-auto lg:z-auto lg:bottom-auto lg:rounded-lg lg:border-t-0 lg:border">
              {/* Ingredients */}
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Based on your preferences
                </p>
                <div className="mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Select Ingredients
                  </h3>
                </div>
                {loadingIngredients ? (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Loading your ingredients...
                  </p>
                ) : userIngredients.length === 0 ? (
                  <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                    <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-400">
                      Add some ingredients!
                    </p>
                    <Link
                      href="/inventory"
                      className="mt-2 inline-block text-xs font-semibold text-orange-600 underline hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      Go to Inventory →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userIngredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => toggleIngredient(ing.name)}
                        className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                          selectedIngredients.includes(ing.name)
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {ing.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Difficulty
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "all levels", emoji: "🎯" },
                    { value: "easy", label: "easy", emoji: "😊" },
                    { value: "medium", label: "medium", emoji: "👍" },
                    { value: "hard", label: "hard", emoji: "🔥" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setDifficulty(level.value as any)}
                      className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                        difficulty === level.value
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{level.emoji}</span>
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Time */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Max Cooking Time ⏱️
                </h3>
                <div className="space-y-3">
                  <Slider
                    value={[maxCookingTime]}
                    onValueChange={(value) => setMaxCookingTime(value[0])}
                    min={10}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      10 min
                    </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {maxCookingTime === 120
                        ? "2 hours+"
                        : Math.floor(maxCookingTime / 60) > 0
                          ? `${Math.floor(maxCookingTime / 60)}h ${maxCookingTime % 60}m`
                          : `${maxCookingTime} min`}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      2 hours+
                    </span>
                  </div>
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Dietary Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleDietary(option.id)}
                      className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                        dietaryFilters.includes(option.id)
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Allergies to Avoid
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleAllergy(option.id)}
                      className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                        allergyFilters.includes(option.id)
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Preferred Cuisines
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleCuisine(option.id)}
                      className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                        cuisineFilters.includes(option.id)
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal of Day */}
              <div>
                <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Meal of Day
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mealTypeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleMealType(option.id)}
                      className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                        mealTypeFilter.includes(option.id)
                          ? "bg-yellow-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loadingIngredients}
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
                  {recipes.map((recipe) => {
                    const mealPlanParams = addToMealPlan
                      ? `addToMealPlan=true&date=${mealPlanDate}&mealType=${mealPlanType}`
                      : undefined;
                    return (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        mealPlanParams={mealPlanParams}
                        onAddToMealPlan={
                          addToMealPlan ? handleAddToMealPlan : undefined
                        }
                        onSave={
                          !addToMealPlan
                            ? (id) => console.log("Save recipe:", id)
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 text-5xl sm:text-6xl">
                  {!hasSearched ? "👋" : "🔍"}
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {!hasSearched ? "Get started searching" : "No recipes found"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {!hasSearched
                    ? "Select ingredients or preferences and click search to find recipes"
                    : "Try adjusting your filters and search again"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
