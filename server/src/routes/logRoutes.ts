import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DurableStore } from '../config/durableStore.js';

const router = Router();

// Ensure upload folders exist
const uploadBaseDir = path.join(process.cwd(), 'uploads');
const mealsDir = path.join(uploadBaseDir, 'meals');
const sessionsDir = path.join(uploadBaseDir, 'sessions');
const audioDir = path.join(uploadBaseDir, 'audio');
const avatarsDir = path.join(uploadBaseDir, 'avatars');

[uploadBaseDir, mealsDir, sessionsDir, audioDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for audio & images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'sessionPhoto') {
      cb(null, sessionsDir);
    } else if (file.fieldname === 'voiceNoteAudio') {
      cb(null, audioDir);
    } else if (file.fieldname === 'avatarPhoto') {
      cb(null, avatarsDir);
    } else {
      cb(null, mealsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || (file.mimetype.includes('audio') ? '.webm' : '.jpg');
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/webm'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image and audio files are permitted.'));
    }
  },
});

// GET /api/logs/today - Get today's log for active client
router.get('/today', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId is required' });
    }

    const log = DurableStore.findLogByClientAndDate(clientId, date);
    return res.json({ success: true, data: log || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/logs/history/:clientId - Get all logs for a client
router.get('/history/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const logs = DurableStore.findLogsByClient(clientId);
    const sorted = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return res.json({ success: true, data: sorted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/logs - Submit or update daily log
router.post(
  '/',
  upload.fields([
    { name: 'mealPhotos', maxCount: 6 },
    { name: 'sessionPhoto', maxCount: 1 },
    { name: 'voiceNoteAudio', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const clientId = req.body.clientId;
      const date = req.body.date || new Date().toISOString().split('T')[0];
      const notes = req.body.notes || '';

      if (!clientId) {
        return res.status(400).json({ success: false, message: 'clientId is required to submit a log' });
      }

      // 1. Parse Muscle Groups & Strength Workout Data
      let muscleGroups: any[] = [];
      if (req.body.muscleGroups) {
        try {
          muscleGroups = typeof req.body.muscleGroups === 'string' ? JSON.parse(req.body.muscleGroups) : req.body.muscleGroups;
        } catch {
          muscleGroups = [];
        }
      }

      let totalWorkoutReps = 0;
      if (muscleGroups && muscleGroups.length > 0) {
        totalWorkoutReps = muscleGroups.reduce((sum: number, mg: any) => sum + (Number(mg.totalMuscleReps) || 0), 0);
      } else if (req.body.totalWorkoutReps) {
        totalWorkoutReps = parseInt(req.body.totalWorkoutReps, 10) || 0;
      }

      const totalSessionDurationMinutes = parseInt(req.body.totalSessionDurationMinutes || req.body.workoutDuration, 10) || 45;

      const workoutData = {
        title: req.body.workoutTitle || 'Strength Session',
        category: req.body.workoutCategory || 'push',
        totalSessionDurationMinutes,
        durationMinutes: totalSessionDurationMinutes,
        intensity: req.body.workoutIntensity || 'high',
        totalWorkoutReps,
        muscleGroups,
        targetMuscles: req.body.targetMuscles ? (typeof req.body.targetMuscles === 'string' ? JSON.parse(req.body.targetMuscles) : req.body.targetMuscles) : [],
        summary: req.body.workoutSummary || '',
      };

      // 2. Parse Cardio Metrics
      const cardioData = {
        activityType: req.body.cardioType || 'running',
        distanceKm: parseFloat(req.body.cardioDistanceKm) || 0,
        durationMinutes: parseInt(req.body.cardioDurationMinutes, 10) || 0,
        pace: req.body.cardioPace || '',
        inclinePercentage: parseFloat(req.body.cardioIncline) || 0,
        stairmasterFloors: parseInt(req.body.stairmasterFloors, 10) || 0,
        stairmasterLevel: parseInt(req.body.stairmasterLevel, 10) || 0,
        heartRateAvg: parseInt(req.body.cardioHeartRate, 10) || 0,
        caloriesBurned: parseInt(req.body.cardioCalories, 10) || 0,
      };

      // 3. Process Uploaded Files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      let postWorkoutPhoto: string | undefined = req.body.postWorkoutPhoto || undefined;
      if (files?.sessionPhoto?.[0]) {
        postWorkoutPhoto = `/uploads/sessions/${files.sessionPhoto[0].filename}`;
      }

      let voiceNoteUrl: string | undefined = req.body.audioVoiceNoteUrl || undefined;
      if (files?.voiceNoteAudio?.[0]) {
        voiceNoteUrl = `/uploads/audio/${files.voiceNoteAudio[0].filename}`;
      }

      // 4. Parse Meals
      let mealsData: any[] = [];
      if (req.body.meals) {
        try {
          mealsData = typeof req.body.meals === 'string' ? JSON.parse(req.body.meals) : req.body.meals;
        } catch {
          mealsData = [];
        }
      }

      if (files?.mealPhotos) {
        files.mealPhotos.forEach((file, idx) => {
          const photoPath = `/uploads/meals/${file.filename}`;
          if (mealsData[idx]) {
            mealsData[idx].photoUrl = photoPath;
          } else {
            mealsData.push({
              name: `Meal ${idx + 1}`,
              mealType: idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : 'dinner',
              photoUrl: photoPath,
            });
          }
        });
      }

      // Compute Completion Score
      let score = 0;
      if (totalSessionDurationMinutes > 0 || totalWorkoutReps > 0) score += 35;
      if (cardioData.distanceKm > 0 || cardioData.stairmasterFloors > 0) score += 25;
      if (mealsData.length > 0) score += 20;
      if (voiceNoteUrl) score += 20;
      const isComplete = score >= 70;

      // Update client's streak in DurableStore
      const client = DurableStore.findUserById(clientId);
      if (client) {
        const newStreak = (client.streak || 0) + (isComplete ? 1 : 0);
        DurableStore.updateUser(clientId, { streak: newStreak });
      }

      const logId = `log_${clientId}_${date}`;
      const logRecord: any = {
        _id: logId,
        clientId,
        date,
        completed: isComplete,
        notes,
        workout: workoutData,
        cardio: cardioData,
        running: cardioData,
        meals: mealsData,
        postWorkoutPhoto,
        photoUrl: postWorkoutPhoto,
        voiceNoteUrl,
        audioVoiceNoteUrl: voiceNoteUrl,
        completionScore: score,
        isComplete,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = DurableStore.createOrUpdateLog(logRecord);

      return res.status(200).json({
        success: true,
        message: 'Daily workout and nutrition log saved securely!',
        data: saved,
      });
    } catch (error: any) {
      console.error('Error saving daily log:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save daily log',
        error: error.message,
      });
    }
  }
);

// POST /api/logs/:id/cheer - Coach sends feedback / emoji reaction
router.post('/:id/cheer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reactionEmoji, message, feedbackMessage } = req.body;

    const feedbackPayload = {
      reactionEmoji: reactionEmoji || '🔥',
      message: message || feedbackMessage || 'Great workout today! Keep pushing your limits.',
      createdAt: new Date().toISOString(),
      cheeredAt: new Date().toISOString(),
    };

    const updated = DurableStore.updateLogById(id, {
      coachCheer: feedbackPayload,
      coachFeedback: feedbackPayload,
    } as any);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    return res.json({
      success: true,
      message: 'Cheer sent directly to athlete!',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
