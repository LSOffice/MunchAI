"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ingredient } from "../types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface GroupedIngredient {
  name: string;
  category: string;
  items: Ingredient[];
  totalQuantity: number;
  unit: string;
  oldestExpiration: string;
}

export default function Inventory() {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"expiration" | "name" | "category">(
    "expiration"
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupedIngredient | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients");
        const data = await response.json();
        setIngredients(data.data || []);
      } catch (error) {
        console.error("Failed to load ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, []);

  const handleRemove = async (ingredientId: string) => {
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete ingredient");

      setIngredients(ingredients.filter((i) => i.id !== ingredientId));
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
    }
  };

  const categories = [
    "all",
    "produce",
    "dairy",
    "meat",
    "pantry",
    "frozen",
    "other",
  ];

  // Group ingredients by name
  const groupedByName = ingredients.reduce((acc, ing) => {
    const key = ing.name.toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        name: ing.name,
        category: ing.category,
        items: [],
        totalQuantity: 0,
        unit: ing.unit,
        oldestExpiration: ing.expirationDate,
      };
    }
    acc[key].items.push(ing);
    acc[key].totalQuantity += ing.quantity;
    if (
      new Date(ing.expirationDate).getTime() <
      new Date(acc[key].oldestExpiration).getTime()
    ) {
      acc[key].oldestExpiration = ing.expirationDate;
    }
    return acc;
  }, {} as Record<string, GroupedIngredient>);

  const groupedIngredients = Object.values(groupedByName);

  const filteredGrouped = groupedIngredients.filter(
    (group) => filter === "all" || group.category === filter
  );

  const sortedGrouped = [...filteredGrouped].sort((a, b) => {
    if (sortBy === "expiration") {
      return (
        new Date(a.oldestExpiration).getTime() -
        new Date(b.oldestExpiration).getTime()
      );
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });

  const expiringCount = groupedIngredients.filter((group) => {
    const daysLeft = Math.floor(
      (new Date(group.oldestExpiration).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 3 && daysLeft >= 0;
  }).length;

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
            Your Inventory 🥦
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            You have {ingredients.length} item
            {ingredients.length !== 1 ? "s" : ""} in {sortedGrouped.length}{" "}
            unique ingredient{sortedGrouped.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats */}
        {expiringCount > 0 && (
          <div className="mb-6 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3 sm:p-4 dark:bg-yellow-900/20">
            <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-400">
              ⏰ {expiringCount} ingredient{expiringCount !== 1 ? "s" : ""}{" "}
              expiring in the next 3 days
            </p>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-colors capitalize ${
                    filter === cat
                      ? "bg-orange-500 text-white dark:bg-orange-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="expiration">Expiration Date</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Ingredients List */}
        {sortedGrouped.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {sortedGrouped.map((group) => {
              const daysLeft = Math.floor(
                (new Date(group.oldestExpiration).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const isExpiring = daysLeft <= 3 && daysLeft >= 0;
              const isExpired = daysLeft < 0;

              return (
                <div
                  key={group.name}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 sm:p-4 transition-all gap-3 sm:gap-4 ${
                    isExpired
                      ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10"
                      : isExpiring
                      ? "border-yellow-300 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10"
                      : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                          {group.category}
                        </p>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total:{" "}
                        <span className="font-semibold">
                          {group.totalQuantity} {group.unit}
                        </span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {group.items.length} package
                        {group.items.length !== 1 ? "s" : ""}
                      </span>
                      {isExpired && (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                          ✕ Expired
                        </span>
                      )}
                      {isExpiring && !isExpired && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          ⏰ Expires in {daysLeft} day
                          {daysLeft !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setSheetOpen(true);
                      }}
                      className="flex-1 sm:flex-none rounded bg-blue-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-200 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        group.items.forEach((item) => handleRemove(item.id));
                      }}
                      className="flex-1 sm:flex-none rounded bg-red-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-200 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-4xl sm:text-6xl">📦</div>
            <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              No ingredients found
            </h3>
            <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Start by scanning a receipt or adding items manually
            </p>
            <Link
              href="/scanner"
              className="inline-block rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Scan Receipt
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {sortedGrouped.length > 0 && (
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              href="/scanner"
              className="flex-1 rounded border border-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/10"
            >
              Add More Items
            </Link>
            <Link
              href="/recipes"
              className="flex-1 rounded bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Find Recipes
            </Link>
          </div>
        )}

        {/* Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{selectedGroup?.name}</SheetTitle>
              <SheetDescription>
                {selectedGroup?.items.length} package
                {selectedGroup?.items.length !== 1 ? "s" : ""} • Total:{" "}
                {selectedGroup?.totalQuantity} {selectedGroup?.unit}
              </SheetDescription>
            </SheetHeader>

            {selectedGroup && (
              <div className="mt-6 space-y-4">
                {selectedGroup.items.map((item) => {
                  const daysLeft = Math.floor(
                    (new Date(item.expirationDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isExpired = daysLeft < 0;
                  const isExpiring = daysLeft <= 3 && daysLeft >= 0;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        isExpired
                          ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10"
                          : isExpiring
                          ? "border-yellow-300 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10"
                          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires:{" "}
                          {new Date(item.expirationDate).toLocaleDateString()}
                        </p>
                        {isExpired && (
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                            ✕ Expired
                          </p>
                        )}
                        {isExpiring && !isExpired && (
                          <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                            ⏰ Expires in {daysLeft} day
                            {daysLeft !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          handleRemove(item.id);
                          if (selectedGroup.items.length === 1) {
                            setSheetOpen(false);
                          }
                        }}
                        className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
