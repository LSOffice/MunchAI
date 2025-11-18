import { Schema, model, models, Types } from "mongoose";

export interface IIngredient {
  userId: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other";
  expirationDate: Date;
  dateAdded: Date;
  imageUrl?: string;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: {
      type: String,
      enum: ["produce", "dairy", "meat", "pantry", "frozen", "other"],
      default: "other",
    },
    expirationDate: { type: Date, required: true },
    dateAdded: { type: Date, default: () => new Date() },
    imageUrl: { type: String },
  },
  { timestamps: false },
);

export default models.Ingredient ||
  model<IIngredient>("Ingredient", IngredientSchema);
