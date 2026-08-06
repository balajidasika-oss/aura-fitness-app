import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'coach' | 'client';

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  coachId?: mongoose.Types.ObjectId;
  targetDailySteps: number;
  fitnessGoal: string;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['coach', 'client'], required: true, default: 'client' },
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    coachId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetDailySteps: { type: Number, default: 10000 },
    fitnessGoal: { type: String, default: 'Hypertrophy & Fat Loss' },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
