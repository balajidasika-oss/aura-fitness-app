import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import {
  speakDailyVoiceFeedback,
  stopDailyVoiceFeedback,
  generateDailyVoiceScript,
  VoiceFeedbackOptions,
  soundFx,
} from '../utils/audio';

interface VoiceFeedbackPlayerProps {
  options: VoiceFeedbackOptions;
  avatarUrl?: string;
  coachName?: string;
}

export const VoiceFeedbackPlayer: React.FC<VoiceFeedbackPlayerProps> = ({
  options,
  avatarUrl = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
  coachName = 'Coach Kai',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [scriptText, setScriptText] = useState('');

  useEffect(() => {
    const text = generateDailyVoiceScript(options);
    setScriptText(text);

    return () => {
      stopDailyVoiceFeedback();
    };
  }, [
    options.clientName,
    options.workoutTitle,
    options.workoutIntensity,
    options.workoutDuration,
    options.activityType,
    options.distanceKm,
    options.durationMinutes,
    options.pace,
    options.inclinePercentage,
    options.stairmasterFloors,
    options.stairmasterLevel,
    options.mealCount,
    options.hasSelfie,
    options.streak,
    options.customMessage,
    options.coachName,
    JSON.stringify(options.workoutExercises || []),
  ]);

  const handlePlayToggle = () => {
    soundFx.playTapSound();

    if (isPlaying) {
      stopDailyVoiceFeedback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakDailyVoiceFeedback(
        scriptText,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  const handleReplay = () => {
    soundFx.playTapSound();
    stopDailyVoiceFeedback();
    setIsPlaying(true);
    speakDailyVoiceFeedback(
      scriptText,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl glass-card-elevated border border-[var(--border-medium)] p-5 animate-scale-in">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        {/* Left: Coach Info & Status */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={coachName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--border-subtle)] shadow-lg shadow-violet-500/20"
            />
            {isPlaying ? (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-surface-2)] border-2 border-[var(--bg-void)] animate-ping" />
            ) : (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-surface-2)] border-2 border-[var(--bg-void)] flex items-center justify-center shadow-md">
                <Mic className="w-2.5 h-2.5 text-[var(--text-primary)]" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[var(--text-primary)] tracking-wide">{coachName}</span>
              <span className="pill-violet text-[11px] font-bold px-2 py-0.5 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Daily Voice Coach</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {isPlaying ? '🎙️ Speaking your daily breakdown...' : 'Tap play for today\'s audio coaching'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {isPlaying && (
            <button
              onClick={handleReplay}
              title="Replay Audio"
              className="p-3 rounded-2xl btn-ghost transition-all duration-300 flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handlePlayToggle}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-[var(--bg-void)] transition-all duration-300 shadow-lg ${
              isPlaying
                ? 'bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] shadow-amber-500/30 scale-105 animate-pulse'
                : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 hover:brightness-110 shadow-violet-500/30 active:scale-95'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Animated Sound Wave Equalizer */}
      <div className="mt-5 flex items-center gap-3 py-2.5 px-4 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] relative z-10 shadow-inner">
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-cyan-400 animate-bounce' : 'text-[var(--text-muted)]'}`} />
        
        <div className="flex-1 flex items-center justify-between h-6 px-2">
          {[12, 24, 16, 32, 20, 28, 14, 30, 22, 18, 26, 12, 30, 16, 22, 28, 14, 24, 20, 16].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-violet-500 via-cyan-400 to-emerald-400'
                  : 'bg-[var(--bg-surface-2)]'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (h * ((i % 4) + 1)) % 24 + 4)}px` : '4px',
                animationDelay: `${i * 45}ms`,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => {
            soundFx.playTapSound();
            setShowTranscript(!showTranscript);
          }}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold flex items-center gap-1.5 transition-all duration-300 px-3 py-2 rounded-xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] ml-2"
        >
          <span>{showTranscript ? 'Hide Script' : 'Read Script'}</span>
          {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Spoken Transcript */}
      {showTranscript && (
        <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed animate-slide-in-right space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Voice Coach Script</span>
          </div>
          <p className="italic font-medium">"{scriptText}"</p>
        </div>
      )}
    </div>
  );
};
