import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { DailyLog } from '../models/DailyLog.js';
import { MemoryStore } from '../config/db.js';

const router = Router();

export function generateSeedData() {
  const today = new Date();
  
  const sampleUsers = [
    {
      _id: 'client-alex-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      targetDailySteps: 10000,
      fitnessGoal: 'Hypertrophy & Incline Conditioning',
      streak: 6,
    },
    {
      _id: 'client-sarah-2',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6789',
      targetDailySteps: 12000,
      fitnessGoal: 'Half-Marathon & Stair Climber',
      streak: 7,
    },
    {
      _id: 'client-marcus-3',
      name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 456-7890',
      targetDailySteps: 8500,
      fitnessGoal: 'Body Recomposition & StairMaster',
      streak: 4,
    },
    {
      _id: 'client-elena-4',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 567-8901',
      targetDailySteps: 10000,
      fitnessGoal: 'Postpartum Functional Strength',
      streak: 2,
    },
    {
      _id: 'client-jordan-5',
      name: 'Jordan Miller',
      email: 'jordan.m@example.com',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 678-9012',
      targetDailySteps: 9000,
      fitnessGoal: 'Fat Loss & Zone 2 Incline Walk',
      streak: 0,
    },
    {
      _id: 'coach-kai-1',
      name: 'Coach Kai Brooks',
      email: 'coach.kai@aura.fit',
      role: 'coach',
      avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 900-1234',
      targetDailySteps: 15000,
      fitnessGoal: 'Head Performance & Endurance Coach',
      streak: 14,
    },
    {
      _id: 'coach-maya-2',
      name: 'Coach Maya Lin',
      email: 'coach.maya@aura.fit',
      role: 'coach',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      phone: '+1 (555) 900-5678',
      targetDailySteps: 12000,
      fitnessGoal: 'Holistic Nutrition & Stair Climber Coach',
      streak: 21,
    },
  ];

  const sampleMealImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
  ];

  const sampleSelfies = [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
  ];

  const workoutsList = [
    {
      title: 'Heavy Chest & Shoulders Hypertrophy',
      category: 'push' as const,
      totalSessionDurationMinutes: 55,
      durationMinutes: 55,
      intensity: 'high' as const,
      totalWorkoutReps: 104,
      muscleGroups: [
        {
          muscle: 'chest' as const,
          label: 'Chest / Pectorals',
          totalMuscleReps: 64,
          exercises: [
            { name: 'Incline Barbell Bench Press', sets: 4, reps: '8', totalReps: 32, weightKg: 80, notes: 'Top set clean' },
            { name: 'Cable Chest Flyes', sets: 4, reps: '8', totalReps: 32, weightKg: 18, notes: 'Deep stretch at bottom' },
          ],
        },
        {
          muscle: 'shoulders' as const,
          label: 'Shoulders & Delts',
          totalMuscleReps: 40,
          exercises: [
            { name: 'Dumbbell Overhead Press', sets: 4, reps: '10', totalReps: 40, weightKg: 24, notes: 'Strict tempo' },
          ],
        },
      ],
      exercises: [
        'Incline Barbell Bench Press 4x8 (80kg)',
        'Cable Chest Flyes 4x8 (18kg)',
        'Dumbbell Overhead Press 4x10 (24kg)',
      ],
      exerciseDetails: [
        { name: 'Incline Barbell Bench Press', sets: 4, reps: '8', weightKg: 80, notes: 'Felt solid on top set' },
        { name: 'Cable Chest Flyes', sets: 4, reps: '8', weightKg: 18, notes: 'Smooth stretch at bottom' },
        { name: 'Dumbbell Overhead Press', sets: 4, reps: '10', weightKg: 24, notes: 'Strict form with full lock' },
      ],
      summary: 'Chest pump was intense today. Hit 80kg comfortably on incline bench.',
    },
    {
      title: 'Heavy Back & Biceps Density',
      category: 'pull' as const,
      totalSessionDurationMinutes: 60,
      durationMinutes: 60,
      intensity: 'maximum' as const,
      totalWorkoutReps: 110,
      muscleGroups: [
        {
          muscle: 'back' as const,
          label: 'Back / Lats & Traps',
          totalMuscleReps: 74,
          exercises: [
            { name: 'Conventional Deadlift', sets: 4, reps: '5', totalReps: 20, weightKg: 145, notes: 'Fast off the floor' },
            { name: 'Neutral Lat Pulldown', sets: 3, reps: '12', totalReps: 36, weightKg: 70, notes: 'Deep lats stretch' },
            { name: 'Chest Supported T-Bar Row', sets: 3, reps: '6', totalReps: 18, weightKg: 60, notes: 'Mid-back squeeze' },
          ],
        },
        {
          muscle: 'arms' as const,
          label: 'Arms (Biceps & Triceps)',
          totalMuscleReps: 36,
          exercises: [
            { name: 'Incline DB Bicep Curls', sets: 3, reps: '12', totalReps: 36, weightKg: 16, notes: 'Controlled 3s eccentric' },
          ],
        },
      ],
      exercises: [
        'Conventional Deadlift 4x5 (145kg)',
        'Neutral Lat Pulldown 3x12 (70kg)',
        'Incline DB Bicep Curls 3x12 (16kg)',
      ],
      exerciseDetails: [
        { name: 'Conventional Deadlift', sets: 4, reps: '5', weightKg: 145, notes: 'Fast off the floor' },
        { name: 'Neutral Lat Pulldown', sets: 3, reps: '12', weightKg: 70, notes: 'Deep lats stretch' },
        { name: 'Incline DB Bicep Curls', sets: 3, reps: '12', weightKg: 16, notes: 'Controlled eccentric 3s' },
      ],
      summary: 'Deadlifts felt crisp and back density is peaking.',
    },
    {
      title: 'Leg Day: Quads & Glutes Hypertrophy',
      category: 'legs' as const,
      totalSessionDurationMinutes: 50,
      durationMinutes: 50,
      intensity: 'maximum' as const,
      totalWorkoutReps: 92,
      muscleGroups: [
        {
          muscle: 'legs' as const,
          label: 'Legs (Quads & Glutes)',
          totalMuscleReps: 92,
          exercises: [
            { name: 'Barbell Back Squats', sets: 4, reps: '8', totalReps: 32, weightKg: 110, notes: 'Below parallel' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '10', totalReps: 30, weightKg: 22, notes: 'Quads on fire' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10', totalReps: 30, weightKg: 85, notes: 'Hamstring emphasis' },
          ],
        },
      ],
      exercises: [
        'Barbell Back Squats 4x8 (110kg)',
        'Bulgarian Split Squats 3x10 (22kg)',
        'Romanian Deadlifts 3x10 (85kg)',
      ],
      exerciseDetails: [
        { name: 'Barbell Back Squats', sets: 4, reps: '8', weightKg: 110, notes: 'Below parallel on every set' },
        { name: 'Bulgarian Split Squats', sets: 3, reps: '10', weightKg: 22, notes: 'Quads on fire' },
        { name: 'Romanian Deadlifts', sets: 3, reps: '10', weightKg: 85, notes: 'Hamstrings stretch emphasis' },
      ],
      summary: 'Legs were burning by set 3 of split squats. Excellent depth.',
    },
  ];

  // Cardio varieties
  const cardioTemplates = [
    {
      activityType: 'incline_walk' as const,
      distanceKm: 4.2,
      durationMinutes: 35,
      inclinePercentage: 12,
      pace: '8:20 min/km',
      stairmasterFloors: 0,
      stairmasterLevel: 0,
      heartRateAvg: 138,
      caloriesBurned: 360,
    },
    {
      activityType: 'stairmaster' as const,
      distanceKm: 0,
      durationMinutes: 25,
      inclinePercentage: 0,
      pace: 'N/A',
      stairmasterFloors: 92,
      stairmasterLevel: 9,
      heartRateAvg: 162,
      caloriesBurned: 310,
    },
    {
      activityType: 'running' as const,
      distanceKm: 6.5,
      durationMinutes: 32,
      inclinePercentage: 1,
      pace: '4:55 min/km',
      stairmasterFloors: 0,
      stairmasterLevel: 0,
      heartRateAvg: 155,
      caloriesBurned: 450,
    },
  ];

  const sampleLogs: any[] = [];

  sampleUsers.forEach((user, userIdx) => {
    if (user.role === 'coach') return;

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      let shouldLogMeals = false;
      let shouldLogCardio = false;
      let shouldLogSelfie = false;
      let shouldLogWorkout = false;

      if (userIdx === 0) {
        // Alex: 100% compliance
        shouldLogMeals = true;
        shouldLogCardio = true;
        shouldLogSelfie = dayOffset !== 4;
        shouldLogWorkout = true;
      } else if (userIdx === 1) {
        // Sarah: 100% compliance
        shouldLogMeals = true;
        shouldLogCardio = true;
        shouldLogSelfie = true;
        shouldLogWorkout = true;
      } else if (userIdx === 2) {
        // Marcus: ~70% compliance
        shouldLogMeals = dayOffset % 2 === 0;
        shouldLogCardio = dayOffset < 5;
        shouldLogSelfie = dayOffset < 4;
        shouldLogWorkout = dayOffset < 5;
      } else if (userIdx === 3) {
        // Elena: ~45% compliance
        shouldLogMeals = dayOffset < 3;
        shouldLogCardio = dayOffset === 0 || dayOffset === 2;
        shouldLogSelfie = dayOffset < 2;
        shouldLogWorkout = dayOffset < 3;
      } else {
        // Jordan: ~25% compliance
        shouldLogMeals = dayOffset === 5 || dayOffset === 6;
        shouldLogCardio = dayOffset === 6;
        shouldLogSelfie = dayOffset === 6;
        shouldLogWorkout = dayOffset === 6;
      }

      if (!shouldLogMeals && !shouldLogCardio && !shouldLogSelfie && !shouldLogWorkout) {
        continue;
      }

      const meals = shouldLogMeals
        ? [
            {
              type: 'breakfast' as const,
              imagePath: sampleMealImages[(dayOffset + userIdx) % sampleMealImages.length],
              caption: dayOffset === 0 ? 'Avocado toast & egg scramble' : 'Oats & berries bowl',
              loggedAt: new Date(d.setHours(8, 30)),
            },
            {
              type: 'lunch' as const,
              imagePath: sampleMealImages[(dayOffset + userIdx + 1) % sampleMealImages.length],
              caption: dayOffset === 0 ? 'Grilled chicken rice power bowl' : 'Salmon & greens salad',
              loggedAt: new Date(d.setHours(13, 15)),
            },
          ]
        : [];

      const workout = shouldLogWorkout
        ? workoutsList[(dayOffset + userIdx) % workoutsList.length]
        : undefined;

      const baseCardio = cardioTemplates[(dayOffset + userIdx) % cardioTemplates.length];
      const cardio = shouldLogCardio
        ? {
            ...baseCardio,
            durationMinutes: baseCardio.durationMinutes + (dayOffset % 3) * 2,
          }
        : {
            activityType: 'running' as const,
            distanceKm: 0,
            durationMinutes: 0,
            pace: '',
            inclinePercentage: 0,
            stairmasterFloors: 0,
            stairmasterLevel: 0,
            heartRateAvg: 0,
            caloriesBurned: 0,
          };

      const completedCount =
        (meals.length > 0 ? 1 : 0) +
        (shouldLogCardio && (cardio.distanceKm > 0 || (cardio.stairmasterFloors && cardio.stairmasterFloors > 0)) ? 1 : 0) +
        (shouldLogSelfie ? 1 : 0) +
        (workout ? 1 : 0);

      const completionScore = Math.round((completedCount / 4) * 100);

      const coachFeedback =
        dayOffset === 1
          ? {
              message: 'Incredible work on the incline treadmill & heavy push lifts! Recovery drink ready.',
              reactionEmoji: '🔥',
              createdAt: new Date(d.setHours(20, 0)),
            }
          : undefined;

      sampleLogs.push({
        _id: `log-${user._id}-${dateStr}`,
        clientId: user._id,
        date: dateStr,
        workout,
        meals,
        running: cardio,
        cardio,
        postWorkoutPhoto: shouldLogSelfie
          ? sampleSelfies[(dayOffset + userIdx) % sampleSelfies.length]
          : '',
        voiceNoteUrl: dayOffset === 0 ? 'sample-voicenote.webm' : undefined,
        steps: Math.round((user.targetDailySteps || 10000) * (0.8 + (dayOffset % 4) * 0.1)),
        isComplete: completedCount >= 3,
        completionScore,
        notes: dayOffset === 0 ? 'Energy levels were top tier. Hydration: 3.5L water.' : '',
        coachFeedback,
        createdAt: new Date(d.setHours(18, 0)),
        updatedAt: new Date(d.setHours(18, 0)),
      });
    }
  });

  return { sampleUsers, sampleLogs };
}

// POST /api/seed - Preloads mock data for instant exploration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { sampleUsers, sampleLogs } = generateSeedData();

    if (MemoryStore.isUsingMemory()) {
      MemoryStore.users = sampleUsers;
      MemoryStore.logs = sampleLogs;
      return res.status(200).json({
        success: true,
        message: 'Successfully seeded in-memory store with muscle group workouts & voice notes',
        userCount: sampleUsers.length,
        logCount: sampleLogs.length,
      });
    }

    await User.deleteMany({});
    await DailyLog.deleteMany({});

    await User.insertMany(sampleUsers);
    await DailyLog.insertMany(sampleLogs);

    res.status(200).json({
      success: true,
      message: 'Successfully seeded database with muscle group workouts & voice notes',
      userCount: sampleUsers.length,
      logCount: sampleLogs.length,
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
