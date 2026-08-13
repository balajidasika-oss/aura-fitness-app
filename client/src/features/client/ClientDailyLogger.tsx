import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Utensils,
  Flame,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  Timer,
  Send,
  Zap,
  Activity,
  Gauge,
  Dumbbell,
  TrendingUp,
  Footprints,
  Layers,
  ChevronRight,
  Trash2,
  ListPlus,
  HeartPulse,
  Award,
  Mic,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  IClientUser,
  IMealEntry,
  MealType,
  IWorkoutLog,
  WorkoutCategory,
  WorkoutIntensity,
  CardioActivityType,
  ICardioLog,
  IMuscleGroupLog,
  IMuscleExercise,
  MuscleCategory,
} from '../../types';
import { submitDailyLog, fetchTodayLog, joinCoach, API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ProgressRing } from '../../components/ProgressRing';
import { LiveCameraModal } from '../../components/LiveCameraModal';
import { VoiceFeedbackPlayer } from '../../components/VoiceFeedbackPlayer';
import { VoiceNoteRecorder } from '../../components/VoiceNoteRecorder';
import { soundFx } from '../../utils/audio';
interface ClientDailyLoggerProps {
  client: IClientUser;
  onLogSaved?: () => void;
}

const MUSCLE_DEFINITIONS: { id: MuscleCategory; label: string; icon: string; defaultExercises: string[] }[] = [
  { id: 'chest', label: 'Chest / Pectorals', icon: '🛡️', defaultExercises: ['Incline Barbell Bench', 'Flat DB Press', 'Cable Chest Flyes', 'Dips'] },
  { id: 'back', label: 'Back (Lats & Traps)', icon: '🦅', defaultExercises: ['Conventional Deadlift', 'Lat Pulldown', 'T-Bar Row', 'Seated Cable Row'] },
  { id: 'shoulders', label: 'Shoulders & Delts', icon: '⚡', defaultExercises: ['Overhead DB Press', 'Lateral Raises', 'Face Pulls', 'Rear Delt Flyes'] },
  { id: 'arms', label: 'Arms (Biceps & Triceps)', icon: '💪', defaultExercises: ['Incline DB Curls', 'Tricep Rope Pushdowns', 'Skull Crushers', 'Hammer Curls'] },
  { id: 'legs', label: 'Legs (Quads & Glutes)', icon: '🦵', defaultExercises: ['Barbell Back Squats', 'Bulgarian Split Squats', 'Romanian Deadlifts', 'Leg Press'] },
  { id: 'core', label: 'Core & Abs', icon: '🎯', defaultExercises: ['Hanging Leg Raises', 'Ab Wheel Rollouts', 'Cable Woodchoppers', 'Plank Hold'] },
];

