import fs from 'fs';
import path from 'path';

export interface IUserRecord {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  role: 'coach' | 'client';
  avatarUrl: string;
  phone?: string;
  coachId?: string;
  coachCode?: string; // For coaches: their invite code
  targetDailySteps: number;
  fitnessGoal: string;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDailyLogRecord {
  _id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  waterIntakeMl?: number;
  caloriesBurned?: number;
  workoutDurationMin?: number;
  workoutType?: string;
  workoutNotes?: string;
  muscleGroups?: Array<{
    group: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weightLbs?: number;
    }>;
  }>;
  meals?: Array<{
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    photoUrl?: string;
    verifiedByCoach?: boolean;
    loggedAt?: string;
  }>;
  audioVoiceNoteUrl?: string;
  audioVoiceNoteDurationSec?: number;
  photoUrl?: string;
  coachCheer?: {
    reactionEmoji: string;
    message?: string;
    cheeredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

export class DurableStore {
  private static users: IUserRecord[] = [];
  private static logs: IDailyLogRecord[] = [];
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Load Users
      if (fs.existsSync(USERS_FILE)) {
        const rawUsers = fs.readFileSync(USERS_FILE, 'utf-8');
        this.users = JSON.parse(rawUsers);
      } else {
        this.users = [];
        this.saveUsers();
      }

      // Load Logs
      if (fs.existsSync(LOGS_FILE)) {
        const rawLogs = fs.readFileSync(LOGS_FILE, 'utf-8');
        this.logs = JSON.parse(rawLogs);
      } else {
        this.logs = [];
        this.saveLogs();
      }

      this.isInitialized = true;
      console.log(`📁 DurableStore initialized: ${this.users.length} users, ${this.logs.length} logs saved in ${DATA_DIR}`);
    } catch (err: any) {
      console.error('Failed to initialize DurableStore:', err.message);
      this.users = [];
      this.logs = [];
      this.isInitialized = true;
    }
  }

  private static saveUsers() {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('Error saving users to disk:', err.message);
    }
  }

  private static saveLogs() {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('Error saving logs to disk:', err.message);
    }
  }

  // --- Users Operations ---
  static getUsers(): IUserRecord[] {
    this.init();
    return this.users;
  }

  static findUserById(id: string): IUserRecord | undefined {
    this.init();
    return this.users.find((u) => u._id === id);
  }

  static findUserByEmail(email: string): IUserRecord | undefined {
    this.init();
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === clean);
  }

  static findCoachByCode(coachCode: string): IUserRecord | undefined {
    this.init();
    const clean = coachCode.trim().toUpperCase();
    return this.users.find((u) => u.role === 'coach' && u.coachCode && u.coachCode.toUpperCase() === clean);
  }

  static createUser(user: IUserRecord): IUserRecord {
    this.init();
    this.users.push(user);
    this.saveUsers();
    return user;
  }

  static updateUser(id: string, updates: Partial<IUserRecord>): IUserRecord | null {
    this.init();
    const idx = this.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveUsers();
    return this.users[idx];
  }

  static deleteUser(id: string): boolean {
    this.init();
    const prevLen = this.users.length;
    this.users = this.users.filter((u) => u._id !== id);
    this.logs = this.logs.filter((l) => l.clientId !== id);
    this.saveUsers();
    this.saveLogs();
    return this.users.length < prevLen;
  }

  // --- Logs Operations ---
  static getLogs(): IDailyLogRecord[] {
    this.init();
    return this.logs;
  }

  static findLogsByClient(clientId: string): IDailyLogRecord[] {
    this.init();
    return this.logs.filter((l) => l.clientId === clientId);
  }

  static findLogById(logId: string): IDailyLogRecord | undefined {
    this.init();
    return this.logs.find((l) => l._id === logId);
  }

  static findLogByClientAndDate(clientId: string, date: string): IDailyLogRecord | undefined {
    this.init();
    return this.logs.find((l) => l.clientId === clientId && l.date === date);
  }

  static createOrUpdateLog(log: IDailyLogRecord): IDailyLogRecord {
    this.init();
    const idx = this.logs.findIndex((l) => l.clientId === log.clientId && l.date === log.date);
    if (idx >= 0) {
      this.logs[idx] = {
        ...this.logs[idx],
        ...log,
        _id: this.logs[idx]._id,
        updatedAt: new Date().toISOString(),
      };
      this.saveLogs();
      return this.logs[idx];
    } else {
      this.logs.push(log);
      this.saveLogs();
      return log;
    }
  }

  static updateLogById(logId: string, updates: Partial<IDailyLogRecord>): IDailyLogRecord | null {
    this.init();
    const idx = this.logs.findIndex((l) => l._id === logId);
    if (idx === -1) return null;
    this.logs[idx] = {
      ...this.logs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveLogs();
    return this.logs[idx];
  }
}
