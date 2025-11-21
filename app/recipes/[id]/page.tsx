"use client";

import { useState, use, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@/app/types";
import { apiFetch } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export default function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const addToMealPlan = searchParams.get("addToMealPlan");
  const mealPlanDate = searchParams.get("date");
  const mealPlanType = searchParams.get("mealType");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [servings, setServings] = useState(2);
  const [showNutrition, setShowNutrition] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [activeTimer, setActiveTimer] = useState<{
    stepIndex: number;
    timeLeft: number;
    isRunning: boolean;
    isMinimized: boolean;
  } | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStep, setCompletedStep] = useState<number | null>(null);

  // Load progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`recipe-progress-${id}`);
    if (savedProgress) {
      const progress = parseInt(savedProgress);
      setCompletedStep(progress);
      setCurrentStep(progress);
    }
  }, [id]);

  // Save progress when currentStep changes in presentation mode
  useEffect(() => {
    if (presentationMode && recipe) {
      localStorage.setItem(`recipe-progress-${id}`, String(currentStep));
      if (completedStep === null || currentStep > completedStep) {
        setCompletedStep(currentStep);
      }
    }
  }, [currentStep, presentationMode, id, recipe, completedStep]);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const response = await apiFetch(`/api/recipes/${id}`);
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
        await apiFetch("/api/user/saved-recipes", {
          method: "POST",
          body: { ...recipe, saved: true },
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

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  // Extract cooking time from instruction text
  const extractCookingTime = (instruction: string): number | null => {
    // Match patterns like "8-10 mins", "15 minutes", "5 min", "30 seconds", "30 secs", etc.
    const timePatterns = [
      /(\d+)\s*-\s*(\d+)\s*(?:mins?|minutes?)/i,
      /(\d+)\s*(?:mins?|minutes?)/i,
      /(\d+)\s*-\s*(\d+)\s*(?:secs?|seconds?)/i,
      /(\d+)\s*(?:secs?|seconds?)/i,
    ];

    for (const pattern of timePatterns) {
      const match = instruction.match(pattern);
      if (match) {
        if (match[2]) {
          // For ranges like "8-10", take the lower number
          const timeValue = parseInt(match[1]);
          // If it's seconds pattern, return as-is; if minutes, convert to seconds
          return pattern.source.includes("secs?|seconds?")
            ? timeValue
            : timeValue * 60;
        } else {
          // For single numbers
          const timeValue = parseInt(match[1]);
          // If it's seconds pattern, return as-is; if minutes, convert to seconds
          return pattern.source.includes("secs?|seconds?")
            ? timeValue
            : timeValue * 60;
        }
      }
    }
    return null;
  };

  // Handle timer click
  const handleStartTimer = (stepIndex: number) => {
    const instruction = recipe?.instructions[stepIndex];
    if (!instruction) return;

    const timeInSeconds = extractCookingTime(instruction);
    if (!timeInSeconds) return;

    setActiveTimer({
      stepIndex,
      timeLeft: timeInSeconds,
      isRunning: true,
      isMinimized: false,
    });
  };

  // Timer effect
  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          // Timer finished
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddToMealPlan = async () => {
    if (!recipe) return;

    // If no meal plan filters, redirect to meal plan page and let user choose
    if (!mealPlanDate || !mealPlanType) {
      // Store recipe info in sessionStorage to access on meal plan page
      sessionStorage.setItem(
        "pendingRecipe",
        JSON.stringify({
          id: recipe.id,
          title: recipe.title,
        }),
      );
      router.push("/meal-plan");
      return;
    }

    // Otherwise add directly
    try {
      await apiFetch("/api/user/meal-plan", {
        method: "POST",
        body: {
          date: mealPlanDate,
          mealType: mealPlanType,
          recipeId: id,
        },
      });
      router.push("/meal-plan");
    } catch (error) {
      console.error("Failed to add to meal plan:", error);
    }
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
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Back Button */}
        <Link
          href="/recipes"
          className="mb-6 inline-flex items-center text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          ← Back to Recipes
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-1 sm:gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-orange-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {recipe.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              {recipe.description}
            </p>
          </div>

          {/* Recipe Badge */}
          <div className="flex-shrink-0 rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-gray-800">
            {recipe.source === "verified" && (
              <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
                <span className="text-lg sm:text-xl">✓</span>
                <span className="font-medium">Verified Recipe</span>
              </div>
            )}
            {recipe.rating && (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {recipe.rating.toFixed(1)}
                </span>
                <span className="text-xl sm:text-2xl text-yellow-400">★</span>
              </div>
            )}
          </div>
        </div>

        {/* Image and Info Split */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 lg:h-auto">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                <span className="text-4xl">🍳</span>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-2 text-2xl">⏱️</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prep Time
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {recipe.prepTime}m
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-2 text-2xl">🍳</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cook Time
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {recipe.cookTime}m
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-2 text-2xl">👥</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Servings
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {servings}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="mb-2 text-2xl">🎯</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Difficulty
              </p>
              <p className="text-xl font-bold capitalize text-gray-900 dark:text-white">
                {recipe.difficulty}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Ingredients */}
            <section>
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <div className="space-y-2 sm:space-y-3 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
                {recipe.ingredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between border-b border-gray-200 py-2 sm:py-3 last:border-b-0 dark:border-gray-700 gap-2 px-3 sm:px-4 -mx-3 sm:-mx-4 transition-colors ${
                      checkedIngredients.has(idx)
                        ? "bg-green-50 dark:bg-green-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.has(idx)}
                        onChange={() => toggleIngredient(idx)}
                        className="mt-0.5 sm:mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-green-600 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs sm:text-sm font-medium break-words transition-all ${
                            checkedIngredients.has(idx)
                              ? "line-through text-green-600 dark:text-green-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {ingredient.name}
                          {ingredient.optional && (
                            <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400">
                              (optional)
                            </span>
                          )}
                        </p>
                        {ingredient.substitutions && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Can substitute with:{" "}
                            {ingredient.substitutions.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`ml-2 flex-shrink-0 whitespace-nowrap text-xs sm:text-sm transition-all ${
                        checkedIngredients.has(idx)
                          ? "line-through text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {Math.round(ingredient.quantity * scaleFactor * 10) / 10}{" "}
                      {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <section>
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Instructions
                </h2>
                <button
                  onClick={() => {
                    setPresentationMode(true);
                    if (completedStep !== null) {
                      setCurrentStep(completedStep);
                    } else {
                      setCurrentStep(0);
                    }
                  }}
                  className="rounded-lg bg-green-500 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {completedStep !== null ? "▶ Continue" : "▶ Start"}
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recipe.instructions.map((instruction, idx) => {
                  const cookingTime = extractCookingTime(instruction);
                  const isCompleted =
                    completedStep !== null && idx <= completedStep;

                  return (
                    <div
                      key={idx}
                      className={`group flex gap-2 sm:gap-4 rounded-lg p-2 sm:p-3 transition-colors ${
                        isCompleted
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`flex h-7 sm:h-8 w-7 sm:w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-400">
                            ✓
                          </span>
                        ) : (
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isCompleted
                                ? "text-green-700 dark:text-green-400"
                                : "text-orange-700 dark:text-orange-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs sm:text-base pt-0.5 ${
                            isCompleted
                              ? "line-through text-gray-500 dark:text-gray-500"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {instruction}
                        </p>
                      </div>
                      {cookingTime && (
                        <button
                          onClick={() => handleStartTimer(idx)}
                          className="ml-2 flex-shrink-0 rounded-lg bg-orange-100 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-orange-700 opacity-0 transition-all hover:bg-orange-200 group-hover:opacity-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                          title={`Start ${formatTime(cookingTime)} timer`}
                        >
                          ⏱️ {formatTime(cookingTime)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            {/* Actions */}
            <div className="space-y-2 sm:space-y-3 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
              <button
                onClick={handleSave}
                className={`w-full rounded-lg py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  isSaved
                    ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {isSaved ? "♥ Saved" : "Save Recipe"}
              </button>

              <button
                onClick={handleAddToMealPlan}
                className="w-full rounded-lg bg-orange-500 py-2 text-white transition-colors hover:bg-orange-600 sm:py-3 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                Add to Meal Plan
              </button>
            </div>

            {/* Rating */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Your Rating
              </h3>
              <div className="flex justify-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`text-xl sm:text-3xl transition-colors ${
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
                <p className="mt-2 sm:mt-3 text-center text-xs text-gray-600 dark:text-gray-400">
                  You rated this {userRating} star{userRating !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Nutrition (if available) */}
            {recipe.nutrition && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="w-full text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white"
                >
                  📊 Nutrition (per serving)
                </button>
                {showNutrition && (
                  <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Calories
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
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
                      <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
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
                      <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
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
                      <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
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

        {/* Timer Dialog */}
        {activeTimer && (
          <>
            {/* Dialog */}
            <Dialog
              open={!activeTimer.isMinimized}
              onOpenChange={(open) => {
                if (!open) {
                  setActiveTimer({
                    ...activeTimer,
                    isMinimized: true,
                  });
                }
              }}
            >
              <DialogContent className="sm:max-w-md">
                <DialogTitle className="flex items-center justify-between">
                  <span>Step {activeTimer.stepIndex + 1} Timer</span>
                  <button
                    onClick={() => setActiveTimer(null)}
                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </DialogTitle>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl font-bold text-orange-600 dark:text-orange-400 font-mono mb-4">
                    {formatTime(activeTimer.timeLeft)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                    {recipe?.instructions[activeTimer.stepIndex]}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        setActiveTimer({
                          ...activeTimer,
                          isRunning: !activeTimer.isRunning,
                        })
                      }
                      className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 font-medium transition-colors"
                    >
                      {activeTimer.isRunning ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => setActiveTimer(null)}
                      className="px-6 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 font-medium transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Minimized Button in Bottom Right */}
            {activeTimer.isMinimized && (
              <button
                onClick={() =>
                  setActiveTimer({
                    ...activeTimer,
                    isMinimized: false,
                  })
                }
                className="fixed bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors z-50"
                title={`Step ${activeTimer.stepIndex + 1}: ${formatTime(activeTimer.timeLeft)}`}
              >
                <div className="text-center">
                  <div className="text-xs font-bold">
                    Step {activeTimer.stepIndex + 1}
                  </div>
                  <div className="text-lg font-mono font-bold">
                    {formatTime(activeTimer.timeLeft)}
                  </div>
                </div>
              </button>
            )}
          </>
        )}

        {/* Presentation Mode Dialog */}
        {presentationMode && recipe && (
          <Dialog open={presentationMode} onOpenChange={setPresentationMode}>
            <DialogContent className="w-[75vw] h-[75vh] max-w-none border-0 p-0 [&>button]:hidden">
              <VisuallyHidden>
                <DialogTitle>Step by step recipe instructions</DialogTitle>
              </VisuallyHidden>
              <div className="flex h-full flex-col bg-gray-900 text-white rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4 sm:px-8">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold">
                      {recipe.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Step {currentStep + 1} of {recipe.instructions.length}
                    </p>
                  </div>
                  <button
                    onClick={() => setPresentationMode(false)}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-700 transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-8">
                  <div className="w-full max-w-2xl">
                    {/* Step Number */}
                    <div className="mb-8 text-center">
                      <div className="mb-4 inline-block rounded-full bg-orange-500 px-6 py-2">
                        <span className="text-lg font-bold">
                          Step {currentStep + 1}
                        </span>
                      </div>
                    </div>

                    {/* Instruction Text */}
                    <div className="mb-8 text-center">
                      <p className="text-2xl sm:text-4xl font-bold leading-relaxed">
                        {recipe.instructions[currentStep]}
                      </p>
                    </div>

                    {/* Cooking Time if available */}
                    {extractCookingTime(recipe.instructions[currentStep]) && (
                      <div className="mb-8 text-center">
                        <button
                          onClick={() => handleStartTimer(currentStep)}
                          className="inline-block rounded-lg bg-green-600 px-8 py-4 text-lg font-bold hover:bg-green-700 transition-colors"
                        >
                          ⏱️ Start Timer:{" "}
                          {formatTime(
                            extractCookingTime(
                              recipe.instructions[currentStep],
                            )!,
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t border-gray-700 px-6 py-4 sm:px-8">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    ← Back
                  </button>

                  <div className="flex gap-2">
                    {recipe.instructions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`h-3 rounded-full transition-colors ${
                          idx === currentStep
                            ? "w-8 bg-white"
                            : idx < currentStep
                              ? "w-3 bg-green-500"
                              : "w-3 bg-gray-600"
                        }`}
                        title={`Go to step ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (currentStep < recipe.instructions.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        setPresentationMode(false);
                      }
                    }}
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium hover:bg-green-700 transition-colors"
                  >
                    {currentStep === recipe.instructions.length - 1
                      ? "Finish ✓"
                      : "Next →"}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
