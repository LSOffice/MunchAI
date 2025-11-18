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
import { Edit2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/utils";

interface GroupedIngredient {
  name: string;
  category: string;
  items: Ingredient[];
  totalQuantity: number;
  unit: string;
  oldestExpiration: string;
}

interface EditingItem {
  id: string;
  quantity: number;
  expirationDate: string;
}

export default function Inventory() {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"expiration" | "name" | "category">(
    "expiration",
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupedIngredient | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const response = await apiFetch("/api/ingredients");
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
      const response = await apiFetch(`/api/ingredients/${ingredientId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete ingredient");

      const updatedIngredients = ingredients.filter(
        (i) => i.id !== ingredientId,
      );
      setIngredients(updatedIngredients);

      // Update selectedGroup if it exists
      if (selectedGroup) {
        const updatedItems = selectedGroup.items.filter(
          (i) => i.id !== ingredientId,
        );
        if (updatedItems.length === 0) {
          setSheetOpen(false);
          setSelectedGroup(null);
        } else {
          const newTotalQuantity = updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          setSelectedGroup({
            ...selectedGroup,
            items: updatedItems,
            totalQuantity: newTotalQuantity,
          });
        }
      }
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
    }
  };

  const handleUpdateIngredient = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const response = await apiFetch(`/api/ingredients/${editingItem.id}`, {
        method: "PATCH",
        body: {
          quantity: editingItem.quantity,
          expirationDate: editingItem.expirationDate,
        },
      });

      if (!response.ok) throw new Error("Failed to update ingredient");

      const updated = await response.json();
      const updatedIngredients = ingredients.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              quantity: editingItem.quantity,
              expirationDate: editingItem.expirationDate,
            }
          : i,
      );
      setIngredients(updatedIngredients);

      // Update selectedGroup if it exists
      if (selectedGroup) {
        const updatedItems = selectedGroup.items.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                quantity: editingItem.quantity,
                expirationDate: editingItem.expirationDate,
              }
            : i,
        );
        const newTotalQuantity = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        let newOldestExpiration = updatedItems[0].expirationDate;
        updatedItems.forEach((item) => {
          if (
            new Date(item.expirationDate).getTime() <
            new Date(newOldestExpiration).getTime()
          ) {
            newOldestExpiration = item.expirationDate;
          }
        });
        setSelectedGroup({
          ...selectedGroup,
          items: updatedItems,
          totalQuantity: newTotalQuantity,
          oldestExpiration: newOldestExpiration,
        });
      }

      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update ingredient:", error);
    } finally {
      setIsSaving(false);
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

  // Get emoji for ingredient
  const getIngredientEmoji = (name: string, category: string): string => {
    const lowerName = name.toLowerCase();

    // Produce
    if (category === "produce") {
      if (lowerName.includes("tomato")) return "🍅";
      if (lowerName.includes("broccoli")) return "🥦";
      if (lowerName.includes("carrot")) return "🥕";
      if (lowerName.includes("spinach") || lowerName.includes("lettuce"))
        return "🥬";
      if (lowerName.includes("onion")) return "🧅";
      if (lowerName.includes("garlic")) return "🧄";
      if (lowerName.includes("bell pepper") || lowerName.includes("pepper"))
        return "🫑";
      if (lowerName.includes("zucchini")) return "🥒";
      if (lowerName.includes("potato")) return "🥔";
      if (lowerName.includes("cucumber")) return "🥒";
      if (lowerName.includes("avocado")) return "🥑";
      return "🥬";
    }

    // Dairy
    if (category === "dairy") {
      if (lowerName.includes("milk")) return "🥛";
      if (lowerName.includes("cheese")) return "🧀";
      if (lowerName.includes("egg")) return "🥚";
      if (lowerName.includes("yogurt")) return "🍯";
      if (lowerName.includes("butter")) return "🧈";
      return "🥛";
    }

    // Meat
    if (category === "meat") {
      if (lowerName.includes("chicken")) return "🍗";
      if (lowerName.includes("beef") || lowerName.includes("ground"))
        return "🥩";
      if (lowerName.includes("salmon") || lowerName.includes("fish"))
        return "🐟";
      if (lowerName.includes("shrimp")) return "🦐";
      if (lowerName.includes("pork")) return "🐷";
      return "🍖";
    }

    // Pantry
    if (category === "pantry") {
      if (lowerName.includes("oil")) return "🫗";
      if (lowerName.includes("rice")) return "🍚";
      if (lowerName.includes("pasta") || lowerName.includes("spaghetti"))
        return "🍝";
      if (lowerName.includes("bread")) return "🍞";
      if (lowerName.includes("sauce")) return "🍯";
      if (lowerName.includes("salt") || lowerName.includes("pepper"))
        return "🧂";
      if (lowerName.includes("flour")) return "🌾";
      return "🫙";
    }

    // Frozen
    if (category === "frozen") {
      return "❄️";
    }

    return "🥘";
  };

  // Pluralize ingredient name
  const pluralizeIngredient = (name: string, quantity: number): string => {
    if (quantity === 1) return name;
    // If name already ends with 's', just return it
    if (name.toLowerCase().endsWith("s")) return name;
    return name + "s";
  };

  // Group ingredients by name
  const groupedByName = ingredients.reduce(
    (acc, ing) => {
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
    },
    {} as Record<string, GroupedIngredient>,
  );

  const groupedIngredients = Object.values(groupedByName);

  const filteredGrouped = groupedIngredients.filter(
    (group) => filter === "all" || group.category === filter,
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
        (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3 && daysLeft >= 0;
  }).length;

  // Count ingredients expiring by day
  const expiringByDay = {
    today: groupedIngredients.filter((group) => {
      const daysLeft = Math.floor(
        (new Date(group.oldestExpiration).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysLeft === 0;
    }).length,
    day1: groupedIngredients.filter((group) => {
      const daysLeft = Math.floor(
        (new Date(group.oldestExpiration).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysLeft === 1;
    }).length,
    day2: groupedIngredients.filter((group) => {
      const daysLeft = Math.floor(
        (new Date(group.oldestExpiration).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysLeft === 2;
    }).length,
    day3: groupedIngredients.filter((group) => {
      const daysLeft = Math.floor(
        (new Date(group.oldestExpiration).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysLeft === 3;
    }).length,
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
          <div className="mb-6 space-y-3">
            <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3 sm:p-4 dark:bg-yellow-900/20">
              <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-400">
                ⏰ {expiringCount} ingredient{expiringCount !== 1 ? "s" : ""}{" "}
                expiring in the next 3 days
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {expiringByDay.today > 0 && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-2 sm:p-3 dark:border-red-900/50 dark:bg-red-900/10">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Today
                  </p>
                  <p className="text-sm sm:text-base font-bold text-red-700 dark:text-red-300">
                    {expiringByDay.today}
                  </p>
                </div>
              )}
              {expiringByDay.day1 > 0 && (
                <div className="rounded-lg border border-orange-300 bg-orange-50 p-2 sm:p-3 dark:border-orange-900/50 dark:bg-orange-900/10">
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    Tomorrow
                  </p>
                  <p className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-300">
                    {expiringByDay.day1}
                  </p>
                </div>
              )}
              {expiringByDay.day2 > 0 && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-2 sm:p-3 dark:border-yellow-900/50 dark:bg-yellow-900/10">
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    In 2 days
                  </p>
                  <p className="text-sm sm:text-base font-bold text-yellow-700 dark:text-yellow-300">
                    {expiringByDay.day2}
                  </p>
                </div>
              )}
              {expiringByDay.day3 > 0 && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-2 sm:p-3 dark:border-yellow-900/50 dark:bg-yellow-900/10">
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    In 3 days
                  </p>
                  <p className="text-sm sm:text-base font-bold text-yellow-700 dark:text-yellow-300">
                    {expiringByDay.day3}
                  </p>
                </div>
              )}
            </div>
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
                  (1000 * 60 * 60 * 24),
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
                          {group.name}{" "}
                          {getIngredientEmoji(group.name, group.category)}
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
                          ✕ {group.totalQuantity} {group.unit}
                          {group.totalQuantity !== 1 ? "s" : ""} of{" "}
                          {group.name.toLowerCase()} expired
                        </span>
                      )}
                      {isExpiring && !isExpired && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          ⏰ {group.totalQuantity} {group.unit}
                          {group.totalQuantity !== 1 ? "s" : ""} of{" "}
                          {group.name.toLowerCase()} expire in {daysLeft} day
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
              <SheetTitle>
                {selectedGroup?.name}{" "}
                {getIngredientEmoji(
                  selectedGroup?.name || "",
                  selectedGroup?.category || "",
                )}
              </SheetTitle>
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
                      (1000 * 60 * 60 * 24),
                  );
                  const isExpired = daysLeft < 0;
                  const isExpiring = daysLeft <= 3 && daysLeft >= 0;
                  const isEditing = editingItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-4 ${
                        isExpired
                          ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10"
                          : isExpiring
                            ? "border-yellow-300 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10"
                            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Quantity
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.1"
                                value={editingItem.quantity}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    quantity: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              <span className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400">
                                {item.unit}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Expiration Date
                            </label>
                            <input
                              type="date"
                              value={editingItem.expirationDate.split("T")[0]}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  expirationDate: new Date(e.target.value)
                                    .toISOString()
                                    .split("T")[0],
                                })
                              }
                              className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={handleUpdateIngredient}
                              disabled={isSaving}
                              className="flex-1 rounded bg-green-500 px-3 py-1 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex-1 rounded bg-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.quantity} {item.unit}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expires:{" "}
                              {new Date(
                                item.expirationDate,
                              ).toLocaleDateString()}
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

                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() =>
                                setEditingItem({
                                  id: item.id,
                                  quantity: item.quantity,
                                  expirationDate: item.expirationDate,
                                })
                              }
                              className="p-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                handleRemove(item.id);
                                if (selectedGroup.items.length === 1) {
                                  setSheetOpen(false);
                                }
                              }}
                              className="p-2 rounded border border-red-600 text-red-600 hover:bg-red-50 transition-colors dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
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
