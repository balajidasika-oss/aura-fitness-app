import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Flame,
  ArrowRight,
  Sparkles,
  Camera,
  Mic,
  Dumbbell,
  CheckCircle2,
  Activity,
  ChevronRight,
  TrendingUp,
  Layers,
  Utensils,
  Award,
  Smartphone,
  Scale,
  Lock,
  UserCheck,
  HeartHandshake,
  Check,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { AuthScreen } from '../auth/AuthScreen';
import { soundFx } from '../../utils/audio';
import { PWAInstallPrompt } from '../../components/PWAInstallPrompt';
import { LegalCenterModal, LegalTab } from '../../components/LegalCenterModal';

interface LandingShowcaseProps {
  onOpenLegal?: () => void;
  onOpenPrivacy?: () => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = () => {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'athlete' | 'coach' | 'safety'>('athlete');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('parq');

  const handleOpenAuth = () => {
    soundFx.playTapSound();
    setShowAuthModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--bg-glass)] backdrop-blur-xl border-b border-[var(--border-subtle)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-[var(--text-primary)] font-bold tracking-tight">
            <Zap className="w-5 h-5 fill-[var(--bg-void)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-[var(--text-primary)]">AURA</span>
              <span className="pill text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                PRO OS
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] hidden sm:block">Performance Workout &amp; Coach Accountability</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowPWAInstall(true)}
            className="hidden sm:flex btn-ghost px-3 py-1.5 text-xs font-bold items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleOpenAuth}
            className="btn-primary px-4 py-2 text-xs font-bold tracking-tight flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Join</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Showcase Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 gap-16 flex flex-col">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto min-h-[70vh]">
          {/* Left Column - Typography & CTA */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left animate-slide-in-right">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1] font-outfit">
              Master Your <br /> Training. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-none">
                Direct to Your Coach
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
              AURA PRO OS is a comprehensive, high-performance fitness platform with advanced features for deep training tracking. Elevate your muscle volume progress, analyze precise metrics, and prevent plateaus with direct coach oversight.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={handleOpenAuth}
                className="btn-primary w-full sm:w-auto px-8 py-4 text-sm flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowPWAInstall(true)}
                className="btn-ghost w-full sm:w-auto px-8 py-4 text-sm transition-all"
              >
                Install App
              </button>
            </div>
          </div>

          {/* Right Column - Bento Box Cards */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[500px] w-full mt-12 lg:mt-0 flex justify-center items-center perspective-1000 max-w-sm mx-auto lg:max-w-none">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/20 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

            {/* Card 1: Voice Memo */}
            <div className="absolute z-30 left-2 sm:left-4 top-4 sm:top-12 w-[45%] sm:w-56 p-4 glass-card-interactive animate-scale-in">
              <div className="flex items-center gap-2 mb-6">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-[var(--text-primary)]">Voice Memo</span>
              </div>
              {/* Fake Waveform */}
              <div className="h-12 sm:h-16 flex items-center gap-1 justify-center">
                {[4, 8, 12, 16, 24, 16, 12, 20, 32, 16, 8, 4].map((h, i) => (
                  <div key={i} className="w-1 sm:w-1.5 bg-emerald-400 rounded-full" style={{ height: `${h * 0.8}px` }} />
                ))}
              </div>
              <div className="mt-4 sm:mt-6 flex justify-center gap-4">
                <button className="p-2 rounded-full glass-card hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]"><ChevronRight className="w-3 h-3 rotate-180" /></button>
                <button className="p-2 rounded-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)]"><div className="w-3 h-3 flex gap-0.5 justify-center items-center"><div className="w-1 h-2.5 bg-[var(--text-primary)] rounded-sm"/><div className="w-1 h-2.5 bg-[var(--text-primary)] rounded-sm"/></div></button>
                <button className="p-2 rounded-full glass-card hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Card 2: Muscle Volume */}
            <div className="absolute z-20 right-2 sm:right-8 top-24 sm:top-24 w-[45%] sm:w-60 p-4 sm:p-5 glass-card-interactive animate-scale-in" style={{ animationDelay: '100ms' }}>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-4 sm:mb-6 block">Muscle Volume</span>
              <div className="flex items-end justify-between h-20 sm:h-24 gap-1.5 border-b border-[var(--border-subtle)] pb-2">
                {[40, 30, 80, 50, 95, 60].map((val, i) => (
                  <div key={i} className={`w-full rounded-sm ${i === 4 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-[var(--bg-surface-2)]'}`} style={{ height: `${val}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] text-[var(--text-muted)] font-medium">
                <span>12</span><span>06</span><span>18</span><span>22</span><span>20</span>
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] text-[var(--text-muted)] text-center">Muscle volume progress</p>
            </div>

            {/* Card 3: Sync Status */}
            <div className="absolute z-10 right-[10%] sm:-right-8 bottom-6 sm:bottom-20 w-[35%] sm:w-48 p-4 sm:p-6 glass-card-interactive flex flex-col items-center gap-3 sm:gap-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-md rounded-full" />
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center bg-[var(--bg-surface-1)]">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-violet-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--text-primary)]">Sync Status</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="flex flex-col gap-6 animate-fade-in-up">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">Built for Serious Training</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">Everything you need to stay accountable and hit peak performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Multi-Muscle Logger */}
            <div className="glass-card-interactive p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">Muscle Group Tracker</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Log chest, back, shoulders, arms, legs, and core with sets, reps, and volume calculations. Real-time session duration tracking.
              </p>
              <div className="p-3 bg-[var(--bg-void)] rounded-2xl border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex flex-col gap-1">
                <div className="flex justify-between text-[var(--text-primary)] font-semibold">
                  <span>Chest / Pectorals</span>
                  <span className="text-emerald-400">4 Sets • 40 Reps</span>
                </div>
                <div>Incline DB Press: 32kg × 10 reps</div>
              </div>
            </div>

            {/* Feature 2: Voice Note Memos */}
            <div className="glass-card-interactive p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-center text-cyan-400">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">2-Minute Voice Memos</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Record quick audio debriefs directly after your workout. Explain fatigue, energy levels, and form feedback without typing.
              </p>
              <div className="p-3 bg-[var(--bg-void)] rounded-2xl border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[var(--text-secondary)] font-medium">Live Audio Recorder: 01:24</span>
              </div>
            </div>

            {/* Feature 3: Coach Synchronization */}
            <div className="glass-card-interactive p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-center text-violet-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">Coach Command Portal</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Trainers receive a real-time compliance dashboard sorted by attention tier. Send instant cheers, feedback, and reaction emojis.
              </p>
              <div className="p-3 bg-[var(--bg-void)] rounded-2xl border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex justify-between items-center">
                <span className="text-[var(--text-secondary)] font-semibold">Tier Compliance:</span>
                <span className="pill pill-emerald font-bold text-[10px]">
                  94% High Compliance
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Deep Dive */}
        <section className="glass-card p-6 sm:p-8 flex flex-col gap-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Interactive Feature Previews</h2>
              <p className="text-xs text-[var(--text-muted)]">Experience how the dual athlete/coach workflow functions.</p>
            </div>
            <div className="flex flex-wrap bg-[var(--bg-surface-1)] p-1 rounded-2xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setActiveShowcaseTab('athlete')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeShowcaseTab === 'athlete'
                    ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Athlete View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('coach')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeShowcaseTab === 'coach'
                    ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Coach View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('safety')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeShowcaseTab === 'safety'
                    ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Safety &amp; Compliance
              </button>
            </div>
          </div>

          {activeShowcaseTab === 'athlete' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 self-start rounded-full bg-[var(--bg-surface-2)] text-emerald-400 text-xs font-bold">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Daily Habit Logging Flow</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Everything in one frictionless interface</h3>
                <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cardio logging: Pace, Incline percentage, StairMaster floors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Photo meal verification (Breakfast, Lunch, Dinner, Snacks)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>End-of-workout proof selfie for accountability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live 7-day consistency calendar streak tracker</span>
                  </li>
                </ul>
              </div>
              <div className="surface-card p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)]">Daily Workout Progress</span>
                  <span className="text-emerald-400 font-bold tracking-tight">100% Complete</span>
                </div>
                <div className="w-full bg-[var(--bg-void)] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)]">
                    <div className="text-[var(--text-muted)] text-[10px]">Cardio</div>
                    <div className="font-bold text-[var(--text-primary)]">5.2 km Run (Incline 2%)</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)]">
                    <div className="text-[var(--text-muted)] text-[10px]">Strength</div>
                    <div className="font-bold text-[var(--text-primary)]">75 Total Reps</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'coach' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 self-start rounded-full bg-[var(--bg-surface-2)] text-cyan-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Roster Management &amp; Client Tracking</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Monitor all your athletes at a glance</h3>
                <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Instant color-coded attention badges (Green, Yellow, Red)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Play voice memos from athletes directly from the browser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Send one-tap reaction cheers and feedback messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Unique Coach Invite Code for easy client pairing</span>
                  </li>
                </ul>
              </div>
              <div className="surface-card p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)]">Active Athlete Roster</span>
                  <span className="text-cyan-400 font-bold text-[11px]">Synced</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Live Client Logs</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Workout &amp; Nutrition verified</div>
                    </div>
                    <span className="pill pill-emerald font-bold text-[10px]">
                      Green (94%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'safety' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 self-start rounded-full bg-[var(--bg-surface-2)] text-violet-400 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Legal Compliance &amp; Data Rights</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Enterprise security &amp; safety standard</h3>
                <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>PAR-Q (Physical Activity Readiness Questionnaire) screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Comprehensive Liability Waiver &amp; Coaching Disclaimer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>GDPR &amp; CCPA Compliant Data Portability and Erasure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Secure cryptographic password protection</span>
                  </li>
                </ul>
              </div>
              <div className="surface-card p-5 flex flex-col gap-3">
                <div className="text-xs font-bold text-[var(--text-primary)] mb-2">Review Legal Documentation</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLegalTab('parq');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)] hover:border-violet-500/50 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-[var(--text-primary)]">PAR-Q Form</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Health Readiness</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('liability');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)] hover:border-violet-500/50 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-[var(--text-primary)]">Liability Waiver</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Coaching Terms</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('privacy');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)] hover:border-violet-500/50 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-[var(--text-primary)]">Privacy Policy</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Data &amp; GDPR</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('gdpr');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-[var(--bg-void)] border border-[var(--border-subtle)] hover:border-violet-500/50 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-[var(--text-primary)]">Data Rights</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Export &amp; Erasure</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CTA Bottom Banner */}
        <section className="glass-card bg-gradient-to-br from-[var(--bg-surface-1)] to-[var(--bg-surface-2)] p-8 sm:p-12 text-center flex flex-col gap-6 animate-fade-in-up">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">Ready to elevate your training?</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Create your account in 30 seconds. No credit card required.
          </p>
          <button
            onClick={handleOpenAuth}
            className="btn-primary px-8 py-4 text-sm inline-flex items-center justify-center gap-2 self-center"
          >
            <Zap className="w-4 h-4" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-void)] pt-8 pb-4 px-4 sm:px-8 text-center text-xs text-[var(--text-muted)] flex flex-col gap-6 mt-8">
        <div className="flex justify-center gap-4 text-[var(--text-secondary)]">
          <button
            onClick={() => {
              setLegalTab('terms');
              setShowLegalModal(true);
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('privacy');
              setShowLegalModal(true);
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('parq');
              setShowLegalModal(true);
            }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            PAR-Q Waiver
          </button>
        </div>
        <div className="w-full text-center flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-[var(--text-muted)] text-sm">Engineered & Designed by</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/balajidasika/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-emerald-500/50 text-[var(--text-primary)] font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                Balaji Dasika
              </a>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Aura Fitness OS. Built for modern performance coaching.
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-void)]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in-up">
          <div className="relative w-full max-w-xl my-8">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-subtle)] shadow-lg transition-colors"
            >
              ✕
            </button>
            <AuthScreen
              isModal
              onSuccess={() => setShowAuthModal(false)}
              onLoginSuccess={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      {showPWAInstall && (
        <PWAInstallPrompt isOpen={true} onClose={() => setShowPWAInstall(false)} />
      )}

      {/* Legal Center Modal */}
      <LegalCenterModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalTab}
      />
    </div>
  );
};
