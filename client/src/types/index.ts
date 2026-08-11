export type UserRole = 'coach' | 'client';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutCategory = 'push' | 'pull' | 'legs' | 'full_body' | 'hiit' | 'upper' | 'lower' | 'core' | 'mobility' | 'custom';
export type WorkoutIntensity = 'light' | 'moderate' | 'high' | 'maximum';
export type CardioActivityType = 'running' | 'walking' | 'incline_walk' | 'stairmaster' | 'cycling' | 'other';
export type ComplianceTier = 'green' | 'yellow' | 'red';
export type MuscleGroupName = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
export type MuscleCategory = MuscleGroupName;

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  fitnessGoal?: string;
  streak?: number;
  coachId?: string;
  coachCode?: string;
  coachName?: string;
  targetDailySteps?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMealEntry {
  type: MealType;
  imagePath: string;
  photoUrl?: string;
  caption?: string;
  name?: string;
  loggedAt?: string | Date;
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

export type IRunningLog = ICardioLog;

export interface IMuscleExercise {
  id?: string;
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
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weightKg?: number;
  notes?: string;
}

export interface IWorkoutLog {
  title: string;
  category?: WorkoutCategory;
  totalSessionDurationMinutes: number;
  durationMinutes?: number;
  intensity: WorkoutIntensity;
  totalWorkoutReps?: number;
  muscleGroups?: IMuscleGroupLog[];
  targetMuscles?: string[];
  exercises?: string[];
  exerciseDetails?: IExerciseDetail[];
  summary?: string;
}

export interface IDailyLog {
  _id?: string;
  clientId: string;
  date: string;
  workout?: IWorkoutLog;
  meals: IMealEntry[];
  running?: ICardioLog;
  cardio?: ICardioLog;
  postWorkoutPhoto?: string;
  photoUrl?: string;
  voiceNoteUrl?: string;
  audioVoiceNoteUrl?: string;
  steps?: number;
  isRestDay?: boolean;
  isComplete: boolean;
  completionScore: number;
  notes?: string;
  coachFeedback?: {
    message: string;
    reactionEmoji?: string;
    createdAt: string | Date;
  };
  coachCheer?: {
    message?: string;
    reactionEmoji: string;
    cheeredAt: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DayStatus {
  date: string;
  dayName: string;
  score: number;
  hasWorkout?: boolean;
  hasMeals: boolean;
  hasRun: boolean;
  hasSelfie: boolean;
  hasVoiceNote?: boolean;
  isRestDay?: boolean;
  workoutTitle?: string;
  totalReps?: number;
  cardioType?: CardioActivityType;
  runKm: number;
  runMins: number;
  inclinePercentage?: number;
  stairmasterFloors?: number;
  status: 'complete' | 'partial' | 'missed';
}

export interface ComplianceSummary {
  score: number;
  overallScore?: number;
  tier: ComplianceTier;
  streak: number;
  weeklyHistory: DayStatus[];
  loggedDaysCount: number;
  totalKmRan: number;
  averageKmPerRun: number;
  totalStairmasterFloors?: number;
  habits?: {
    workout?: boolean;
    meals: boolean;
    running: boolean;
    selfie: boolean;
    voiceNote?: boolean;
  };
}

export interface IClientUser {
  _id: string;
  name: string;
  email: string;
  role: 'client';
  avatarUrl: string;
  phone?: string;
  coachId?: string;
  coachCode?: string;
  coachName?: string;
  fitnessGoal: string;
  streak?: number;
  compliance: ComplianceSummary;
  latestLogDate: string | null;
  totalLogsSubmitted: number;
}
