import React from 'react';
import { ComplianceTier, DayStatus } from '../types';
import { Check, Minus, X } from 'lucide-react';

interface ComplianceBadgeProps {
  score: number;
  tier: ComplianceTier;
  showDetails?: boolean;
  weeklyHistory?: DayStatus[];
  size?: 'sm' | 'md' | 'lg';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  score,
  tier,
  showDetails = false,
  weeklyHistory = [],
  size = 'md',
}) => {
  const tierConfig = {
    green: {
      pillClass: 'pill-emerald',
      dot: 'bg-emerald-400',
      label: 'High Compliance',
    },
    yellow: {
      pillClass: 'pill-amber',
      dot: 'bg-amber-400',
      label: 'Moderate',
    },
    red: {
      pillClass: 'pill-rose',
      dot: 'bg-rose-400',
      label: 'Needs Attention',
    },
  }[tier];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }[size];

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in-up">
      {/* Pill Badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold shadow-lg ${tierConfig.pillClass} ${sizeClasses} w-fit backdrop-blur-xl transition-all duration-300`}
      >
        <span className={`w-2 h-2 rounded-full ${tierConfig.dot} animate-pulse shadow-sm`} style={{ filter: 'drop-shadow(0 0 4px currentColor)' }} />
        <span>{score}%</span>
        {showDetails && <span className="font-normal opacity-80 text-[11px]">· {tierConfig.label}</span>}
      </div>

      {/* 7-Day Mini Heatmap Dots */}
      {weeklyHistory && weeklyHistory.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5" title="Last 7 Days Logging History">
          {weeklyHistory.map((day, idx) => {
            let dotClass = 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-muted)]';
            if (day.status === 'complete') {
              dotClass = 'bg-[var(--bg-surface-2)] border-emerald-500/50 text-emerald-400';
            } else if (day.status === 'partial') {
              dotClass = 'bg-[var(--bg-surface-2)] border-amber-500/50 text-amber-400';
            }

            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-md border flex items-center justify-center text-[9px] font-bold transition-all duration-300 shadow-sm ${dotClass}`}
                title={`${day.dayName} (${day.date}): ${day.score}% logged`}
              >
                {day.dayName.charAt(0)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
