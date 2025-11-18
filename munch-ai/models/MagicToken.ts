import { Schema, models, model } from "mongoose";

export interface IMagicToken {
  token: string;
  email: string;
  userId?: string;
  purpose: "login" | "email-verification";
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MagicTokenSchema = new Schema<IMagicToken>(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    userId: { type: String },
    purpose: {
      type: String,
      required: true,
      enum: ["login", "email-verification"],
      default: "login",
    },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default models.MagicToken ||
  model<IMagicToken>("MagicToken", MagicTokenSchema);
