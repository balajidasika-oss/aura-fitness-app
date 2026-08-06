import mongoose from 'mongoose';
import { IUser } from '../models/User.js';
import { IDailyLog } from '../models/DailyLog.js';

let isMongoConnected = false;

// In-memory mock store fallback for friction-free local dev
export class MemoryStore {
  static users: any[] = [];
  static logs: any[] = [];

  static isUsingMemory(): boolean {
    return !isMongoConnected;
  }
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness_coach';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️  MongoDB connection failed (${error.message}). Switching to Built-In In-Memory Store for frictionless local development.`);
    isMongoConnected = false;
  }
};
