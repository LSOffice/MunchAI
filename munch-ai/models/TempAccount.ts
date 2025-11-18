import mongoose from "mongoose";

const tempAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    verificationTokenExpiry: {
      type: Date,
      required: true,
    },
    resendAttempts: {
      type: Number,
      default: 0,
    },
    lastResendTime: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Auto-delete after 1 hour
    },
  },
  { timestamps: true },
);

const TempAccount =
  mongoose.models.TempAccount ||
  mongoose.model("TempAccount", tempAccountSchema);

export default TempAccount;
