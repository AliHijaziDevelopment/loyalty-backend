import mongoose from "mongoose";
import { env } from "../config/env.js";

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri, {
      autoIndex: env.nodeEnv !== "production",
      serverSelectionTimeoutMS: 5000,
    });
  }

  await connectionPromise;
  return mongoose.connection;
}
