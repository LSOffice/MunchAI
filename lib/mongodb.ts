import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Add it to your .env.local");
}

interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalForMongoose = global as unknown as GlobalWithMongoose;

let cached = globalForMongoose.mongoose;
if (!cached) {
  cached = globalForMongoose.mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
