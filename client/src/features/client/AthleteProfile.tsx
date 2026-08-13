import React, { useState, useEffect } from 'react';
import { IClientUser, IDailyLog } from '../../types';
import { fetchLogHistory } from '../../services/api';
import { GamificationDashboard } from './GamificationDashboard';
import { Utensils, Mic, Calendar, Image as ImageIcon } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AthleteProfileProps {
  client: IClientUser;
}

export const AthleteProfile: React.FC<AthleteProfileProps> = ({ client }) => {
  const [logs, setLogs] = useState<IDailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const history = await fetchLogHistory(client._id);
        if (mounted) setLogs(history);
      } catch (err) {
        console.error('Failed to load history for profile', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [client._id]);

  // Extract all meals from history
  const allMeals = logs.flatMap(log => log.meals || []);
  
  // Extract all voice messages
  const voiceNotes = logs.filter(log => !!log.voiceNoteUrl);

  return (
    <div className="w-full space-y-6 pb-20 md:pb-0 animate-fade-in-up">
      {/* Gamification Component */}
      <GamificationDashboard 
        streak={client.compliance?.streak || client.streak || 0}
        totalLogsSubmitted={client.totalLogsSubmitted || 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Gallery Section */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Nutrition Gallery
          </h3>
          {isLoading ? (
            <div className="animate-pulse flex gap-2 overflow-x-auto">
              {[1, 2, 3].map(i => <div key={i} className="w-24 h-24 rounded-2xl bg-[var(--bg-surface-1)] shrink-0" />)}
            </div>
          ) : allMeals.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {allMeals.slice(0, 9).map((meal, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group">
                  <img src={meal.photoUrl || meal.imagePath} alt={meal.caption || meal.name || 'Meal'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{meal.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="surface-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <ImageIcon className="w-8 h-8 text-[var(--text-secondary)] mb-3 opacity-50" />
              <p className="text-[var(--text-secondary)] text-sm font-medium">No meals uploaded yet.</p>
            </div>
          )}
        </div>

        {/* Voice Messages Section */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-rose-400" />
            Voice Check-ins
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-[var(--bg-surface-1)] animate-pulse" />)}
            </div>
          ) : voiceNotes.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {voiceNotes.map((log, idx) => (
                <div key={log._id || idx} className="surface-card rounded-xl p-3 flex items-center justify-between border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <Mic className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Check-in Audio</p>
                      <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <audio src={log.voiceNoteUrl} controls className="h-8 w-32 md:w-48 outline-none" />
                </div>
              ))}
            </div>
          ) : (
             <div className="surface-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Mic className="w-8 h-8 text-[var(--text-secondary)] mb-3 opacity-50" />
              <p className="text-[var(--text-secondary)] text-sm font-medium">No voice check-ins yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