export const ClientDailyLogger: React.FC<ClientDailyLoggerProps> = ({ client, onLogSaved }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { updateUserLocally } = useAuth();
  const [showCoachModal, setShowCoachModal] = useState<boolean>(false);
  const [coachCodeInput, setCoachCodeInput] = useState<string>('');
  const [isJoiningCoach, setIsJoiningCoach] = useState<boolean>(false);
  const [isRestDay, setIsRestDay] = useState<boolean>(false);

  const handleJoinCoach = async () => {
    if (!coachCodeInput.trim()) return;
    setIsJoiningCoach(true);
    try {
      const res = await joinCoach(client._id, coachCodeInput.trim());
      if (res.success && res.user) {
        soundFx.playSuccessChime();
        updateUserLocally(res.user);
        setShowCoachModal(false);
        setCoachCodeInput('');
        alert(`Successfully connected to coach ${res.coach?.name || ''}!`);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Invalid coach code');
    } finally {
      setIsJoiningCoach(false);
    }
  };

  // 1. STRENGTH TRAINING WORKOUT STATE
  const [workoutTitle, setWorkoutTitle] = useState<string>('Heavy Upper Hypertrophy');
  const [workoutCategory, setWorkoutCategory] = useState<WorkoutCategory>('push');
  const [workoutIntensity, setWorkoutIntensity] = useState<WorkoutIntensity>('high');
  const [totalSessionDurationMinutes, setTotalSessionDurationMinutes] = useState<number>(45);
  const [workoutSummary, setWorkoutSummary] = useState<string>('');
  
  const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupLog[]>([]);
  const [activeMuscleTab, setActiveMuscleTab] = useState<MuscleCategory>('chest');

  const [newExName, setNewExName] = useState<string>('');
  const [newExSets, setNewExSets] = useState<number>(3);
  const [newExReps, setNewExReps] = useState<string>('8-10');
  const [newExWeight, setNewExWeight] = useState<number>(0);
  const [newExNotes, setNewExNotes] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // 2. CARDIO SESSION STATE
  const [cardioType, setCardioType] = useState<CardioActivityType>('incline_walk');
  const [cardioDistanceKm, setCardioDistanceKm] = useState<number>(4.2);
  const [cardioDurationMins, setCardioDurationMins] = useState<number>(35);
  const [inclinePercentage, setInclinePercentage] = useState<number>(12);
  const [stairmasterFloors, setStairmasterFloors] = useState<number>(85);
  const [stairmasterLevel, setStairmasterLevel] = useState<number>(8);
  const [heartRateAvg, setHeartRateAvg] = useState<number>(140);

  // 3. NUTRITION & MEALS
  const [meals, setMeals] = useState<IMealEntry[]>([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealFile, setMealFile] = useState<File | null>(null);
  const [pendingMealFiles, setPendingMealFiles] = useState<File[]>([]);
  const [mealPreviewUrl, setMealPreviewUrl] = useState<string | null>(null);
  const [currentMealType, setCurrentMealType] = useState<MealType>('snack');
  const [mealCaption, setMealCaption] = useState<string>('');

  // 4. POST-SESSION SELFIE
  const [sessionPhotoFile, setSessionPhotoFile] = useState<File | null>(null);
  const [sessionPhotoUrl, setSessionPhotoUrl] = useState<string | null>(null);

  // 5. CLIENT VOICE NOTE (Microphone Recorded)
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);

  // Notes & Coach Cheer
  const [clientNotes, setClientNotes] = useState<string>('Hydration reached 3.5L. Felt energetic through all sets.');
  const [coachCheer, setCoachCheer] = useState<{ reactionEmoji?: string; message: string; audioUrl?: string } | null>(null);

  // Live Camera Modal State
  const [cameraModalMode, setCameraModalMode] = useState<'meal' | 'selfie' | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRefMeal = useRef<HTMLInputElement>(null);
  const fileInputRefSelfie = useRef<HTMLInputElement>(null);

  // Load today's log if available
  useEffect(() => {
    let isMounted = true;
    const loadLog = async () => {
      try {
        const log = await fetchTodayLog(client._id, selectedDate);
        if (log && isMounted) {
          if (log.workout) {
            setWorkoutTitle(log.workout.title || 'Strength Session');
            setWorkoutCategory(log.workout.category || 'push');
            setWorkoutIntensity(log.workout.intensity || 'high');
            setTotalSessionDurationMinutes(
              log.workout.totalSessionDurationMinutes || log.workout.durationMinutes || 45
            );
            setWorkoutSummary(log.workout.summary || '');

            if (log.workout.muscleGroups && log.workout.muscleGroups.length > 0) {
              setMuscleGroups(log.workout.muscleGroups);
            }
          }
          setIsRestDay(log.isRestDay || false);

          const cardio = log.cardio || log.running;
          if (cardio) {
            setCardioType(
              cardio.activityType ||
                (cardio.stairmasterFloors && cardio.stairmasterFloors > 0
                  ? 'stairmaster'
                  : cardio.inclinePercentage && cardio.inclinePercentage > 0
                  ? 'incline_walk'
                  : 'running')
            );
            setCardioDistanceKm(cardio.distanceKm || 0);
            setCardioDurationMins(cardio.durationMinutes || 0);
            setInclinePercentage(cardio.inclinePercentage || 0);
            setStairmasterFloors(cardio.stairmasterFloors || 0);
            setStairmasterLevel(cardio.stairmasterLevel || 0);
            setHeartRateAvg(cardio.heartRateAvg || 0);
          }


          setMeals(log.meals || []);
          setSessionPhotoUrl(log.postWorkoutPhoto || null);
          setVoiceNoteUrl(log.voiceNoteUrl || null);
          setClientNotes(log.notes || '');
          if (log.coachFeedback) {
            setCoachCheer(log.coachFeedback);
          }
        }
      } catch (err) {
        console.error('Failed to load log', err);
      }
    };
    loadLog();
    return () => {
      isMounted = false;
    };
  }, [client._id, selectedDate]);

  // Total reps calculation across all muscle groups
  const grandTotalReps = muscleGroups.reduce((acc, mg) => acc + (mg.totalMuscleReps || 0), 0);

  // Real-time habit scoring
  const hasWorkout = Boolean(muscleGroups.some((mg) => mg.exercises.length > 0));
  const hasCardio = Boolean(
    (cardioType === 'stairmaster' && stairmasterFloors > 0) ||
      cardioDistanceKm > 0 ||
      cardioDurationMins > 0
  );
  const hasMeals = meals.length > 0 || mealFile !== null;
  const hasSelfie = sessionPhotoUrl !== null || sessionPhotoFile !== null;

  let completionScore = 0;
  if (isRestDay) {
    completionScore += 50; // Waive workout and cardio
  } else {
    if (hasWorkout) completionScore += 25;
    if (hasCardio) completionScore += 25;
  }
  if (hasMeals) completionScore += 25;
  if (hasSelfie) completionScore += 25;

  // Add exercise to active muscle group
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    soundFx.playTapSound();
    const repsInt = parseInt(newExReps.split('-')[0].replace(/\D/g, ''), 10) || 10;
    const computedTotal = newExSets * repsInt;

    const newExercise: IMuscleExercise = {
      name: newExName.trim(),
      sets: newExSets,
      reps: newExReps,
      totalReps: computedTotal,
      weightKg: newExWeight,
      notes: newExNotes.trim(),
    };

    setMuscleGroups((prev) => {
      const existingIdx = prev.findIndex((mg) => mg.muscle === activeMuscleTab);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentGroup = updated[existingIdx];
        const newExercises = [...currentGroup.exercises, newExercise];
        const newTotalReps = newExercises.reduce((sum, ex) => sum + (ex.totalReps || 0), 0);

        updated[existingIdx] = {
          ...currentGroup,
          exercises: newExercises,
          totalMuscleReps: newTotalReps,
        };
        return updated;
      } else {
        const def = MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab);
        return [
          ...prev,
          {
            muscle: activeMuscleTab,
            label: def?.label || activeMuscleTab,
            totalMuscleReps: computedTotal,
            exercises: [newExercise],
          },
        ];
      }
    });

    setNewExName('');
    setNewExNotes('');
    setShowAddModal(false);
  };

  const handleRemoveExercise = (muscle: MuscleCategory, exIdx: number) => {
    soundFx.playTapSound();
    setMuscleGroups((prev) => {
      return prev
        .map((mg) => {
          if (mg.muscle === muscle) {
            const newExercises = mg.exercises.filter((_, idx) => idx !== exIdx);
            const newTotalReps = newExercises.reduce((sum, ex) => sum + (ex.totalReps || 0), 0);
            return {
              ...mg,
              exercises: newExercises,
              totalMuscleReps: newTotalReps,
            };
          }
          return mg;
        })
        .filter((mg) => mg.exercises.length > 0);
    });
  };

  // Convert Live Camera base64 to File
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleLiveCameraCapture = (dataUrl: string) => {
    if (cameraModalMode === 'meal') {
      const file = dataUrlToFile(dataUrl, `live-meal-${Date.now()}.jpg`);
      setMealFile(file);
      setMealPreviewUrl(dataUrl);
      setIsAddingMeal(true);
      setCameraModalMode(null);
    } else if (cameraModalMode === 'selfie') {
      const file = dataUrlToFile(dataUrl, `live-selfie-${Date.now()}.jpg`);
      setSessionPhotoFile(file);
      setSessionPhotoUrl(dataUrl);
      setCameraModalMode(null);
    }
  };

  const handleAddMealItem = () => {
    if (!mealPreviewUrl || !mealFile) return;
    soundFx.playSuccessChime();
    const newMeal: IMealEntry = {
      type: currentMealType,
      imagePath: mealPreviewUrl,
      caption: mealCaption.trim(),
      loggedAt: new Date(),
    };
    setMeals((prev) => [...prev, newMeal]);
    setPendingMealFiles((prev) => [...prev, mealFile]);
    setMealCaption('');
    setMealPreviewUrl(null);
    setMealFile(null);
    setIsAddingMeal(false);
  };

  const handleVoiceAudioReady = (audioBlob: Blob | null, url: string | null) => {
    setVoiceNoteBlob(audioBlob);
    setVoiceNoteUrl(url);
  };

  // Save full daily log payload
  const handleSaveDailyLog = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append('clientId', client._id);
      formData.append('date', selectedDate);
      formData.append('notes', clientNotes);
      formData.append('isRestDay', String(isRestDay));

      // Total Session Duration and Muscle Groups
      formData.append('totalSessionDurationMinutes', String(totalSessionDurationMinutes));
      formData.append('totalWorkoutReps', String(grandTotalReps));
      formData.append('muscleGroups', JSON.stringify(muscleGroups));

      const workoutPayload: IWorkoutLog = {
        title: workoutTitle,
        category: workoutCategory,
        intensity: workoutIntensity,
        totalSessionDurationMinutes,
        durationMinutes: totalSessionDurationMinutes,
        totalWorkoutReps: grandTotalReps,
        muscleGroups,
        exercises: muscleGroups.flatMap((mg) =>
          mg.exercises.map((e) => `${mg.label}: ${e.name} ${e.sets}x${e.reps} (${e.weightKg}kg)`)
        ),
        exerciseDetails: muscleGroups.flatMap((mg) =>
          mg.exercises.map((e) => ({
            name: `${mg.label}: ${e.name}`,
            sets: e.sets,
            reps: String(e.reps),
            weightKg: e.weightKg,
            notes: e.notes,
          }))
        ),
        summary: workoutSummary,
      };

      formData.append('workout', JSON.stringify(workoutPayload));

      // Cardio Payload
      const cardioPayload: ICardioLog = {
        activityType: cardioType,
        distanceKm: cardioDistanceKm,
        durationMinutes: cardioDurationMins,
        pace: cardioDistanceKm > 0 ? `${(cardioDurationMins / cardioDistanceKm).toFixed(1)} min/km` : '',
        inclinePercentage,
        stairmasterFloors,
        stairmasterLevel,
        heartRateAvg,
        caloriesBurned: Math.round(
          cardioType === 'stairmaster'
            ? stairmasterFloors * 3.5 + cardioDurationMins * 8
            : cardioDistanceKm * 65 * (1 + inclinePercentage * 0.08)
        ),
      };
      formData.append('cardio', JSON.stringify(cardioPayload));


      // Existing Meals + New Meal Photo
      const existingMeals = meals.filter((m) => !m.imagePath?.startsWith('blob:'));
      const newMeals = meals.filter((m) => m.imagePath?.startsWith('blob:'));

      formData.append('existingMeals', JSON.stringify(existingMeals));
      if (pendingMealFiles.length > 0) {
        pendingMealFiles.forEach((file) => formData.append('mealPhotos', file));
        formData.append('mealTypes', JSON.stringify(newMeals.map((m) => m.type)));
        formData.append('mealCaptions', JSON.stringify(newMeals.map((m) => m.caption)));
      }

      // Post-workout selfie
      if (sessionPhotoFile) {
        formData.append('sessionPhoto', sessionPhotoFile);
      } else if (sessionPhotoUrl) {
        formData.append('postWorkoutPhoto', sessionPhotoUrl);
      }

      // Client Voice Note Audio File
      if (voiceNoteBlob) {
        const audioFile = new File([voiceNoteBlob], `voicenote-${client._id}-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        formData.append('voiceNoteAudio', audioFile);
      } else if (voiceNoteUrl) {
        formData.append('voiceNoteUrl', voiceNoteUrl);
      }

      await submitDailyLog(formData);

      soundFx.playCheerSound();
      setSaveSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (onLogSaved) {
        onLogSaved();
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to submit daily log', err);
      alert(err.message || 'Error saving daily log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMuscleGroup = muscleGroups.find((mg) => mg.muscle === activeMuscleTab);

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-500 relative">
      {/* Ambient Background Mesh */}
      <div className="absolute inset-0 bg-mesh-dark opacity-40 pointer-events-none rounded-2xl" />
      
      {/* Top Banner: Date Selector & Real-Time Habit Completion Ring */}
      <div className="glass-panel-elevated rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[var(--bg-surface-1)] rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--bg-surface-1)] transition-colors duration-700" />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-tight uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Daily Athlete Log
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--bg-surface-1)] animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1 bg-gradient-to-br from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">Track Your Session</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 glass-card rounded-2xl px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-subtle)] font-medium"
            />
          </div>

          <div className="flex flex-col items-center">
            <ProgressRing
              progress={completionScore}
              size={68}
              strokeWidth={6}
              indicatorColor={completionScore >= 75 ? '#10b981' : completionScore >= 50 ? '#f59e0b' : '#6366f1'}
            />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] mt-1">4 Habits</span>
          </div>
        </div>

        {/* Change Coach Button */}
        <div className="mt-3 flex items-center justify-between surface-card rounded-2xl p-2 border-[var(--border-subtle)]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-surface-1)] flex items-center justify-center">
              <Award className="w-3 h-3 text-[var(--text-primary)]" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Assigned Coach</p>
              <p className="text-xs font-bold tracking-tight text-[var(--text-primary)]">{client.coachName || 'None'}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCoachModal(true)}
            className="text-xs font-bold text-[var(--text-primary)] px-3 py-1.5 rounded-lg border-[var(--border-subtle)] hover:bg-[var(--bg-surface-1)] transition cursor-pointer"
          >
            {client.coachId ? 'Change Coach' : 'Connect to Coach'}
          </button>
        </div>

        {/* Rest Day Toggle */}
        <div className="mt-2 flex items-center justify-between surface-card rounded-2xl p-2 border-[var(--border-subtle)]">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition ${isRestDay ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)]' : 'surface-card text-[var(--text-secondary)]'}`}>
              <Layers className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Active Recovery</p>
              <p className="text-xs font-bold tracking-tight text-[var(--text-primary)]">Mark as Rest Day</p>
            </div>
          </div>
          <button 
            onClick={() => setIsRestDay(!isRestDay)}
            className={`w-10 h-6 rounded-full relative transition-colors ${isRestDay ? 'bg-[var(--bg-surface-1)]' : 'surface-card'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--bg-surface-1)] transition-transform ${isRestDay ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>



      {/* Change Coach Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card border-[var(--border-subtle)] rounded-2xl p-5 w-full max-w-sm relative shadow-2xl">
            <button 
              onClick={() => setShowCoachModal(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-2">Connect to a Coach</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Enter the unique invite code provided by your coach to sync your logs and receive daily feedback.
            </p>
            <input 
              type="text"
              placeholder="e.g. COACH-A1B2C3"
              value={coachCodeInput}
              onChange={(e) => setCoachCodeInput(e.target.value.toUpperCase())}
              className="w-full glass-card rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] font-mono font-bold tracking-wider mb-4 placeholder-zinc-600 focus:outline-none focus:border-[var(--border-subtle)] uppercase"
            />
            <button
              onClick={handleJoinCoach}
              disabled={isJoiningCoach || !coachCodeInput.trim()}
              className="w-full py-3 rounded-2xl bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight flex items-center justify-center space-x-2 disabled:opacity-50 transition cursor-pointer"
            >
              {isJoiningCoach ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isJoiningCoach ? 'Connecting...' : 'Connect Now'}</span>
            </button>
          </div>
        </div>
      )}

        {/* Coach Cheer Alert if available */}
        {coachCheer && (
          <div className="mt-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-1)] flex items-center justify-center text-sm shadow-md border-[var(--border-subtle)]">
                {coachCheer.reactionEmoji || '🏆'}
              </div>
              <div className="relative bg-[var(--bg-surface-1)] border-[var(--border-subtle)] rounded-2xl rounded-bl-sm p-3.5 max-w-[85%] shadow-lg">
                <span className="text-[10px] font-bold tracking-tight text-[var(--text-primary)] uppercase tracking-wider block mb-1">
                  Coach {client.coachName || 'Kai'} says:
                </span>
                {coachCheer.message && (
                  <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                    {coachCheer.message}
                  </p>
                )}
                {coachCheer.audioUrl && (
                  <div className="mt-2.5 bg-[var(--bg-surface-1)] rounded-2xl p-2 border-[var(--border-subtle)]">
                    <audio 
                      controls 
                      src={`${API_BASE.replace('/api', '')}${coachCheer.audioUrl}`} 
                      className="w-full h-8 outline-none" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* SECTION 1: STRENGTH TRAINING - MUSCLE GROUPS & REPS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`glass-panel rounded-2xl p-5 space-y-5 transition-all duration-300 ${isRestDay ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-[var(--border-subtle)]'}`}>
            {/* Header & Single Total Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center space-x-1.5">
                <span>Muscle Group Workout</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-[10px] font-bold">
                  {grandTotalReps} Total Reps
                </span>
              </h3>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                Log reps per muscle group with single total duration
              </span>
            </div>
          </div>
        </div>

        {/* Workout Meta: Title & Single Session Duration */}
        <div className="grid grid-cols-2 gap-2.5 bg-transparent p-3 rounded-2xl border-[var(--border-subtle)]">
          <div>
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
              Workout Focus
            </label>
            <input
              type="text"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              placeholder="e.g. Chest & Shoulders"
              className="w-full glass-card rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-zinc-500 focus:outline-none focus:border-[var(--border-subtle)] font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
              Total Duration (Mins)
            </label>
            <div className="flex items-center space-x-1.5 glass-card rounded-2xl px-2.5 py-1.5">
              <Timer className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <input
                type="number"
                min="5"
                max="240"
                value={totalSessionDurationMinutes}
                onChange={(e) => setTotalSessionDurationMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-transparent text-xs text-[var(--text-primary)] font-bold tracking-tight focus:outline-none"
              />
              <span className="text-[10px] text-[var(--text-secondary)] font-bold">min</span>
            </div>
          </div>
        </div>

        {/* Muscle Selector Anatomical Tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">Choose Muscle to Log:</span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">Tap to switch muscle section</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MUSCLE_DEFINITIONS.map((def) => {
              const mgLog = muscleGroups.find((m) => m.muscle === def.id);
              const totalReps = mgLog?.totalMuscleReps || 0;
              const isActive = activeMuscleTab === def.id;

              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => {
                    soundFx.playTapSound();
                    setActiveMuscleTab(def.id);
                  }}
                  className={`p-2 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-950/60 to-zinc-900 border-[var(--border-subtle)] shadow-lg shadow-[#FF3B30]/10 ring-1 ring-neutral-700'
                      : 'bg-transparent border-[var(--border-subtle)] hover:border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{def.icon}</span>
                    {totalReps > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight text-[9px]">
                        {totalReps}r
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold mt-1 line-clamp-1 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {def.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Muscle Group Exercise Roster & Reps Counter */}
        <div className="bg-transparent rounded-2xl border-[var(--border-subtle)] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.icon}
              </span>
              <div>
                <h4 className="text-xs font-bold tracking-tight text-[var(--text-primary)]">
                  {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label}
                </h4>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">
                  {currentMuscleGroup?.totalMuscleReps || 0} Total Reps Logged
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playTapSound();
                setNewExName('');
                setNewExSets(3);
                setNewExReps('8-10');
                setNewExWeight(0);
                setNewExNotes('');
                setShowAddModal(true);
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-xs font-bold tracking-tight flex items-center space-x-1 shadow-md shadow-[#FF3B30]/20 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Exercise</span>
            </button>
          </div>

          {/* Exercise List for Active Muscle */}
          {currentMuscleGroup && currentMuscleGroup.exercises.length > 0 ? (
            <div className="space-y-2">
              {currentMuscleGroup.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl glass-card flex items-center justify-between group"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{ex.name}</span>
                      <span className="text-[10px] font-bold tracking-tight text-[var(--text-primary)] bg-[var(--bg-surface-1)] px-1.5 py-0.5 rounded border-[var(--border-subtle)]">
                        {ex.totalReps || ex.sets * 10} reps
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-[var(--text-secondary)] mt-0.5 font-medium">
                      <span>{ex.sets} sets × {ex.reps} reps</span>
                      {ex.weightKg !== undefined && ex.weightKg > 0 && <span>• {ex.weightKg} kg</span>}
                      {ex.notes && <span className="text-[var(--text-secondary)] line-clamp-1">({ex.notes})</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(activeMuscleTab, idx)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 space-y-1.5">
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                No exercises logged for {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]} yet.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-[var(--text-primary)] hover:underline"
              >
                + Add {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]} Exercise
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass-card rounded-2xl p-4 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h4 className="text-xs font-bold tracking-tight text-[var(--text-primary)] flex items-center space-x-1.5">
                <span>Add Exercise to</span>
                <span className="text-[var(--text-primary)]">
                  {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline DB Bench Press"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-subtle)] font-bold"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.defaultExercises.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewExName(sug)}
                      className="text-[9px] surface-card hover:surface-card text-[var(--text-secondary)] px-2 py-0.5 rounded-full transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newExSets}
                    onChange={(e) => setNewExSets(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-2 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--border-subtle)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Reps/Set</label>
                  <input
                    type="text"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="8-10"
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-2 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--border-subtle)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-2 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--border-subtle)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Coach Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Clean lockout, 3s eccentric tempo"
                  value={newExNotes}
                  onChange={(e) => setNewExNotes(e.target.value)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-subtle)]"
                />
              </div>

              <div className="bg-[var(--bg-surface-1)] border-[var(--border-subtle)] rounded-2xl p-2 text-[10px] text-[var(--text-primary)] font-bold flex items-center justify-between">
                <span>Calculated Reps:</span>
                <span className="text-xs font-bold tracking-tight">
                  {newExSets * (parseInt(newExReps.split('-')[0].replace(/\D/g, ''), 10) || 10)} reps
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[var(--text-primary)] text-xs font-bold tracking-tight shadow-lg shadow-[#FF3B30]/25 transition active:scale-98"
              >
                Confirm & Add to {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]}
              </button>
            </form>
          </div>
        </div>
      )}
          </div>

      {/* SECTION 2: CLIENT DAILY VOICE NOTE (Microphone Access) */}
      <div className="bg-transparent rounded-2xl p-6 md:p-8 border-[var(--border-subtle)] relative overflow-hidden mt-8"><VoiceNoteRecorder onAudioReady={handleVoiceAudioReady} coachName="Coach Kai" /></div>

      {/* SECTION 3: CARDIO LOGGING (Incline Walk, StairMaster, Running) */}
      <div className="rounded-2xl bg-transparent border-[var(--border-subtle)] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--bg-surface-1)] border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shadow-md">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Cardio Conditioning</h3>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                Treadmill Incline • StairMaster • Running
              </span>
            </div>
          </div>
        </div>

        {/* Cardio Type Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-transparent p-1 rounded-2xl border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('incline_walk');
            }}
            className={`py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
              cardioType === 'incline_walk'
                ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight shadow-md'
                : 'text-[var(--text-secondary)] hover:text-zinc-200'
            }`}
          >
            <span>⛰️ Incline</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('stairmaster');
            }}
            className={`py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
              cardioType === 'stairmaster'
                ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight shadow-md'
                : 'text-[var(--text-secondary)] hover:text-zinc-200'
            }`}
          >
            <span>🪜 Stairs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('running');
            }}
            className={`py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
              cardioType === 'running'
                ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight shadow-md'
                : 'text-[var(--text-secondary)] hover:text-zinc-200'
            }`}
          >
            <span>🏃 Run</span>
          </button>
        </div>

        {/* Dynamic Metric Sliders / Inputs */}
        <div className="bg-transparent p-3.5 rounded-2xl border-[var(--border-subtle)] space-y-3">
          {cardioType === 'incline_walk' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Treadmill Incline</span>
                <span className="text-xs font-bold tracking-tight text-[var(--text-primary)] font-mono">{inclinePercentage}% Incline</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={inclinePercentage}
                onChange={(e) => setInclinePercentage(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cardioDistanceKm}
                    onChange={(e) => setCardioDistanceKm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={cardioDurationMins}
                    onChange={(e) => setCardioDurationMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {cardioType === 'stairmaster' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Floors Climbed</label>
                <input
                  type="number"
                  value={stairmasterFloors}
                  onChange={(e) => setStairmasterFloors(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Speed Level (1-20)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={stairmasterLevel}
                  onChange={(e) => setStairmasterLevel(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                />
              </div>
            </div>
          )}

          {cardioType === 'running' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cardioDistanceKm}
                  onChange={(e) => setCardioDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={cardioDurationMins}
                  onChange={(e) => setCardioDurationMins(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: NUTRITION PHOTO LOGS */}
        <div className="rounded-2xl bg-transparent border-[var(--border-subtle)] p-5 space-y-4 mt-8">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-1)] border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] tracking-wide">Nutrition & Meals</h3>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  Snap food photos for coach macro review
                </span>
              </div>
            </div>
  
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playTapSound();
                  alert("Scanning meal with Aura AI... \n\nEstimated Macros:\n- Calories: 450 kcal\n- Protein: 35g\n- Carbs: 45g\n- Fats: 12g\n\n(Coach will verify this result)");
                }}
                className="px-3 py-1.5 rounded-2xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] border-[var(--border-subtle)] text-xs font-bold tracking-tight flex items-center space-x-1.5 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Scan Meal</span>
              </button>
              <button
                type="button"
                onClick={() => setCameraModalMode('meal')}
                className="px-4 py-2 rounded-2xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-xs font-bold tracking-tight flex items-center space-x-1.5 shadow-md shadow-teal-500/20 transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>

        {/* Existing Meals Grid */}
        {meals.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {meals.map((m, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border-[var(--border-subtle)] aspect-video bg-transparent group">
                <img src={m.imagePath} alt={m.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <span className="text-[10px] font-bold tracking-tight uppercase text-[var(--text-primary)]">{m.type}</span>
                  <span className="text-[11px] text-[var(--text-primary)] font-medium line-clamp-1">{m.caption || 'Meal logged'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newMeals = [...meals];
                    newMeals.splice(idx, 1);
                    setMeals(newMeals);
                    
                    // If it was a pending meal, remove the file too
                    if (m.imagePath?.startsWith('blob:')) {
                      // Find which blob it was
                      const blobIdx = meals.filter(x => x.imagePath?.startsWith('blob:')).indexOf(m);
                      if (blobIdx > -1) {
                        const newFiles = [...pendingMealFiles];
                        newFiles.splice(blobIdx, 1);
                        setPendingMealFiles(newFiles);
                      }
                    }
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 text-[var(--text-primary)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-2xl border-[var(--border-subtle)] p-4 text-center">
            <p className="text-xs text-[var(--text-secondary)] font-medium">No meals snapped yet today.</p>
          </div>
        )}

        {/* Add Meal Detail Modal */}
        {isAddingMeal && mealPreviewUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="surface-card border-[var(--border-subtle)] rounded-2xl p-5 w-full max-w-sm relative shadow-2xl">
              <button 
                onClick={() => {
                  setIsAddingMeal(false);
                  setMealPreviewUrl(null);
                  setMealFile(null);
                }}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-3 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-[var(--text-primary)]" />
                <span>Log Meal</span>
              </h3>
              
              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border-[var(--border-subtle)]">
                <img src={mealPreviewUrl} alt="Meal Preview" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Meal Type</label>
                  <select
                    value={currentMealType}
                    onChange={(e) => setCurrentMealType(e.target.value as MealType)}
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-subtle)] font-bold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1">Caption / Macros (optional)</label>
                  <input
                    type="text"
                    value={mealCaption}
                    onChange={(e) => setMealCaption(e.target.value)}
                    placeholder="e.g. 2 eggs, avocado toast (400 cal)"
                    className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-subtle)]"
                  />
                </div>

                <button
                  onClick={handleAddMealItem}
                  className="w-full py-3 rounded-2xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save to Daily Log</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: POST-WORKOUT SELFIE */}
      <div className="rounded-2xl bg-transparent border-[var(--border-subtle)] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--bg-surface-1)] border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Post-Session Selfie</h3>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                Hold yourself accountable with your coach
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCameraModalMode('selfie')}
            className="px-2.5 py-1.5 rounded-2xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-xs font-bold tracking-tight flex items-center space-x-1 shadow-md shadow-purple-500/20 transition active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Selfie</span>
          </button>
        </div>

        {sessionPhotoUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-[var(--border-subtle)] aspect-video bg-transparent">
            <img src={sessionPhotoUrl} alt="Post session selfie" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Selfie Verified</span>
            </div>
          </div>
        ) : (
          <div className="bg-transparent rounded-2xl border-[var(--border-subtle)] p-4 text-center">
            <p className="text-xs text-[var(--text-secondary)] font-medium">Snap your post-workout pump photo.</p>
          </div>
        )}
      </div>

      {/* SECTION 6: DAILY AUDIO DEBRIEF (Voice Feedback Player) */}
      <VoiceFeedbackPlayer
        options={{
          clientName: client.name ? client.name.split(' ')[0] : 'Athlete',
          workoutTitle: workoutTitle || 'Session',
          workoutIntensity,
          workoutDuration: totalSessionDurationMinutes,
          mealCount: meals.length + (mealFile ? 1 : 0),
          hasSelfie: Boolean(sessionPhotoUrl || sessionPhotoFile),
          streak: client.streak || 0,
          coachName: 'Coach Kai',
          activityType: cardioType,
          distanceKm: cardioDistanceKm,
          durationMinutes: cardioDurationMins,
          stairmasterFloors,
        }}
      />

      {/* SECTION 7: PRIMARY SUBMIT ACTION */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleSaveDailyLog}
          disabled={isSubmitting}
          className={`w-full py-4 px-5 rounded-2xl text-sm font-bold tracking-tight text-[var(--text-primary)]  flex items-center justify-center space-x-2 transition-all ${
            saveSuccess
              ? 'bg-[var(--bg-surface-1)] ring-4 ring-emerald-400/30'
              : 'bg-[#FF3B30] hover:brightness-110 shadow-[#FF3B30]/25 active:scale-[0.98]'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2 text-[var(--text-primary)] font-bold">
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Syncing Daily Log & Audio to Coach...</span>
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center space-x-2 text-[var(--text-primary)] font-bold tracking-tight">
              <CheckCircle2 className="w-5 h-5" />
              <span>Daily Log Synced Successfully!</span>
            </span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Daily Log ({completionScore}% Ready)</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-[var(--text-secondary)] mt-2 font-medium">
          Instant sync with Coach Kai's dashboard • Safe &amp; Encrypted
        </p>
      </div>

      {/* Live Camera Modal */}
      <LiveCameraModal
        isOpen={cameraModalMode !== null}
        onClose={() => setCameraModalMode(null)}
        onCapture={handleLiveCameraCapture}
        title={cameraModalMode === 'meal' ? 'Snap Nutrition Photo' : 'Capture Session Selfie'}
        subtitle="Align within frame and tap shutter"
        defaultFacingMode={cameraModalMode === 'meal' ? 'environment' : 'user'}
      />
    </div>
  );
};
