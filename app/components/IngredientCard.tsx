"use client";

import { Ingredient } from "../types";

interface IngredientCardProps {
  ingredient: Ingredient;
  onRemove?: (ingredientId: string) => void;
  onEdit?: (ingredient: Ingredient) => void;
  compact?: boolean;
}

export default function IngredientCard({
  ingredient,
  onRemove,
  onEdit,
  compact = false,
}: IngredientCardProps) {
  const expirationDate = new Date(ingredient.expirationDate);
  const today = new Date();
  const daysUntilExpiration = Math.floor(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const getExpirationColor = () => {
    if (daysUntilExpiration < 0)
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    if (daysUntilExpiration <= 3)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    if (daysUntilExpiration <= 7)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getExpirationText = () => {
    if (daysUntilExpiration < 0) return "Expired";
    if (daysUntilExpiration === 0) return "Expires today";
    if (daysUntilExpiration === 1) return "Expires tomorrow";
    return `${daysUntilExpiration} days left`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {ingredient.quantity} {ingredient.unit} {ingredient.name}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${getExpirationColor()}`}
        >
          {getExpirationText()}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Image */}
      {ingredient.imageUrl && (
        <div className="relative h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={ingredient.imageUrl}
            alt={ingredient.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold capitalize text-gray-900 dark:text-white">
          {ingredient.name}
        </h3>

        <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-medium">Quantity:</span> {ingredient.quantity}{" "}
            {ingredient.unit}
          </p>
          <p>
            <span className="font-medium">Category:</span> {ingredient.category}
          </p>
          <p>
            <span className="font-medium">Added:</span>{" "}
            {new Date(ingredient.dateAdded).toLocaleDateString()}
          </p>
        </div>

        {/* Expiration Status */}
        <div
          className={`mb-3 rounded-lg p-2 text-sm font-medium ${getExpirationColor()}`}
        >
          {getExpirationText()}
        </div>

        {/* Actions */}
        {(onEdit || onRemove) && (
          <div className="flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
            {onEdit && (
              <button
                onClick={() => onEdit(ingredient)}
                className="flex-1 rounded bg-blue-500 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(ingredient.id)}
                className="flex-1 rounded bg-red-500 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
