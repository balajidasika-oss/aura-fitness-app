import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  CheckCircle2,
  Plus,
  X,
  Timer,
  Send,
  Dumbbell,
  Layers,
  Trash2,
  Award,
  RotateCcw,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  IClientUser,
  IWorkoutLog,
  WorkoutCategory,
  WorkoutIntensity,
  IMuscleGroupLog,
  IMuscleExercise,
  MuscleCategory,
} from '../../types';
import { submitDailyLog, fetchTodayLog, joinCoach, API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ProgressRing } from '../../components/ProgressRing';
import { LiveCameraModal } from '../../components/LiveCameraModal';

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

  const [sessionPhotoFile, setSessionPhotoFile] = useState<File | null>(null);
  const [sessionPhotoUrl, setSessionPhotoUrl] = useState<string | null>(null);

  const [clientNotes, setClientNotes] = useState<string>('Hydration reached 3.5L. Felt energetic through all sets.');
  const [coachCheer, setCoachCheer] = useState<{ reactionEmoji?: string; message: string; audioUrl?: string } | null>(null);

  const [cameraModalMode, setCameraModalMode] = useState<'selfie' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

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

          setSessionPhotoUrl(log.postWorkoutPhoto || null);
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

  const grandTotalReps = muscleGroups.reduce((acc, mg) => acc + (mg.totalMuscleReps || 0), 0);

  const hasWorkout = Boolean(muscleGroups.some((mg) => mg.exercises.length > 0));
  const hasSelfie = sessionPhotoUrl !== null || sessionPhotoFile !== null;

  let completionScore = 0;
  if (isRestDay) {
    completionScore += 100;
  } else {
    if (hasWorkout) completionScore += 50;
    if (hasSelfie) completionScore += 50;
  }

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
    if (cameraModalMode === 'selfie') {
      const file = dataUrlToFile(dataUrl, `live-selfie-${Date.now()}.jpg`);
      setSessionPhotoFile(file);
      setSessionPhotoUrl(dataUrl);
      setCameraModalMode(null);
    }
  };

  const handleSaveDailyLog = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append('clientId', client._id);
      formData.append('date', selectedDate);
      formData.append('notes', clientNotes);
      formData.append('isRestDay', String(isRestDay));

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

      if (sessionPhotoFile) {
        formData.append('sessionPhoto', sessionPhotoFile);
      } else if (sessionPhotoUrl) {
        formData.append('postWorkoutPhoto', sessionPhotoUrl);
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
      <div className="absolute inset-0 bg-mesh-dark opacity-40 pointer-events-none rounded-2xl" />
      
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[var(--bg-surface-1)] rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--bg-surface-2)] transition-colors duration-700" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Daily Athlete Log
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">Track Your Session</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 glass-card rounded-2xl px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-subtle)] font-medium"
            />
          </div>

          <div className="flex flex-col items-center">
            <ProgressRing
              progress={completionScore}
              size={68}
              strokeWidth={6}
              indicatorColor={completionScore === 100 ? '#10b981' : '#6366f1'}
            />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] mt-2">Log Score</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between surface-card rounded-2xl p-3 border border-[var(--border-subtle)] relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-1)] flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Assigned Coach</p>
              <p className="text-xs font-bold tracking-tight text-[var(--text-primary)]">{client.coachName || 'None'}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCoachModal(true)}
            className="text-xs font-bold text-[var(--text-primary)] px-4 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-1)] transition-colors cursor-pointer"
          >
            {client.coachId ? 'Change Coach' : 'Connect to Coach'}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between surface-card rounded-2xl p-3 border border-[var(--border-subtle)] relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRestDay ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)]' : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)]'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Active Recovery</p>
              <p className="text-xs font-bold tracking-tight text-[var(--text-primary)]">Mark as Rest Day</p>
            </div>
          </div>
          <button 
            onClick={() => setIsRestDay(!isRestDay)}
            className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${isRestDay ? 'bg-emerald-500' : 'bg-[var(--bg-surface-1)] border border-[var(--border-subtle)]'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isRestDay ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {showCoachModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="surface-card border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => setShowCoachModal(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-2">Connect to a Coach</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Enter the unique invite code provided by your coach to sync your logs and receive daily feedback.
            </p>
            <input 
              type="text"
              placeholder="e.g. COACH-A1B2C3"
              value={coachCodeInput}
              onChange={(e) => setCoachCodeInput(e.target.value.toUpperCase())}
              className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] font-mono font-bold tracking-wider mb-5 placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-400 uppercase transition-colors"
            />
            <button
              onClick={handleJoinCoach}
              disabled={isJoiningCoach || !coachCodeInput.trim()}
              className="w-full py-3.5 rounded-xl btn-primary text-sm font-bold tracking-tight flex items-center justify-center space-x-2 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              {isJoiningCoach ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isJoiningCoach ? 'Connecting...' : 'Connect Now'}</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {coachCheer && (
        <div className="mt-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-end space-x-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-1)] flex items-center justify-center text-lg shadow-md border border-[var(--border-subtle)]">
              {coachCheer.reactionEmoji || '🏆'}
            </div>
            <div className="relative surface-card border border-[var(--border-subtle)] rounded-2xl rounded-bl-sm p-4 max-w-[85%] shadow-lg">
              <span className="text-[10px] font-bold tracking-tight text-[var(--text-primary)] uppercase tracking-wider block mb-1.5">
                Coach {client.coachName || 'Kai'} says:
              </span>
              {coachCheer.message && (
                <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                  {coachCheer.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`glass-card rounded-2xl p-5 space-y-6 transition-all duration-300 ${isRestDay ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-400 shadow-lg">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center space-x-2">
                  <span>Strength Training</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-2)] text-emerald-400 text-[10px] font-bold">
                    {grandTotalReps} Reps
                  </span>
                </h3>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Log reps per muscle group with single total duration
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[var(--bg-surface-1)] p-3 rounded-2xl border border-[var(--border-subtle)]">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                Workout Focus
              </label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g. Chest & Shoulders"
                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-400 font-bold transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                Duration (Mins)
              </label>
              <div className="flex items-center space-x-2 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 focus-within:border-emerald-400 transition-colors">
                <Timer className="w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={totalSessionDurationMinutes}
                  onChange={(e) => setTotalSessionDurationMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] font-bold tracking-tight focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Muscle:</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Tap to switch</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                      isActive
                        ? 'bg-[var(--bg-surface-2)] border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{def.icon}</span>
                      {totalReps > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold tracking-tight text-[9px] border border-[var(--border-subtle)]">
                          {totalReps}r
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 line-clamp-1 ${isActive ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                      {def.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--bg-surface-1)] rounded-2xl border border-[var(--border-subtle)] p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.icon}
                </span>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                    {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label}
                  </h4>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                    {currentMuscleGroup?.totalMuscleReps || 0} Reps Logged
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
                className="px-3 py-2 rounded-xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-xs font-bold tracking-tight flex items-center space-x-1.5 shadow-md border border-[var(--border-subtle)] transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add</span>
              </button>
            </div>

            {currentMuscleGroup && currentMuscleGroup.exercises.length > 0 ? (
              <div className="space-y-3">
                {currentMuscleGroup.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl surface-card flex items-center justify-between group border border-[var(--border-subtle)]"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{ex.name}</span>
                        <span className="text-[10px] font-bold tracking-tight text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                          {ex.totalReps || ex.sets * 10} reps
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                        <span>{ex.sets} sets × {ex.reps} reps</span>
                        {ex.weightKg !== undefined && ex.weightKg > 0 && <span>• {ex.weightKg} kg</span>}
                        {ex.notes && <span className="text-[var(--text-muted)] line-clamp-1">({ex.notes})</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(activeMuscleTab, idx)}
                      className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Dumbbell className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  No exercises logged for {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]} yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                >
                  + Add Exercise
                </button>
              </div>
            )}
          </div>
        </div>

        {showAddModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-xl p-4 animate-scale-in">
            <div className="surface-card border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center space-x-2">
                  <span>Add Exercise to</span>
                  <span className="text-emerald-400">
                    {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.label.split(' ')[0]}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExercise} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline DB Bench Press"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-400 font-bold transition-colors"
                  />

                  <div className="flex flex-wrap gap-2 mt-3">
                    {MUSCLE_DEFINITIONS.find((m) => m.id === activeMuscleTab)?.defaultExercises.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewExName(sug)}
                        className="text-[10px] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-emerald-400 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full transition-colors font-medium"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newExSets}
                      onChange={(e) => setNewExSets(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-3 text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-emerald-400 transition-colors text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Reps/Set</label>
                    <input
                      type="text"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value)}
                      placeholder="8-10"
                      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-3 text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-emerald-400 transition-colors text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={newExWeight}
                      onChange={(e) => setNewExWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-3 text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-emerald-400 transition-colors text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Coach Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean lockout, 3s eccentric tempo"
                    value={newExNotes}
                    onChange={(e) => setNewExNotes(e.target.value)}
                    className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl p-3 text-[11px] text-[var(--text-primary)] font-bold flex items-center justify-between">
                  <span>Calculated Reps:</span>
                  <span className="text-sm font-bold tracking-tight text-emerald-400">
                    {newExSets * (parseInt(newExReps.split('-')[0].replace(/\D/g, ''), 10) || 10)} reps
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 rounded-xl btn-primary text-sm font-bold tracking-tight shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                >
                  Confirm & Add
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>

      <div className="surface-card rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex items-center justify-center text-violet-400 shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Post-Session Selfie</h3>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">Hold yourself accountable</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCameraModalMode('selfie')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] text-xs font-bold tracking-tight flex items-center space-x-2 shadow-md border border-[var(--border-subtle)] transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-violet-400" />
            <span>Snap</span>
          </button>
        </div>

        {sessionPhotoUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] aspect-video bg-[var(--bg-surface-1)]">
            <img src={sessionPhotoUrl} alt="Post session selfie" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-white/60 backdrop-blur-md text-[var(--text-primary)] text-[10px] font-bold tracking-tight px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-[var(--border-subtle)]">
              <Check className="w-3.5 h-3.5 text-violet-400" />
              <span>Selfie Verified</span>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-surface-1)] rounded-xl border border-[var(--border-subtle)] p-6 text-center">
            <Camera className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Snap your post-workout pump photo.</p>
          </div>
        )}
      </div>

      <div className="pt-4 pb-6">
        <button
          type="button"
          onClick={handleSaveDailyLog}
          disabled={isSubmitting}
          className={`w-full py-4 px-5 rounded-2xl text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center justify-center space-x-2 transition-all duration-300 ${
            saveSuccess
              ? 'bg-[var(--bg-surface-2)] ring-2 ring-emerald-400'
              : 'btn-primary shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Syncing Daily Log...</span>
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center space-x-2 text-emerald-400">
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
        <p className="text-center text-[11px] text-[var(--text-muted)] mt-3 font-medium tracking-wide">
          Instant sync with Coach Kai's dashboard • Safe &amp; Encrypted
        </p>
      </div>

      <LiveCameraModal
        isOpen={cameraModalMode !== null}
        onClose={() => setCameraModalMode(null)}
        onCapture={handleLiveCameraCapture}
        title="Capture Session Selfie"
        subtitle="Align within frame and tap shutter"
        defaultFacingMode="user"
      />
    </div>
  );
};
