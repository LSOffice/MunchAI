import { Schema, models, model, Types } from "mongoose";

export interface IMealPlanEntry {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId; // references Recipe or could be saved snapshot
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

const MealPlanSchema = new Schema<IMealPlanEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    recipeId: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
  },
  { timestamps: true },
);

export default models.MealPlan ||
  model<IMealPlanEntry>("MealPlan", MealPlanSchema);
