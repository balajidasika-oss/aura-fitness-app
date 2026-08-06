import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VoiceNoteRecorderProps {
  onAudioReady: (audioBlob: Blob | null, audioUrl: string | null) => void;
  coachName?: string;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onAudioReady,
  coachName = 'Coach Kai',
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
    <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-3 shadow-xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Daily Voice Memo to {coachName}</h4>
            <span className="text-[10px] text-zinc-400 font-medium">
              Explain how sets felt, energy levels, or soreness
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>Microphone Ready</span>
        </div>
      </div>

      {permissionError && (
        <div className="p-2.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* State 1: Idle / No Recording */}
      {!isRecording && !audioUrl && (
        <div className="bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-4 flex flex-col items-center justify-center text-center space-y-3">
          <button
            type="button"
            onClick={startRecording}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition"
          >
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping pointer-events-none" />
            <Mic className="w-6 h-6 group-hover:scale-110 transition" />
          </button>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-zinc-200 block">Tap to Record Voice Note</span>
            <span className="text-[10px] text-zinc-500 font-medium">Maximum 2:00 duration</span>
          </div>
        </div>
      )}

      {/* State 2: Live Recording in Progress */}
      {isRecording && (
        <div className="bg-red-950/20 border border-red-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-black text-red-400 uppercase tracking-wider">Recording Live...</span>
            </div>
            <span className="text-sm font-black font-mono text-white bg-zinc-950 px-2.5 py-0.5 rounded-xl border border-zinc-800">
              {formatTime(recordingSeconds)}
            </span>
          </div>

          {/* Equalizer Visualizer Waves */}
          <div className="h-10 flex items-center justify-center gap-1 bg-zinc-950/80 rounded-xl px-3 border border-zinc-800">
            {waveLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-gradient-to-t from-red-500 to-amber-400 rounded-full transition-all duration-100"
                style={{ height: `${lvl}%` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-red-500/30 transition active:scale-98"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Finish Recording ({formatTime(recordingSeconds)})</span>
          </button>
        </div>
      )}

      {/* State 3: Recorded Audio Preview & Playback */}
      {audioUrl && !isRecording && (
        <div className="bg-zinc-950 rounded-2xl border border-indigo-500/40 p-3.5 space-y-3 shadow-inner">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={(e) => setPlaybackSeconds((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-indigo-500/30"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-black text-white block">Voice Note Ready</span>
                <span className="text-[10px] text-zinc-400 font-mono font-bold">
                  {formatTime(playbackSeconds)} / {formatTime(duration || recordingSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={startRecording}
                title="Re-record"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                title="Discard"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-red-400 border border-zinc-800 hover:border-red-500/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrub Waveform simulation */}
          <div className="h-4 bg-zinc-900 rounded-lg overflow-hidden relative cursor-pointer" onClick={(e) => {
            if (!audioElementRef.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            audioElementRef.current.currentTime = clickPos * duration;
          }}>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all"
              style={{ width: `${((playbackSeconds / (duration || 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
