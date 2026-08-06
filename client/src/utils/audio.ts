/**
 * Web Audio Synthesizer & Web Speech Synthesis Engine
 * Provides instant sound effects and spoken audio feedback without external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    const storedMute = localStorage.getItem('aura_sound_muted');
    this.isMuted = storedMute === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('aura_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      window.speechSynthesis?.cancel();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Camera shutter mechanical click SFX
   */
  public playShutterSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Click 1 (down)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Click 2 (shutter release)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.09);
    gain2.gain.setValueAtTime(0.25, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.09);
  }

  /**
   * Tap / Click haptic micro-feedback
   */
  public playTapSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Coach Cheer swoosh & chime
   */
  public playCheerSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  /**
   * 100% Daily Habit Completion Fanfare
   */
  public playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.1 },
      { f: 783.99, t: 0.2 },
      { f: 1046.5, t: 0.3 },
      { f: 1318.51, t: 0.45 },
    ];

    chords.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.22, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.5);
    });
  }

  /**
   * Error / Validation alert tone
   */
  public playErrorSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(160, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const soundFx = new SoundEngine();

/**
 * Speech Synthesis Daily Voice Coach Engine
 */
export interface VoiceFeedbackOptions {
  clientName: string;
  workoutTitle?: string;
  workoutExercises?: string[];
  workoutIntensity?: string;
  workoutDuration?: number;
  activityType?: string;
  distanceKm?: number;
  durationMinutes?: number;
  pace?: string;
  inclinePercentage?: number;
  stairmasterFloors?: number;
  stairmasterLevel?: number;
  mealCount?: number;
  hasSelfie?: boolean;
  streak?: number;
  coachName?: string;
  customMessage?: string;
}

export function generateDailyVoiceScript(options: VoiceFeedbackOptions): string {
  if (options.customMessage) {
    return options.customMessage;
  }

  const {
    clientName,
    workoutTitle,
    workoutExercises = [],
    workoutIntensity,
    workoutDuration,
    activityType = 'running',
    distanceKm = 0,
    durationMinutes = 0,
    pace,
    inclinePercentage = 0,
    stairmasterFloors = 0,
    stairmasterLevel = 0,
    mealCount = 0,
    hasSelfie,
    streak = 0,
    coachName = 'Coach Kai',
  } = options;

  const parts: string[] = [];

  parts.push(`Hey ${clientName}! This is ${coachName} with your personalized daily performance breakdown.`);

  // 1. Strength Workout Review
  if (workoutTitle && workoutTitle.trim().length > 0) {
    const intensityText = workoutIntensity ? ` at ${workoutIntensity} intensity` : '';
    const durationText = workoutDuration ? ` for ${workoutDuration} minutes` : '';
    let exerciseSnippet = '';
    if (workoutExercises.length > 0) {
      const firstTwo = workoutExercises.slice(0, 2).map((e) => e.split(' (')[0].split(' @')[0]);
      exerciseSnippet = ` You targeted key movements including ${firstTwo.join(' and ')}.`;
    }
    parts.push(`In strength training, you crushed ${workoutTitle}${intensityText}${durationText}.${exerciseSnippet} Form and power output were solid.`);
  } else {
    parts.push(`You haven't logged your strength training session yet today. Remember to get those lifts in.`);
  }

  // 2. Cardio Review (Incline Walk, Stairmaster, Running)
  if (activityType === 'stairmaster' || stairmasterFloors > 0) {
    const levelText = stairmasterLevel > 0 ? ` at level ${stairmasterLevel}` : '';
    const durationText = durationMinutes > 0 ? ` in ${durationMinutes} minutes` : '';
    parts.push(`On the StairMaster, you conquered ${stairmasterFloors} floors${levelText}${durationText}. That's phenomenal glute and conditioning work!`);
  } else if (activityType === 'incline_walk' || inclinePercentage > 0) {
    const inclineText = inclinePercentage > 0 ? ` at a steep ${inclinePercentage}% incline` : '';
    const distText = distanceKm > 0 ? ` for ${distanceKm} kilometers` : '';
    const durationText = durationMinutes > 0 ? ` over ${durationMinutes} minutes` : '';
    const paceText = pace ? ` with a ${pace} pace` : '';
    parts.push(`For cardio, you powered through an incline walk${inclineText}${distText}${durationText}${paceText}. Excellent Zone 2 metabolic conditioning!`);
  } else if (distanceKm > 0) {
    const durationText = durationMinutes ? ` in ${durationMinutes} minutes` : '';
    const paceText = pace ? ` averaging ${pace}` : '';
    parts.push(`For cardio, you logged ${distanceKm} kilometers${durationText}${paceText}. Your cardiovascular aerobic engine is leveling up.`);
  } else if (durationMinutes > 0) {
    parts.push(`You completed a ${durationMinutes}-minute cardio session. Good work keeping your heart rate active.`);
  } else {
    parts.push(`Cardio is still open for today. A quick incline walk or run will lock in your daily stamina.`);
  }

  // 3. Nutrition Photo Review
  if (mealCount > 0) {
    parts.push(`Your nutrition accountability is locked in with ${mealCount} clean meal photo${mealCount > 1 ? 's' : ''} uploaded.`);
  } else {
    parts.push(`Don't forget to take a photo of your meals to keep your nutrition clean.`);
  }

  // 4. Session Selfie
  if (hasSelfie) {
    parts.push(`Loved seeing your post-workout gym selfie! The hard work is showing.`);
  } else {
    parts.push(`Snap that post-workout selfie when your training wraps up.`);
  }

  // 5. Streak & Motivation
  if (streak > 0) {
    parts.push(`You are currently on a ${streak}-day active habit streak. Keep this unstoppable momentum alive!`);
  }

  parts.push(`Hydrate well, recover, and let's dominate tomorrow.`);

  return parts.join(' ');
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakDailyVoiceFeedback(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    onError?.();
    return;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  // Configure speech properties
  utterance.rate = 1.02;
  utterance.pitch = 1.02;
  utterance.volume = 1.0;

  // Try to pick a natural voice
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('Alex'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error('Speech error:', e);
    activeUtterance = null;
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopDailyVoiceFeedback() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isVoiceFeedbackPlaying(): boolean {
  if (!('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}
