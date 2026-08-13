import React from 'react';
import { Flame, Trophy, Zap, Activity, Award } from 'lucide-react';

interface GamificationDashboardProps {
  yogaCompleted?: boolean;
  zumbaCompleted?: boolean;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  yogaCompleted = false,
  zumbaCompleted = false,
}) => {
  const unlockedCount = (yogaCompleted ? 1 : 0) + (zumbaCompleted ? 1 : 0);

  return (
    <div className="w-full bg-transparent border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--bg-surface-1)] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Athlete Profile
          </h2>
          <p className="text-[var(--text-primary)]/80 font-medium mt-1">Level 4 • Pro Contender</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="surface-card rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
            <span className="text-sm text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Streak</span>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">5 Days</span>
            </div>
          </div>
          <div className="surface-card rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
            <span className="text-sm text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Total Volume</span>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">12.4k lbs</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Trophy Room</h3>
          <span className="text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-surface-1)] px-2 py-1 rounded-md">{unlockedCount} / 4 Unlocked</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Yoga Badge */}
          <div className={`${yogaCompleted ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-emerald-500/30' : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] opacity-50 grayscale cursor-not-allowed'} border rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:scale-105 transition-all`}>
            {yogaCompleted && <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${yogaCompleted ? 'bg-[var(--bg-surface-1)]' : 'bg-[var(--bg-surface-2)]'}`}>
              <Activity className={`w-6 h-6 ${yogaCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
            </div>
            <h4 className={`font-bold text-sm ${yogaCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>First Flow</h4>
            <p className={`text-xs font-medium mt-1 ${yogaCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{yogaCompleted ? 'Completed Yoga' : 'Complete a Yoga session'}</p>
          </div>
          
          {/* Zumba Badge */}
          <div className={`${zumbaCompleted ? 'bg-gradient-to-br from-[#FF3B30]/10 to-[#FF3B30]/5 border-[#FF3B30]/20' : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] opacity-50 grayscale cursor-not-allowed'} border rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:scale-105 transition-all`}>
            {zumbaCompleted && <div className="absolute inset-0 bg-gradient-to-t from-[#FF3B30]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${zumbaCompleted ? 'bg-[#FF3B30]/10' : 'bg-[var(--bg-surface-2)]'}`}>
              <Zap className={`w-6 h-6 ${zumbaCompleted ? 'text-[#FF3B30]' : 'text-[var(--text-muted)]'}`} />
            </div>
            <h4 className={`font-bold text-sm ${zumbaCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Rhythm King</h4>
            <p className={`text-xs font-medium mt-1 ${zumbaCompleted ? 'text-[#FF3B30]' : 'text-[var(--text-muted)]'}`}>{zumbaCompleted ? 'Completed Zumba' : 'Complete a Zumba session'}</p>
          </div>
          
          {/* Locked Badge */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center text-center opacity-50 grayscale cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <h4 className="text-[var(--text-secondary)] font-bold text-sm">Iron Week</h4>
            <p className="text-[var(--text-muted)] text-xs font-medium mt-1">7 Day Streak</p>
          </div>
          
          {/* Locked Badge */}
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center text-center opacity-50 grayscale cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <h4 className="text-[var(--text-secondary)] font-bold text-sm">Form Master</h4>
            <p className="text-[var(--text-muted)] text-xs font-medium mt-1">99% AI Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
