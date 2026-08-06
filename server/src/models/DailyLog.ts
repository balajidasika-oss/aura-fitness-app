import mongoose, { Document, Schema } from 'mongoose';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CardioActivityType = 'running' | 'walking' | 'incline_walk' | 'stairmaster' | 'cycling' | 'other';
export type MuscleGroupName = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

export interface IMealEntry {
  type: MealType;
  imagePath: string;
  caption?: string;
  loggedAt?: Date;
}

export interface ICardioLog {
  activityType: CardioActivityType;
  distanceKm: number;
  durationMinutes: number;
  pace?: string;
  inclinePercentage?: number;
  stairmasterFloors?: number;
  stairmasterLevel?: number;
  heartRateAvg?: number;
  caloriesBurned?: number;
}

export interface IMuscleExercise {
  name: string;
  sets: number;
  reps: number | string;
  totalReps: number;
  weightKg?: number;
  notes?: string;
}

export interface IMuscleGroupLog {
  muscle: MuscleGroupName;
  label: string;
  totalMuscleReps: number;
  exercises: IMuscleExercise[];
}

export interface IExerciseDetail {
  name: string;
  sets: number;
  reps: string;
  weightKg?: number;
  notes?: string;
}

export interface IWorkoutLog {
  title: string;
  category?: 'push' | 'pull' | 'legs' | 'full_body' | 'hiit' | 'upper' | 'lower' | 'core' | 'mobility' | 'custom';
  totalSessionDurationMinutes: number;
  durationMinutes?: number;
  intensity: 'light' | 'moderate' | 'high' | 'maximum';
  totalWorkoutReps?: number;
  muscleGroups?: IMuscleGroupLog[];
  targetMuscles?: string[];
  exercises?: string[];
  exerciseDetails?: IExerciseDetail[];
  summary?: string;
}

export interface IDailyLog extends Document {
  clientId: mongoose.Types.ObjectId | string;
  date: string; // ISO format 'YYYY-MM-DD'
  workout?: IWorkoutLog;
  meals: IMealEntry[];
  running: ICardioLog;
  cardio?: ICardioLog;
  postWorkoutPhoto?: string;
  voiceNoteUrl?: string; // Recorded audio file path from client
  steps?: number;
  isComplete: boolean;
  completionScore: number;
  notes?: string;
  coachFeedback?: {
    message: string;
    reactionEmoji?: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const DailyLogSchema = new Schema<IDailyLog>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    workout: {
      title: { type: String, default: '' },
      category: {
        type: String,
        enum: ['push', 'pull', 'legs', 'full_body', 'hiit', 'upper', 'lower', 'core', 'mobility', 'custom'],
        default: 'push',
      },
      totalSessionDurationMinutes: { type: Number, default: 0 },
      durationMinutes: { type: Number, default: 0 },
      intensity: {
        type: String,
        enum: ['light', 'moderate', 'high', 'maximum'],
        default: 'high',
      },
      totalWorkoutReps: { type: Number, default: 0 },
      muscleGroups: [
        {
          muscle: { type: String, required: true },
          label: { type: String, default: '' },
          totalMuscleReps: { type: Number, default: 0 },
          exercises: [
            {
              name: { type: String, default: '' },
              sets: { type: Number, default: 3 },
              reps: { type: Schema.Types.Mixed, default: '10' },
              totalReps: { type: Number, default: 30 },
              weightKg: { type: Number, default: 0 },
              notes: { type: String, default: '' },
            },
          ],
        },
      ],
      targetMuscles: [{ type: String }],
      exercises: [{ type: String }],
      exerciseDetails: [
        {
          name: { type: String, default: '' },
          sets: { type: Number, default: 3 },
          reps: { type: String, default: '10' },
          weightKg: { type: Number, default: 0 },
          notes: { type: String, default: '' },
        },
      ],
      summary: { type: String, default: '' },
    },
    meals: [
      {
        type: {
          type: String,
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          default: 'lunch',
        },
        imagePath: { type: String, required: true },
        caption: { type: String, default: '' },
        loggedAt: { type: Date, default: Date.now },
      },
    ],
    running: {
      activityType: {
        type: String,
        enum: ['running', 'walking', 'incline_walk', 'stairmaster', 'cycling', 'other'],
        default: 'running',
      },
      distanceKm: { type: Number, default: 0 },
      durationMinutes: { type: Number, default: 0 },
      pace: { type: String, default: '' },
      inclinePercentage: { type: Number, default: 0 },
      stairmasterFloors: { type: Number, default: 0 },
      stairmasterLevel: { type: Number, default: 0 },
      heartRateAvg: { type: Number, default: 0 },
      caloriesBurned: { type: Number, default: 0 },
    },
    cardio: {
      activityType: {
        type: String,
        enum: ['running', 'walking', 'incline_walk', 'stairmaster', 'cycling', 'other'],
        default: 'running',
      },
      distanceKm: { type: Number, default: 0 },
      durationMinutes: { type: Number, default: 0 },
      pace: { type: String, default: '' },
      inclinePercentage: { type: Number, default: 0 },
      stairmasterFloors: { type: Number, default: 0 },
      stairmasterLevel: { type: Number, default: 0 },
      heartRateAvg: { type: Number, default: 0 },
      caloriesBurned: { type: Number, default: 0 },
    },
    postWorkoutPhoto: { type: String, default: '' },
    voiceNoteUrl: { type: String, default: '' },
    steps: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
    completionScore: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    coachFeedback: {
      message: { type: String },
      reactionEmoji: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

DailyLogSchema.index({ clientId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.models.DailyLog || mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
