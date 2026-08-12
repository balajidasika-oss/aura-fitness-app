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
      bg: 'bg-neutral-800',
      border: 'border-neutral-700',
      text: 'text-neutral-200',
      glow: 'shadow-emerald-500/20',
      dot: 'bg-neutral-800',
      label: 'High Compliance',
    },
    yellow: {
      bg: 'bg-neutral-800',
      border: 'border-neutral-700',
      text: 'text-neutral-300',
      glow: 'shadow-amber-500/20',
      dot: 'bg-neutral-800',
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
        {showDetails && <span className="font-normal text-neutral-400 text-[11px]">· {tierConfig.label}</span>}
      </div>

      {/* 7-Day Mini Heatmap Dots */}
      {weeklyHistory && weeklyHistory.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5" title="Last 7 Days Logging History">
          {weeklyHistory.map((day, idx) => {
            let dotBg = 'bg-[#141414] border-neutral-800 text-zinc-600';
            if (day.status === 'complete') {
              dotBg = 'bg-neutral-800 border-neutral-700 text-neutral-200';
            } else if (day.status === 'partial') {
              dotBg = 'bg-neutral-800 border-neutral-700 text-neutral-300';
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
