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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/95 to-slate-950 border border-neutral-700 p-4 shadow-none ">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-neutral-800 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        {/* Left: Coach Info & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={coachName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-neutral-700 shadow-lg shadow-indigo-500/20"
            />
            {isPlaying ? (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-800 ring-2 ring-slate-950 animate-ping" />
            ) : (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-800 ring-2 ring-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
                <Mic className="w-2 h-2" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">{coachName}</span>
              <span className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-700 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                <span>Daily Voice Coach</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isPlaying ? '🎙️ Speaking your daily breakdown...' : 'Tap play for today\'s audio coaching'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2">
          {isPlaying && (
            <button
              onClick={handleReplay}
              title="Replay Audio"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handlePlayToggle}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white transition-all shadow-lg ${
              isPlaying
                ? 'bg-neutral-800 hover:bg-neutral-800 shadow-amber-500/30 scale-105 animate-pulse'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-indigo-500/30 active:scale-95'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Animated Sound Wave Equalizer */}
      <div className="mt-3.5 flex items-center space-x-2 py-2 px-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 relative z-10">
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
        
        <div className="flex-1 flex items-center justify-between h-5 px-2">
          {[12, 24, 16, 32, 20, 28, 14, 30, 22, 18, 26, 12, 30, 16, 22, 28, 14, 24, 20, 16].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-indigo-500 via-cyan-400 to-emerald-400'
                  : 'bg-slate-700/50'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (h * ((i % 4) + 1)) % 20 + 4)}px` : '4px',
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
          className="text-[11px] text-neutral-300 hover:text-neutral-300 font-bold flex items-center space-x-1 ml-1 transition-colors px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-800 border border-neutral-700"
        >
          <span>{showTranscript ? 'Hide Script' : 'Read Script'}</span>
          {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Spoken Transcript */}
      {showTranscript && (
        <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-neutral-700 text-xs text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Voice Coach Script</span>
          </div>
          <p className="text-slate-300 italic font-medium">"{scriptText}"</p>
        </div>
      )}
    </div>
  );
};
