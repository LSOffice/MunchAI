"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MealPlanEntry } from "../types";
import { apiFetch } from "@/lib/utils";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

interface DayMeals {
  breakfast: MealPlanEntry | null;
  lunch: MealPlanEntry | null;
  dinner: MealPlanEntry | null;
  snacks: MealPlanEntry | null;
}

interface WeekMeals {
  [key: string]: DayMeals;
}

export default function MealPlan() {
  const [weekMeals, setWeekMeals] = useState<WeekMeals>({});
  const [loading, setLoading] = useState(true);
  const [viewDays, setViewDays] = useState<3 | 7>(3);
  const [threeDayOffset, setThreeDayOffset] = useState<number>(0);
  const [pendingRecipe, setPendingRecipe] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];
  const mealEmojis: Record<MealType, string> = {
    breakfast: "🌅",
    lunch: "🍽️",
    dinner: "🍴",
    snacks: "🍿",
  };

  // Get dates for the current week (Monday to Sunday)
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const dates: Record<string, string> = {};
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dates[dateStr] = dayNames[i];
    }

    return dates;
  };

  const weekDates = getWeekDates();

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const todayDate = getTodayDate();

  const getThreeDayDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + threeDayOffset - 1);

    const dates: Record<string, string> = {};
    const dateArray = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dateArray.push(date);
    }

    const dayLabels = dateArray.map((date) => {
      const dateToCompare = new Date(today);
      dateToCompare.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      const diffTime = date.getTime() - dateToCompare.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === -1) return "Yesterday";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 0) return `${Math.abs(Math.floor(diffDays))} days ago`;
      return `In ${Math.floor(diffDays)} days`;
    });

    dateArray.forEach((date, index) => {
      const dateStr = date.toISOString().split("T")[0];
      dates[dateStr] = dayLabels[index];
    });

    return dates;
  };

  const threeDayDates = getThreeDayDates();

  useEffect(() => {
    const loadData = async () => {
      try {
        const mealRes = await apiFetch("/api/user/meal-plan");
        const mealData = await mealRes.json();

        // Initialize week structure
        const newWeekMeals: WeekMeals = {};
        Object.keys(weekDates).forEach((date) => {
          newWeekMeals[date] = {
            breakfast: null,
            lunch: null,
            dinner: null,
            snacks: null,
          };
        });

        // Populate with existing meals
        (mealData.data || []).forEach((entry: MealPlanEntry) => {
          const dateStr = new Date(entry.date).toISOString().split("T")[0];
          if (newWeekMeals[dateStr]) {
            newWeekMeals[dateStr][entry.mealType as MealType] = entry;
          }
        });

        setWeekMeals(newWeekMeals);

        // Check for pending recipe from sessionStorage
        const pending = sessionStorage.getItem("pendingRecipe");
        if (pending) {
          const recipeData = JSON.parse(pending);
          setPendingRecipe(recipeData);
          sessionStorage.removeItem("pendingRecipe");

          // Show toast
          toast.info(`Choose where to add the dish: ${recipeData.title}`, {
            duration: Infinity,
            closeButton: true,
          });
        }
      } catch (error) {
        console.error("Failed to load meal plan:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRemoveMeal = async (entryId: string) => {
    try {
      await apiFetch(`/api/user/meal-plan/${entryId}`, {
        method: "DELETE",
      });

      // Update local state
      setWeekMeals((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((date) => {
          (Object.keys(updated[date]) as MealType[]).forEach((mealType) => {
            if (updated[date][mealType]?.id === entryId) {
              updated[date][mealType] = null;
            }
          });
        });
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove meal:", error);
    }
  };

  const handleAddRecipeToSlot = async (dateStr: string, mealType: MealType) => {
    if (!pendingRecipe) return;

    try {
      const response = await apiFetch("/api/user/meal-plan", {
        method: "POST",
        body: {
          date: dateStr,
          mealType: mealType,
          recipeId: pendingRecipe.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add recipe");
      }

      // Clear pending recipe and dismiss toast
      setPendingRecipe(null);
      toast.dismiss();

      // Reload meal plan data
      const mealRes = await apiFetch("/api/user/meal-plan");
      const mealData = await mealRes.json();

      // Initialize week structure
      const newWeekMeals: WeekMeals = {};
      Object.keys(weekDates).forEach((date) => {
        newWeekMeals[date] = {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: null,
        };
      });

      // Populate with existing meals
      (mealData.data || []).forEach((entry: MealPlanEntry) => {
        const dateStr = new Date(entry.date).toISOString().split("T")[0];
        if (newWeekMeals[dateStr]) {
          newWeekMeals[dateStr][entry.mealType as MealType] = entry;
        }
      });

      setWeekMeals(newWeekMeals);
      toast.success("Recipe added to meal plan!");
    } catch (error) {
      console.error("Failed to add recipe:", error);
      toast.error("Failed to add recipe to meal plan");
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Meal Plan 📅
              </h1>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                Plan your week with breakfast, lunch, dinner, and snacks
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewDays(3)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewDays === 3
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                3 Days
              </button>
              <button
                onClick={() => setViewDays(7)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewDays === 7
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                7 Days
              </button>
              {viewDays === 3 && (
                <div className="flex gap-1 ml-2 pl-2 border-l border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => setThreeDayOffset((prev) => prev - 1)}
                    className="px-2 py-2 rounded-lg font-semibold transition-all text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    title="Previous 3 days"
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => setThreeDayOffset(0)}
                    className="px-3 py-2 rounded-lg font-medium transition-all text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    title="Reset to today"
                  >
                    ⊙ Now
                  </button>
                  <button
                    onClick={() => setThreeDayOffset((prev) => prev + 1)}
                    className="px-2 py-2 rounded-lg font-semibold transition-all text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    title="Next 3 days"
                  >
                    ❯
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div
          className={`grid gap-3 sm:gap-4 ${viewDays === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 lg:grid-cols-7"}`}
        >
          {Object.entries(viewDays === 3 ? threeDayDates : weekDates).map(
            ([dateStr, dayName]) => (
              <div
                key={dateStr}
                className={`rounded-lg border p-3 sm:p-4 transition-all ${
                  dateStr === todayDate
                    ? "border-orange-500 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/30 ring-2 ring-orange-200 dark:ring-orange-800"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
                }`}
              >
                {/* Day Header */}
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {dayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(dateStr).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Meals for Day */}
                <div className="space-y-2">
                  {mealTypes.map((mealType) => (
                    <div
                      key={mealType}
                      className="rounded-lg border-2 border-gray-300 bg-gray-100 p-2 sm:p-3 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-base sm:text-lg">
                          {mealEmojis[mealType]}
                        </span>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                          {mealType}
                        </p>
                      </div>

                      {weekMeals[dateStr]?.[mealType] ? (
                        <div className="space-y-1">
                          <Link
                            href={`/recipes/${weekMeals[dateStr][mealType]?.id}`}
                            className="block text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 truncate"
                          >
                            {weekMeals[dateStr][mealType]?.recipe.title}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {weekMeals[dateStr][mealType]?.recipe.prepTime! +
                              weekMeals[dateStr][mealType]?.recipe
                                .cookTime!}{" "}
                            min
                          </p>
                          <button
                            onClick={() =>
                              handleRemoveMeal(weekMeals[dateStr][mealType]!.id)
                            }
                            className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      ) : pendingRecipe ? (
                        <button
                          onClick={() =>
                            handleAddRecipeToSlot(dateStr, mealType)
                          }
                          className="w-full py-2 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 rounded transition-colors"
                        >
                          + Click to add
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              addToMealPlan: "true",
                              date: dateStr,
                              mealType: mealType,
                            });
                            window.location.href = `/recipes?${params.toString()}`;
                          }}
                          className="w-full py-1 text-xs text-gray-500 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
