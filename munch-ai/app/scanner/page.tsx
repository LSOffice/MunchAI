"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "../types";

export default function Scanner() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<
    "upload" | "camera" | "manual" | null
  >(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    quantity: "",
    unit: "piece",
    category: "produce",
    expirationDate: "",
  });

  // Process receipt via API
  const handleProcessReceipt = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: "image-data" }),
      });

      if (!response.ok) throw new Error("Failed to process receipt");

      const data = await response.json();
      setIngredients(data.data || []);
    } catch (error) {
      console.error("Failed to process receipt:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add ingredients to inventory
  const handleAddIngredients = async () => {
    try {
      for (const ingredient of ingredients) {
        await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ingredient),
        });
      }
      router.push("/inventory");
    } catch (error) {
      console.error("Failed to add ingredients:", error);
    }
  };

  // Add manual ingredient
  const handleAddManual = async () => {
    if (
      !manualForm.name ||
      !manualForm.quantity ||
      !manualForm.expirationDate
    ) {
      alert("Please fill in all fields");
      return;
    }

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: manualForm.name,
      quantity: parseFloat(manualForm.quantity),
      unit: manualForm.unit as
        | "piece"
        | "g"
        | "ml"
        | "cup"
        | "liter"
        | "bunch"
        | "bottle",
      category: manualForm.category as
        | "produce"
        | "dairy"
        | "meat"
        | "pantry"
        | "frozen"
        | "other",
      expirationDate: new Date(manualForm.expirationDate).toISOString(),
      dateAdded: new Date().toISOString(),
    };

    setIngredients([...ingredients, newIngredient]);
    setManualForm({
      name: "",
      quantity: "",
      unit: "piece",
      category: "produce",
      expirationDate: "",
    });
  };

  if (!uploadMethod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Scan Receipt 📸
          </h1>
          <p className="mb-6 sm:mb-8 text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Add groceries to your inventory by scanning a receipt or uploading
            an image.
          </p>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setUploadMethod("camera")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">📷</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Take Photo
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Use your camera to take a photo of your receipt
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("upload")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">📁</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Upload File
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Upload an existing receipt image from your device
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("manual")}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 sm:p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-orange-900/10"
            >
              <div className="text-2xl sm:text-3xl">✏️</div>
              <h3 className="mt-2 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Add Manually
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Type in items you bought manually
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (uploadMethod === "upload" || uploadMethod === "camera") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
          <button
            onClick={() =>
              ingredients.length === 0 ? setUploadMethod(null) : null
            }
            className="mb-4 text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← Back
          </button>

          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {uploadMethod === "camera" ? "Take Photo" : "Upload Receipt"}
          </h1>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 sm:p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            {!isProcessing ? (
              <>
                <div className="mb-4 text-4xl sm:text-6xl">
                  {uploadMethod === "camera" ? "📷" : "📁"}
                </div>
                <p className="mb-4 text-xs sm:text-base text-gray-600 dark:text-gray-400">
                  {uploadMethod === "camera"
                    ? "Click to open camera"
                    : "Drag and drop a receipt image here, or click to select"}
                </p>
                <button
                  onClick={handleProcessReceipt}
                  className="rounded bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  {uploadMethod === "camera" ? "Open Camera" : "Choose File"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 inline-block animate-spin text-3xl sm:text-4xl">
                  ⏳
                </div>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                  Processing receipt with AI...
                </p>
              </>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Detected Ingredients
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {ingredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-base font-medium text-gray-900 dark:text-white break-words">
                        {ingredient.quantity} {ingredient.unit}{" "}
                        {ingredient.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {ingredient.category}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setIngredients(ingredients.filter((_, i) => i !== idx))
                      }
                      className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setIngredients([]);
                    handleProcessReceipt();
                  }}
                  className="flex-1 rounded border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleAddIngredients}
                  className="flex-1 rounded bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        <button
          onClick={() => setUploadMethod(null)}
          className="mb-4 text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          ← Back
        </button>

        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Add Items Manually
        </h1>
        <p className="mb-4 sm:mb-6 text-xs sm:text-base text-gray-600 dark:text-gray-400">
          Type in what you bought, and we'll add it to your inventory.
        </p>

        <div className="space-y-3 sm:space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-800">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Item Name
            </label>
            <input
              type="text"
              placeholder="e.g., Tomatoes"
              value={manualForm.name}
              onChange={(e) =>
                setManualForm({ ...manualForm, name: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Quantity
              </label>
              <input
                type="number"
                placeholder="4"
                value={manualForm.quantity}
                onChange={(e) =>
                  setManualForm({ ...manualForm, quantity: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Unit
              </label>
              <select
                value={manualForm.unit}
                onChange={(e) =>
                  setManualForm({ ...manualForm, unit: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              >
                <option>piece</option>
                <option>g</option>
                <option>ml</option>
                <option>cup</option>
                <option>liter</option>
                <option>bunch</option>
                <option>bottle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Category
            </label>
            <select
              value={manualForm.category}
              onChange={(e) =>
                setManualForm({ ...manualForm, category: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            >
              <option>produce</option>
              <option>dairy</option>
              <option>meat</option>
              <option>pantry</option>
              <option>frozen</option>
              <option>other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Expiration Date
            </label>
            <input
              type="date"
              value={manualForm.expirationDate}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  expirationDate: e.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={handleAddManual}
            className="w-full rounded bg-orange-500 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            Add Item
          </button>

          {ingredients.length > 0 && (
            <div className="mt-4 sm:mt-6 border-t border-gray-300 pt-4 dark:border-gray-700">
              <h3 className="mb-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Items to Add ({ingredients.length})
              </h3>
              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="break-words">
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                    <button
                      onClick={() =>
                        setIngredients(ingredients.filter((_, i) => i !== idx))
                      }
                      className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => {
              setUploadMethod(null);
              setIngredients([]);
            }}
            className="flex-1 rounded border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleAddIngredients}
            disabled={ingredients.length === 0}
            className="flex-1 rounded bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            Save Items
          </button>
        </div>
      </div>
    </div>
  );
}
