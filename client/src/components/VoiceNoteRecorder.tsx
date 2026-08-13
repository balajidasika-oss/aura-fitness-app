import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VoiceNoteRecorderProps {
  onAudioReady: (audioBlob: Blob | null, audioUrl: string | null) => void;
  coachName?: string;
  title?: string;
  subtitle?: string;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onAudioReady,
  coachName = 'Coach Kai',
  title,
  subtitle,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio equalizer bars
  const [waveLevels, setWaveLevels] = useState<number[]>([15, 25, 45, 70, 30, 60, 85, 40, 20, 50, 75, 35, 65, 80, 45, 25]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveLevels((prev) =>
          prev.map(() => Math.floor(Math.random() * 75) + 15)
        );
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Clean up audio & stream on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      soundFx.playTapSound();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detect supported mime-type across iOS Safari & Android Chrome
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioReady(audioBlob, url);

        // Stop all mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            // Auto cap at 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setPermissionError('Microphone permission required to record voice notes. Please allow access.');
    }
  };

  const stopRecording = () => {
    soundFx.playSuccessChime();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleDiscard = () => {
    soundFx.playTapSound();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingSeconds(0);
    onAudioReady(null, null);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      soundFx.playTapSound();
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-3xl surface-card p-5 space-y-4 animate-scale-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-inner ${
            isRecording ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30' : 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
          }`}>
            <Mic className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{title || `Daily Voice Memo to ${coachName}`}</h4>
            <span className="text-xs text-[var(--text-muted)] font-medium mt-0.5 block">
              {subtitle || 'Explain how sets felt, energy levels, or soreness'}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-bold bg-[var(--bg-surface-2)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mic Ready</span>
        </div>
      </div>

      {permissionError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 shadow-inner">
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{permissionError}</span>
        </div>
      )}

      {/* State 1: Idle / No Recording */}
      {!isRecording && !audioUrl && (
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-inner">
          <button
            type="button"
            onClick={startRecording}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-full bg-[var(--bg-surface-2)] animate-ping pointer-events-none opacity-50" />
            <Mic className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="space-y-1">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] block">Tap to Record Voice Note</span>
            <span className="text-xs text-[var(--text-muted)] font-medium">Maximum 2:00 duration</span>
          </div>
        </div>
      )}

      {/* State 2: Live Recording in Progress */}
      {isRecording && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-inner animate-slide-in-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="text-xs font-bold tracking-tight text-rose-400 uppercase tracking-wider">Recording Live...</span>
            </div>
            <span className="text-sm font-bold tracking-tight font-mono text-[var(--text-primary)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-3 py-1 rounded-2xl shadow-sm">
              {formatTime(recordingSeconds)}
            </span>
          </div>

          {/* Equalizer Visualizer Waves */}
          <div className="h-14 flex items-center justify-center gap-1.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-2xl px-4 shadow-inner">
            {waveLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full transition-all duration-100"
                style={{ height: `${lvl}%` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition-all duration-300 active:scale-95"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Finish Recording ({formatTime(recordingSeconds)})</span>
          </button>
        </div>
      )}

      {/* State 3: Recorded Audio Preview & Playback */}
      {audioUrl && !isRecording && (
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-4 shadow-inner animate-slide-in-right">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={(e) => setPlaybackSeconds((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-11 h-11 rounded-2xl btn-primary flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] block">Voice Note Ready</span>
                <span className="text-xs text-[var(--text-secondary)] font-mono font-bold mt-0.5 block">
                  {formatTime(playbackSeconds)} / {formatTime(duration || recordingSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                title="Re-record"
                className="p-3 rounded-xl btn-ghost transition-all duration-300 flex items-center justify-center"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                title="Discard"
                className="p-3 rounded-xl bg-[var(--bg-surface-2)] text-rose-400 hover:bg-rose-500/10 border border-[var(--border-subtle)] hover:border-rose-500/30 transition-all duration-300 flex items-center justify-center"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Scrub Waveform simulation */}
          <div className="h-5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xl overflow-hidden relative cursor-pointer shadow-inner" onClick={(e) => {
            if (!audioElementRef.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            audioElementRef.current.currentTime = clickPos * duration;
          }}>
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${((playbackSeconds / (duration || 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
