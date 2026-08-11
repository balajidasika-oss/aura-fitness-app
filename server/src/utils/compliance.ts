export interface DayStatus {
  date: string;
  dayName: string;
  score: number;
  hasWorkout: boolean;
  hasMeals: boolean;
  hasRun: boolean;
  hasSelfie: boolean;
  workoutTitle?: string;
  runKm: number;
  runMins: number;
  inclinePercentage?: number;
  stairmasterFloors?: number;
  isRestDay?: boolean;
  status: 'complete' | 'partial' | 'missed';
}

export interface ComplianceSummary {
  score: number; // 0 to 100
  tier: 'green' | 'yellow' | 'red';
  streak: number;
  weeklyHistory: DayStatus[];
  loggedDaysCount: number;
  totalKmRan: number;
  averageKmPerRun: number;
  totalStairmasterFloors?: number;
}

export function calculateClientCompliance(logs: any[]): ComplianceSummary {
  const today = new Date();
  const dayStatuses: DayStatus[] = [];
  let totalScoreSum = 0;
  let totalKmRan = 0;
  let runCount = 0;
  let totalStairmasterFloors = 0;
  let loggedDaysCount = 0;

  // Generate last 7 days (from 6 days ago to today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const log = logs.find((l) => l.date === dateStr);

    if (log) {
      let hasWorkout = Boolean(log.workout && log.workout.title && log.workout.title.trim().length > 0);
      const hasMeals = Array.isArray(log.meals) && log.meals.length > 0;
      
      const cardio = log.cardio || log.running || {};
      const runKm = Number(cardio.distanceKm) || 0;
      const runMins = Number(cardio.durationMinutes) || 0;
      const inclinePercentage = Number(cardio.inclinePercentage) || 0;
      const stairmasterFloors = Number(cardio.stairmasterFloors) || 0;
      
      let hasRun = runKm > 0 || stairmasterFloors > 0 || runMins > 0;
      const hasSelfie = Boolean(log.postWorkoutPhoto && log.postWorkoutPhoto.length > 0);
      const isRestDay = Boolean(log.isRestDay);

      if (isRestDay) {
        // Waive the workout and cardio requirement for rest days
        hasWorkout = true;
        hasRun = true;
      }

      let score = 0;
      if (hasWorkout) score += 25;
      if (hasMeals) score += 25;
      if (hasRun) score += 25;
      if (hasSelfie) score += 25;
      score = Math.min(100, score);

      totalScoreSum += score;
      if (runKm > 0) {
        totalKmRan += runKm;
        runCount++;
      }
      if (stairmasterFloors > 0) {
        totalStairmasterFloors += stairmasterFloors;
      }
      if (score > 0) loggedDaysCount++;

      dayStatuses.push({
        date: dateStr,
        dayName,
        score,
        hasWorkout,
        hasMeals,
        hasRun,
        hasSelfie,
        workoutTitle: log.workout?.title,
        isRestDay,
        runKm,
        runMins,
        inclinePercentage,
        stairmasterFloors,
        status: score >= 75 ? 'complete' : score > 0 ? 'partial' : 'missed',
      });
    } else {
      dayStatuses.push({
        date: dateStr,
        dayName,
        score: 0,
        hasWorkout: false,
        hasMeals: false,
        hasRun: false,
        hasSelfie: false,
        runKm: 0,
        runMins: 0,
        inclinePercentage: 0,
        stairmasterFloors: 0,
        status: 'missed',
      });
    }
  }

  const overallScore = Math.round(totalScoreSum / 7);

  let tier: 'green' | 'yellow' | 'red' = 'red';
  if (overallScore >= 75) tier = 'green';
  else if (overallScore >= 45) tier = 'yellow';

  // Calculate current streak (consecutive days with >0 score ending today or yesterday)
  let streak = 0;
  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    if (dayStatuses[i].score > 0) {
      streak++;
    } else if (i === dayStatuses.length - 1) {
      // today hasn't been logged yet, continue to check yesterday
      continue;
    } else {
      break;
    }
  }

  const averageKmPerRun = runCount > 0 ? Number((totalKmRan / runCount).toFixed(1)) : 0;

  return {
    score: overallScore,
    tier,
    streak,
    weeklyHistory: dayStatuses,
    loggedDaysCount,
    totalKmRan: Number(totalKmRan.toFixed(1)),
    averageKmPerRun,
    totalStairmasterFloors,
  };
}
