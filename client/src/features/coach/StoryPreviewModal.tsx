import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Flame, Heart, Zap, Sparkles } from 'lucide-react';
import { IClientUser } from '../../types';
import { soundFx } from '../../utils/audio';

interface StoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: IClientUser[];
  initialClientIndex?: number;
  initialIndex?: number;
  onCheer?: (clientId: string, emoji: string) => void;
}

export const StoryPreviewModal: React.FC<StoryPreviewModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientIndex = 0,
  initialIndex,
  onCheer,
}) => {
  const startIdx = initialIndex !== undefined ? initialIndex : initialClientIndex;
  const [currentIndex, setCurrentIndex] = useState(startIdx);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentIndex(startIdx);
  }, [startIdx]);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex]);

  if (!isOpen || clients.length === 0) return null;

  const currentClient = clients[currentIndex] || clients[0];

  const handleNext = () => {
    soundFx.playTapSound();
    if (currentIndex < clients.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    soundFx.playTapSound();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleQuickCheer = (emoji: string) => {
    soundFx.playCheerSound();
    onCheer?.(currentClient._id, emoji);
  };

  // Fallback selfie / workout photo
  const storyImage =
    currentClient.avatarUrl ||
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 animate-fade-in-up">
      <div className="relative w-full max-w-sm aspect-[9/16] bg-[var(--bg-void)] rounded-3xl overflow-hidden flex flex-col border border-[var(--border-subtle)] shadow-2xl animate-scale-in">
        {/* Background Image Story */}
        <img
          src={storyImage}
          alt={currentClient.name}
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[var(--bg-void)] pointer-events-none" />

        {/* Top Story Bars */}
        <div className="relative z-10 p-3 flex gap-1">
          {clients.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-[var(--bg-surface-1)]/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text-primary)] transition-all duration-100"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top User Info Bar */}
        <div className="relative z-10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentClient.avatarUrl}
              alt={currentClient.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-subtle)] shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--text-primary)] text-sm drop-shadow-md">{currentClient.name}</span>
                <span className="bg-[var(--bg-surface-2)]/80 backdrop-blur-md text-[var(--text-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--border-subtle)] shadow-sm">
                  {currentClient.compliance?.overallScore || 100}% Logged
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] drop-shadow-md flex items-center gap-1 mt-0.5">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                <span>{currentClient.streak || 1} day streak · {currentClient.fitnessGoal}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon bg-black/40 hover:bg-black/60 backdrop-blur-md text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left & Right Tap Zones */}
        <div className="absolute inset-y-16 inset-x-0 flex justify-between z-10">
          <button
            onClick={handlePrev}
            className="w-1/3 h-full opacity-0 hover:opacity-100 flex items-center justify-start pl-2 transition-opacity duration-300"
          >
            <ChevronLeft className="w-8 h-8 text-[var(--text-primary)]/70 drop-shadow-md" />
          </button>
          <button
            onClick={handleNext}
            className="w-2/3 h-full opacity-0 hover:opacity-100 flex items-center justify-end pr-2 transition-opacity duration-300"
          >
            <ChevronRight className="w-8 h-8 text-[var(--text-primary)]/70 drop-shadow-md" />
          </button>
        </div>

        {/* Bottom Story Content & Quick Cheer Bar */}
        <div className="relative z-10 mt-auto p-4 space-y-3">
          {/* Workout Stats Badge */}
          <div className="p-3 rounded-2xl bg-[var(--bg-surface-1)]/80 backdrop-blur-xl border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>Today's Check-in Complete</span>
              </span>
              <span className="text-[var(--text-primary)] opacity-80">Active Now</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {currentClient.compliance?.habits?.running
                ? `🏃 Completed daily cardio workout. Energy high and nutrition locked in.`
                : `⚡ Habits logged for the day.`}
            </p>
          </div>

          {/* 1-Tap Cheer Reactions */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cheer:</span>
            </span>
            {['🔥', '💪', '🥗', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickCheer(emoji)}
                className="w-10 h-10 rounded-full bg-[var(--bg-surface-2)]/60 hover:bg-[var(--bg-surface-2)] backdrop-blur-md text-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg border border-[var(--border-subtle)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
