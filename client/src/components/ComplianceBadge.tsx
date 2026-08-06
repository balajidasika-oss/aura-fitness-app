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
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
      dot: 'bg-emerald-500',
      label: 'High Compliance',
    },
    yellow: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      dot: 'bg-amber-500',
      label: 'Moderate',
    },
    red: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/20',
      dot: 'bg-rose-500',
      label: 'Needs Attention',
    },
  }[tier];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }[size];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Pill Badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-sm ${tierConfig.bg} ${tierConfig.border} ${tierConfig.text} ${tierConfig.glow} ${sizeClasses} w-fit`}
      >
        <span className={`w-2 h-2 rounded-full ${tierConfig.dot} animate-pulse`} />
        <span>{score}%</span>
        {showDetails && <span className="font-normal text-zinc-400 text-[11px]">· {tierConfig.label}</span>}
      </div>

      {/* 7-Day Mini Heatmap Dots */}
      {weeklyHistory && weeklyHistory.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5" title="Last 7 Days Logging History">
          {weeklyHistory.map((day, idx) => {
            let dotBg = 'bg-zinc-800 border-zinc-700 text-zinc-600';
            if (day.status === 'complete') {
              dotBg = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
            } else if (day.status === 'partial') {
              dotBg = 'bg-amber-500/20 border-amber-500/50 text-amber-400';
            }

            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-md border flex items-center justify-center text-[9px] font-bold transition-all ${dotBg}`}
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
