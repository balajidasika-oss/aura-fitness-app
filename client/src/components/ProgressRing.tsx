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
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ambient glow when reaching 100% */}
      {isComplete && (
        <div className="absolute inset-0 rounded-full bg-neutral-800 blur-xl animate-pulse" />
      )}

      <svg width={size} height={size} className="-rotate-90 transform overflow-visible">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#27272a"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={indicatorColor || '#10b981'} />
            <stop offset="100%" stopColor={indicatorColor ? indicatorColor : '#06b6d4'} />
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
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        {isComplete ? (
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-neutral-200">100%</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-200">
              3/3 DONE
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white tracking-tight">
              {Math.round(val)}%
            </span>
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider">
              {completedTasks !== undefined ? `${completedTasks}/${totalTasks}` : '3 Habits'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
