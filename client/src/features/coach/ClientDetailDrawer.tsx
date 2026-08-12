import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Utensils, 
  Zap, 
  Smile, 
  Calendar, 
  Send, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Dumbbell,
  Activity,
  TrendingUp,
  Layers,
  HeartPulse,
  Mic,
  Play,
  Pause,
  Volume2,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { IClientUser, IDailyLog, IMuscleGroupLog } from '../../types';
import { fetchClientDetail, sendCoachCheer } from '../../services/api';
import { ComplianceBadge } from '../../components/ComplianceBadge';
import { VoiceNoteRecorder } from '../../components/VoiceNoteRecorder';
import { soundFx } from '../../utils/audio';

interface ClientDetailDrawerProps {
  clientId: string | null;
  onClose: () => void;
  onRefreshRoster?: () => void;
  onCheerSent?: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  clientId,
  onClose,
  onRefreshRoster,
  onCheerSent,
}) => {
  const triggerRefresh = onRefreshRoster || onCheerSent || (() => {});
  const [clientDetail, setClientDetail] = useState<(IClientUser & { logs: IDailyLog[] }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'workouts' | 'yoga' | 'cardio' | 'voice' | 'meals' | 'selfies' | 'compliance'>('workouts');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [reactionEmoji, setReactionEmoji] = useState<string>('🔥');
  const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);
  const [feedbackSentSuccess, setFeedbackSentSuccess] = useState<boolean>(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  // Audio Playback State for Voice Memos
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let isMounted = true;
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchClientDetail(clientId);
        if (isMounted) setClientDetail(data);
      } catch (err) {
        console.error('Failed to load client detail', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDetail();
    return () => { 
      isMounted = false; 
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [clientId]);

  if (!clientId) return null;

  // Flatten all meal photos
  const allMealsWithDates = clientDetail?.logs?.flatMap((log) =>
    (log.meals || []).map((meal) => ({ meal, date: log.date }))
  ) || [];

  // All selfies
  const allSelfiesWithDates = clientDetail?.logs
    ?.filter((log) => Boolean(log.postWorkoutPhoto))
    ?.map((log) => ({
      photo: log.postWorkoutPhoto!,
      date: log.date,
      notes: log.notes,
      logId: log._id,
    })) || [];

  // All Voice Notes
  const allVoiceNotes = clientDetail?.logs
    ?.filter((log) => Boolean(log.voiceNoteUrl))
    ?.map((log) => ({
      url: log.voiceNoteUrl!,
      date: log.date,
      notes: log.notes,
      logId: log._id,
    })) || [];

  // Latest log ID for sending feedback
  const latestLog = clientDetail?.logs?.[0];

  const togglePlayAudio = (url: string) => {
    soundFx.playTapSound();
    if (playingAudioUrl === url) {
      audioRef.current?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioUrl(url);
      audio.onended = () => setPlayingAudioUrl(null);
      audio.onerror = () => {
        alert('Could not play voice note audio');
        setPlayingAudioUrl(null);
      };
    }
  };

  const handleSendFeedback = async () => {
    try {
      soundFx.playCheerSound();
      setIsSendingFeedback(true);
      await sendCoachCheer(
        clientId, 
        latestLog?._id, 
        reactionEmoji, 
        feedbackText || (voiceBlob ? 'Voice Memo Attached' : 'Great session today!'), 
        voiceBlob || undefined
      );
      setFeedbackText('');
      setVoiceBlob(null);
      setFeedbackSentSuccess(true);
      const refreshed = await fetchClientDetail(clientId);
      setClientDetail(refreshed);
      triggerRefresh();
      setTimeout(() => setFeedbackSentSuccess(false), 3000);
    } catch (err) {
      alert('Failed to send coach cheer');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={clientDetail?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={clientDetail?.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500/60"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">{clientDetail?.name || 'Athlete'}</h3>
                {clientDetail && <ComplianceBadge tier={clientDetail.compliance.tier} score={clientDetail.compliance.score} />}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                {clientDetail?.fitnessGoal} · {clientDetail?.streak || 0}d streak
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'workouts', label: '🏋️ Strength', count: clientDetail?.logs?.filter(l => l.workout?.title || (l.workout?.exercises && l.workout.exercises.length > 0) || (l.workout?.muscleGroups && l.workout.muscleGroups.length > 0)).length || 0 },
            { id: 'yoga', label: '🧘‍♀️ Yoga', count: clientDetail?.logs?.filter(l => l.yoga).length || 0 },
            { id: 'cardio', label: '⚡ Cardio', count: clientDetail?.logs?.filter(l => (l.cardio?.distanceKm && l.cardio.distanceKm > 0) || (l.cardio?.stairmasterFloors && l.cardio.stairmasterFloors > 0) || (l.running?.distanceKm && l.running.distanceKm > 0)).length || 0 },
            { id: 'voice', label: '🎙️ Voice Memos', count: allVoiceNotes.length },
            { id: 'meals', label: '🥗 Food', count: allMealsWithDates.length },
            { id: 'selfies', label: '📸 Selfies', count: allSelfiesWithDates.length },
            { id: 'compliance', label: '📊 Adherence', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playTapSound();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-black/30 text-slate-950 font-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'workouts' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Strength & Muscle Breakdown
                </h4>
                <span className="text-[10px] text-zinc-500">Categorized by Muscle Group</span>
              </div>

              {clientDetail?.logs?.filter(l => l.workout?.title || (l.workout?.exercises && l.workout.exercises.length > 0) || (l.workout?.muscleGroups && l.workout.muscleGroups.length > 0)).length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No strength workouts logged yet.</p>
              ) : (
                clientDetail?.logs
                  ?.filter(l => l.workout?.title || (l.workout?.exercises && l.workout.exercises.length > 0) || (l.workout?.muscleGroups && l.workout.muscleGroups.length > 0))
                  .map((log) => {
                    const w = log.workout;
                    const totalDuration = w?.totalSessionDurationMinutes || w?.durationMinutes || 45;
                    const grandTotalReps = w?.totalWorkoutReps || w?.muscleGroups?.reduce((a, b) => a + (b.totalMuscleReps || 0), 0) || 0;

                    return (
                      <div key={log._id} className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                        {/* Workout Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs">{w?.title || 'Strength Workout'}</h5>
                              <span className="text-[10px] text-zinc-400 font-medium">
                                {log.date} · {totalDuration} mins total · {w?.intensity || 'high'} intensity
                              </span>
                            </div>
                          </div>

                          {grandTotalReps > 0 ? (
                            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              {grandTotalReps} Total Reps
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {w?.category || 'Strength'}
                            </span>
                          )}
                        </div>

                        {/* Muscle Groups Breakdown if Available */}
                        {w?.muscleGroups && w.muscleGroups.length > 0 ? (
                          <div className="space-y-2 pt-1">
                            {w.muscleGroups.map((mg: IMuscleGroupLog, mgIdx: number) => (
                              <div key={mgIdx} className="bg-zinc-950 rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5">
                                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1">
                                  <span className="text-xs font-bold text-zinc-200">{mg.label}</span>
                                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                    {mg.totalMuscleReps} reps
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {mg.exercises.map((ex, exIdx) => (
                                    <div key={exIdx} className="text-xs flex justify-between items-center text-zinc-300">
                                      <div className="flex-1 pr-2">
                                        <span className="font-medium text-white">{ex.name}</span>
                                        {ex.notes && <span className="text-[10px] text-zinc-500 block italic">({ex.notes})</span>}
                                      </div>
                                      <span className="text-emerald-400 font-mono text-[11px] font-bold whitespace-nowrap">
                                        {ex.sets}×{ex.reps} {ex.weightKg ? `@${ex.weightKg}kg` : ''} ({ex.totalReps || ex.sets * 10}r)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : w?.exerciseDetails && w.exerciseDetails.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            {w.exerciseDetails.map((ex, i) => (
                              <div key={i} className="p-2 rounded-xl bg-zinc-950 text-xs flex justify-between items-center">
                                <span className="font-semibold text-zinc-200">{ex.name}</span>
                                <span className="text-emerald-400 font-bold text-[11px]">
                                  {ex.sets} × {ex.reps} {ex.weightKg ? `@ ${ex.weightKg}kg` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
              )}
            </div>
          ) : activeTab === 'voice' ? (
            /* Voice Notes Tab */
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Athlete Voice Memos ({allVoiceNotes.length})
              </h4>
              {allVoiceNotes.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No voice notes recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {allVoiceNotes.map((v, idx) => {
                    const isPlaying = playingAudioUrl === v.url;
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => togglePlayAudio(v.url)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                                isPlaying
                                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                  : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                              }`}
                            >
                              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                            </button>
                            <div>
                              <h5 className="text-xs font-bold text-white">Daily Athlete Debrief</h5>
                              <span className="text-[10px] text-zinc-400">{v.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="w-1.5 h-4 bg-emerald-500/40 rounded-full" />
                            <span className={`w-1.5 h-6 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/40'}`} />
                            <span className={`w-1.5 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/40'}`} />
                            <span className={`w-1.5 h-5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/40'}`} />
                          </div>
                        </div>

                        {v.notes && (
                          <p className="text-[11px] text-zinc-300 italic bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                            "{v.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'yoga' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Yoga & Mobility History</h4>
              {clientDetail?.logs?.filter(l => l.yoga).length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No yoga sessions logged yet.</p>
              ) : (
                clientDetail?.logs?.filter(l => l.yoga).map((log) => {
                  const y = log.yoga;
                  return (
                    <div key={log._id} className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-xs">{y?.title || 'Yoga Session'}</h5>
                            <span className="text-[10px] text-zinc-400 font-medium capitalize">
                              {log.date} · {y?.durationMinutes || 15} mins · {y?.type || 'mobility'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {log.completionScore}% Done
                        </span>
                      </div>
                      {y?.notes && (
                        <p className="text-[11px] text-zinc-300 italic bg-zinc-950 p-2 rounded-xl border border-zinc-800 mt-2">
                          {y.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === 'cardio' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cardio & Conditioning History</h4>
              {clientDetail?.logs?.filter(l => (l.cardio?.distanceKm && l.cardio.distanceKm > 0) || (l.cardio?.stairmasterFloors && l.cardio.stairmasterFloors > 0) || (l.running?.distanceKm && l.running.distanceKm > 0)).map((log) => {
                const c = log.cardio || log.running;
                const isStair = c?.activityType === 'stairmaster' || (c?.stairmasterFloors && c.stairmasterFloors > 0);
                const isIncline = c?.activityType === 'incline_walk' || (c?.inclinePercentage && c.inclinePercentage > 0);

                return (
                  <div key={log._id} className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                          {isStair ? <Layers className="w-4 h-4" /> : isIncline ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-xs">
                            {isStair ? `StairMaster: ${c?.stairmasterFloors || 80} Floors (Lvl ${c?.stairmasterLevel || 8})` : isIncline ? `Incline Treadmill (${c?.inclinePercentage || 10}% Incline)` : `Run / Jog: ${c?.distanceKm || 5} km`}
                          </h5>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {log.date} · {c?.durationMinutes || 30} mins · {c?.pace || '5.2 min/km'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {log.completionScore}% Done
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <span>Heart Rate: <strong className="text-rose-400">{c?.heartRateAvg || 142} bpm</strong></span>
                      <span>Est. Burn: <strong className="text-amber-400">~{c?.caloriesBurned || 320} kcal</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'selfies' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">End-of-Session Selfies</h4>
              {allSelfiesWithDates.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No workout selfies uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {allSelfiesWithDates.map((s, idx) => (
                    <div key={idx} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                      <img src={s.photo} alt="Workout selfie" className="w-full aspect-square object-cover" />
                      <div className="p-2">
                        <span className="text-[10px] font-bold text-zinc-400">{s.date}</span>
                        {s.notes && <p className="text-[10px] text-zinc-300 truncate mt-0.5">{s.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'meals' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Meal Photos History</h4>
              {allMealsWithDates.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No meal photos logged yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {allMealsWithDates.map((m, idx) => (
                    <div key={idx} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                      <img src={m.meal.imagePath} alt={m.meal.caption || m.meal.type} className="w-full aspect-square object-cover" />
                      <div className="p-2">
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded capitalize">
                          {m.meal.type}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-2">{m.date}</span>
                        {m.meal.caption && <p className="text-[10px] text-zinc-300 mt-1">{m.meal.caption}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">7-Day Habit Adherence</h4>
              <div className="grid grid-cols-7 gap-1 bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                {clientDetail?.compliance?.weeklyHistory?.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold">{day.dayName}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      day.status === 'complete'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : day.status === 'partial'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-zinc-950 text-zinc-600 border border-zinc-800'
                    }`}>
                      {day.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coach Quick Send Cheer Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 space-y-2">
          
          <div className="mb-2">
            <VoiceNoteRecorder 
              onAudioReady={(blob) => setVoiceBlob(blob)} 
              title="Record Coach Feedback" 
              subtitle="Send a quick voice tip to this athlete"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['🔥', '💪', '🥗', '⚡', '👏'] as const).map((emoji) => (
              <button
                key={emoji}
                onClick={() => setReactionEmoji(emoji)}
                className={`text-base p-1 rounded-xl transition ${
                  reactionEmoji === emoji ? 'bg-zinc-800 ring-2 ring-emerald-400' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {emoji}
              </button>
            ))}
            <input
              type="text"
              placeholder={voiceBlob ? "Audio attached! Add optional text..." : "Quick cheer message to athlete..."}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSendFeedback}
              disabled={isSendingFeedback || (!feedbackText.trim() && !voiceBlob)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-2 rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
          {feedbackSentSuccess && (
            <span className="text-[10px] text-emerald-400 font-bold block text-center">
              Cheer sent to athlete's feed!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
