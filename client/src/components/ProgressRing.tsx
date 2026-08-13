import React from 'react';

interface ProgressRingProps {
  percentage?: number;
  progress?: number;
  completedTasks?: number;
  totalTasks?: number;
  size?: number;
  strokeWidth?: number;
  indicatorColor?: string;
  colorClass?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  progress,
  completedTasks,
  totalTasks = 3,
  size = 110,
  strokeWidth = 8,
  indicatorColor,
}) => {
  const val = Math.min(100, Math.max(0, percentage ?? progress ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (val / 100) * circumference;

  const isComplete = val === 100;

  return (
    <div className="relative flex items-center justify-center animate-scale-in" style={{ width: size, height: size }}>
      {/* Background ambient glow when reaching 100% */}
      {isComplete && (
        <div className="absolute inset-0 rounded-full bg-[var(--bg-surface-2)] blur-xl animate-pulse opacity-50" />
      )}

      <svg width={size} height={size} className="-rotate-90 transform overflow-visible">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-surface-2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={indicatorColor || '#34d399'} />
            <stop offset="100%" stopColor={indicatorColor ? indicatorColor : '#22d3ee'} />
          </linearGradient>
        </defs>

        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={indicatorColor || 'url(#ringGradient)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
          style={{ filter: isComplete ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))' : 'none' }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        {isComplete ? (
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">100%</span>
            <span className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              3/3 DONE
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {Math.round(val)}%
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)] tracking-wider">
              {completedTasks !== undefined ? `${completedTasks}/${totalTasks}` : '3 Habits'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
