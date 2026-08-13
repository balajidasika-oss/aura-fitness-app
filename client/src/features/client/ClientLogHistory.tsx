import React, { useState, useEffect } from 'react';
import { IClientUser, IDailyLog } from '../../types';
import { fetchLogHistory } from '../../services/api';
import { Calendar, Activity, Utensils, Footprints, ShieldCheck, Dumbbell, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ClientLogHistoryProps {
  client: IClientUser;
}

export const ClientLogHistory: React.FC<ClientLogHistoryProps> = ({ client }) => {
  const [logs, setLogs] = useState<IDailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const history = await fetchLogHistory(client._id);
        if (mounted) {
          // Sort descending by date
          const sorted = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLogs(sorted);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [client._id]);

  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    soundFx.playTapSound();
    setExpandedLogId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Training History
          </h2>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Review your past workouts, meals, and coach feedback.
          </p>
        </div>
        <div className="px-4 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-[var(--text-primary)]">{logs.length} Logs Total</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-[var(--bg-surface-1)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log._id;
            const logDate = new Date(log.date);
            const formattedDate = logDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            
            return (
              <div key={log._id} className="glass-panel rounded-2xl overflow-hidden border-[var(--border-subtle)] transition-all duration-300 hover:border-indigo-500/30">
                {/* Header (Always Visible) */}
                <div 
                  onClick={() => toggleExpand(log._id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-surface-1)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      log.isRestDay ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {log.isRestDay ? <ShieldCheck className="w-6 h-6" /> : <Dumbbell className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {log.isRestDay ? 'Rest & Recovery Day' : (log.workout?.title || 'Daily Log')}
                      </h3>
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Badges for mobile/desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                      {log.workout && <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Workout</span>}
                      {log.yoga && <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider">Yoga</span>}
                      {log.meals?.length > 0 && <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider">{log.meals.length} Meals</span>}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/30 space-y-6 animate-in slide-in-from-top-2 fade-in">
                    
                    {/* Workout Details */}
                    {!log.isRestDay && log.workout && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5" /> Strength & Conditioning
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="surface-card rounded-xl p-3 border-[var(--border-subtle)]">
                            <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Duration</span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">{log.workout.totalSessionDurationMinutes} mins</span>
                          </div>
                          <div className="surface-card rounded-xl p-3 border-[var(--border-subtle)]">
                            <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Category</span>
                            <span className="font-bold text-sm text-[var(--text-primary)] capitalize">{log.workout.category}</span>
                          </div>
                          <div className="surface-card rounded-xl p-3 border-[var(--border-subtle)]">
                            <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Intensity</span>
                            <span className="font-bold text-sm text-[var(--text-primary)] capitalize">{log.workout.intensity}</span>
                          </div>
                          <div className="surface-card rounded-xl p-3 border-[var(--border-subtle)]">
                            <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Total Reps</span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">{log.workout.totalWorkoutReps || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cardio / Running */}
                    {(log.cardio || log.running) && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Footprints className="w-3.5 h-3.5 text-sky-400" /> Cardio Activity
                        </h4>
                        <div className="surface-card rounded-xl p-4 border-[var(--border-subtle)] flex items-center gap-6">
                           <div>
                             <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Type</span>
                             <span className="font-bold text-sm text-[var(--text-primary)] capitalize">{(log.cardio?.activityType || log.running?.activityType)?.replace('_', ' ')}</span>
                           </div>
                           <div>
                             <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Distance</span>
                             <span className="font-bold text-sm text-[var(--text-primary)]">{log.cardio?.distanceKm || log.running?.distanceKm || 0} km</span>
                           </div>
                           <div>
                             <span className="block text-[10px] text-[var(--text-secondary)] uppercase mb-1">Time</span>
                             <span className="font-bold text-sm text-[var(--text-primary)]">{log.cardio?.durationMinutes || log.running?.durationMinutes || 0} mins</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {log.meals && log.meals.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Nutrition Logged
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {log.meals.map((meal, idx) => (
                            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                              <img src={meal.photoUrl || meal.imagePath} alt={meal.type} className="w-full h-full object-cover" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center">
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{meal.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coach Feedback */}
                    {log.coachFeedback && (
                      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <span className="text-sm">{log.coachFeedback.reactionEmoji || '👏'}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Coach Feedback</p>
                          <p className="text-sm text-[var(--text-primary)] italic">"{log.coachFeedback.message}"</p>
                          {log.coachFeedback.audioUrl && (
                            <audio src={log.coachFeedback.audioUrl} controls className="h-8 mt-3 w-48 outline-none" />
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No History Yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Your past workout logs will appear here once you start submitting them.</p>
        </div>
      )}
    </div>
  );
};
