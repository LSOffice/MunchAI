import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  name?: string;
  email: string;
  passwordHash?: string;
  emailVerified?: Date | null;
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  // WebAuthn / Passkeys
  passkeys?: Array<{
    credentialID: Buffer;
    publicKey: Buffer;
    counter: number;
    transports?: string[];
    deviceType?: string;
    backedUp?: boolean;
  }>;
  currentChallenge?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    emailVerified: { type: Date, default: null },
    dietaryRestrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    cuisinePreferences: { type: [String], default: [] },
    passkeys: [
      new Schema(
        {
          credentialID: { type: Buffer, required: true },
          publicKey: { type: Buffer, required: true },
          counter: { type: Number, required: true, default: 0 },
          transports: { type: [String], default: [] },
          deviceType: { type: String },
          backedUp: { type: Boolean },
        },
        { _id: false },
      ),
    ],
    currentChallenge: { type: String, default: null },
  },
  { timestamps: true },
);

export default models.User || model<IUser>("User", UserSchema);
