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
  onOpenPWAInstall?: () => void;
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
    <div className="w-full min-h-screen bg-transparent text-white flex flex-col font-sans selection:bg-[var(--surface)] selection:text-white">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80  border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-[#FF3B30]/25 text-white font-bold tracking-tight">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">AURA</span>
              <span className="text-[10px] uppercase font-bold tracking-tight tracking-widest px-2 py-0.5 rounded-full bg-[var(--surface)] text-gray-200 border border-[var(--border)]">
                PRO OS
              </span>
            </div>
            <p className="text-[10px] text-[#8E8E93] hidden sm:block">Performance Workout &amp; Coach Accountability</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowPWAInstall(true)}
            className="hidden sm:flex px-3 py-1.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition active:scale-95 items-center space-x-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-gray-200" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleOpenAuth}
            className="px-4 py-2 rounded-2xl text-xs font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md shadow-[#FF3B30]/20 transition active:scale-95 flex items-center space-x-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Join</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Showcase Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto min-h-[70vh]">
          {/* Left Column - Typography & CTA */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white tracking-tight leading-[1.1] font-outfit">
              Master Your <br /> Training. <br />
              <span className="text-gray-200 drop-shadow-none">
                Direct to Your Coach
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              AURA PRO OS is a comprehensive, high-performance fitness platform with advanced features for deep training tracking. Elevate your muscle volume progress, analyze precise metrics, and prevent plateaus with direct coach oversight.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={handleOpenAuth}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]  border border-[var(--border)] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowPWAInstall(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/50  border border-[var(--border)] text-slate-300 hover:text-white hover:bg-slate-800/80 font-bold text-sm transition-all"
              >
                Install App
              </button>
            </div>
          </div>

          {/* Right Column - Bento Box Cards */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[500px] w-full mt-12 lg:mt-0 flex justify-center items-center perspective-1000 max-w-sm mx-auto lg:max-w-none">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-[var(--surface)] blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

            {/* Card 1: Voice Memo */}
            <div className="absolute z-30 left-2 sm:left-4 top-4 sm:top-12 w-44 sm:w-56 p-4 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border-t border-[var(--border)] border-x border-b border-[var(--border)] shadow-none transform hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-6">
                <Mic className="w-4 h-4 text-gray-200" />
                <span className="text-sm font-bold text-white">Voice Memo</span>
              </div>
              {/* Fake Waveform */}
              <div className="h-12 sm:h-16 flex items-center gap-1 justify-center">
                {[4, 8, 12, 16, 24, 16, 12, 20, 32, 16, 8, 4].map((h, i) => (
                  <div key={i} className="w-1 sm:w-1.5 bg-[var(--surface)] rounded-full shadow-none" style={{ height: `${h * 0.8}px` }} />
                ))}
              </div>
              <div className="mt-4 sm:mt-6 flex justify-center gap-4">
                <button className="p-2 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-white/50"><ChevronRight className="w-3 h-3 rotate-180" /></button>
                <button className="p-2 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-white"><div className="w-3 h-3 flex gap-0.5 justify-center items-center"><div className="w-1 h-2.5 bg-[var(--surface)] rounded-sm"/><div className="w-1 h-2.5 bg-[var(--surface)] rounded-sm"/></div></button>
                <button className="p-2 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-white/50"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Card 2: Muscle Volume */}
            <div className="absolute z-20 right-2 sm:right-8 top-24 sm:top-24 w-48 sm:w-60 p-4 sm:p-5 rounded-2xl bg-slate-950/60  border-t border-[var(--border)] border-x border-b border-[var(--border)] shadow-none transform hover:-translate-y-2 transition-transform duration-500 delay-75">
              <span className="text-xs sm:text-sm font-bold text-white mb-4 sm:mb-6 block">Muscle Volume</span>
              <div className="flex items-end justify-between h-20 sm:h-24 gap-1.5 border-b border-[var(--border)] pb-2">
                {[40, 30, 80, 50, 95, 60].map((val, i) => (
                  <div key={i} className={`w-full rounded-sm ${i === 4 ? 'bg-[var(--surface)] shadow-none' : 'bg-slate-700/50'}`} style={{ height: `${val}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] text-slate-500 font-medium">
                <span>12</span><span>06</span><span>18</span><span>22</span><span>20</span>
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] text-[#8E8E93] text-center">Muscle volume progress</p>
            </div>

            {/* Card 3: Sync Status */}
            <div className="absolute z-10 right-12 sm:-right-8 bottom-6 sm:bottom-20 w-36 sm:w-48 p-4 sm:p-6 rounded-2xl bg-slate-950/60  border-t border-[var(--border)] border-x border-b border-[var(--border)] shadow-none flex flex-col items-center gap-3 sm:gap-4 transform hover:-translate-y-2 transition-transform duration-500 delay-150">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--surface)] blur-md rounded-full" />
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-200 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300">Sync Status</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Built for Serious Training</h2>
            <p className="text-xs sm:text-sm text-[#8E8E93]">Everything you need to stay accountable and hit peak performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Multi-Muscle Logger */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-[var(--border)] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-gray-200">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-white">Muscle Group Tracker</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log chest, back, shoulders, arms, legs, and core with sets, reps, and volume calculations. Real-time session duration tracking.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-[11px] text-[#8E8E93] space-y-1">
                <div className="flex justify-between text-white font-semibold">
                  <span>Chest / Pectorals</span>
                  <span className="text-gray-200">4 Sets • 40 Reps</span>
                </div>
                <div>Incline DB Press: 32kg × 10 reps</div>
              </div>
            </div>

            {/* Feature 2: Voice Note Memos */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-[var(--border)] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-gray-200">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-white">2-Minute Voice Memos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Record quick audio debriefs directly after your workout. Explain fatigue, energy levels, and form feedback without typing.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-[11px] text-[#8E8E93] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Live Audio Recorder: 01:24</span>
              </div>
            </div>

            {/* Feature 3: Coach Synchronization */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-[var(--border)] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-white">Coach Command Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trainers receive a real-time compliance dashboard sorted by attention tier. Send instant cheers, feedback, and reaction emojis.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-[11px] text-[#8E8E93] flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Tier Compliance:</span>
                <span className="px-2 py-0.5 rounded bg-[var(--surface)] text-gray-200 font-bold text-[10px]">
                  94% High Compliance
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Deep Dive */}
        <section className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Interactive Feature Previews</h2>
              <p className="text-xs text-[#8E8E93]">Experience how the dual athlete/coach workflow functions.</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveShowcaseTab('athlete')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'athlete'
                    ? 'bg-[var(--surface)] text-white shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Athlete View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('coach')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'coach'
                    ? 'bg-[var(--surface)] text-white shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Coach View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('safety')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'safety'
                    ? 'bg-[var(--surface)] text-white shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Safety &amp; Compliance
              </button>
            </div>
          </div>

          {activeShowcaseTab === 'athlete' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] text-gray-200 text-xs font-bold">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Daily Habit Logging Flow</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Everything in one frictionless interface</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>Cardio logging: Pace, Incline percentage, StairMaster floors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>Photo meal verification (Breakfast, Lunch, Dinner, Snacks)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>End-of-workout proof selfie for accountability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>Live 7-day consistency calendar streak tracker</span>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Daily Workout Progress</span>
                  <span className="text-gray-200 font-bold tracking-tight">100% Complete</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--surface)] h-full w-full rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[#8E8E93] text-[10px]">Cardio</div>
                    <div className="font-bold text-white">5.2 km Run (Incline 2%)</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[#8E8E93] text-[10px]">Strength</div>
                    <div className="font-bold text-white">75 Total Reps</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'coach' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Roster Management &amp; Client Tracking</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Monitor all your athletes at a glance</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Active Athlete Roster</span>
                  <span className="text-cyan-400 font-bold text-[11px]">Synced</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Live Client Logs</div>
                      <div className="text-[10px] text-[#8E8E93]">Workout &amp; Nutrition verified</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[var(--surface)] text-gray-200 font-bold text-[10px]">
                      Green (94%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'safety' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] text-gray-200 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Legal Compliance &amp; Data Rights</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Enterprise security &amp; safety standard</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>PAR-Q (Physical Activity Readiness Questionnaire) screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>Comprehensive Liability Waiver &amp; Coaching Disclaimer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>GDPR &amp; CCPA Compliant Data Portability and Erasure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
                    <span>Secure cryptographic password protection</span>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold text-white mb-2">Review Legal Documentation</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setLegalTab('parq');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[var(--border)] text-left text-xs transition"
                  >
                    <div className="font-bold text-white">PAR-Q Form</div>
                    <div className="text-[10px] text-[#8E8E93]">Health Readiness</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('liability');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[var(--border)] text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Liability Waiver</div>
                    <div className="text-[10px] text-[#8E8E93]">Coaching Terms</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('privacy');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[var(--border)] text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Privacy Policy</div>
                    <div className="text-[10px] text-[#8E8E93]">Data &amp; GDPR</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('gdpr');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-[var(--border)] text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Data Rights</div>
                    <div className="text-[10px] text-[#8E8E93]">Export &amp; Erasure</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CTA Bottom Banner */}
        <section className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-[var(--border)] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Ready to elevate your training?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Create your account in 30 seconds. No credit card required.
          </p>
          <button
            onClick={handleOpenAuth}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold tracking-tight text-sm shadow-none shadow-[#FF3B30]/30 transition active:scale-95 inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 pt-8 pb-4 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-6">
        <div className="flex justify-center gap-4 text-[#8E8E93]">
          <button
            onClick={() => {
              setLegalTab('terms');
              setShowLegalModal(true);
            }}
            className="hover:text-gray-200 transition"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('privacy');
              setShowLegalModal(true);
            }}
            className="hover:text-gray-200 transition"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('parq');
              setShowLegalModal(true);
            }}
            className="hover:text-gray-200 transition"
          >
            PAR-Q Waiver
          </button>
        </div>
        <div className="w-full text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-[#8E8E93] text-sm">Engineered & Designed by</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/balajidasika/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-[var(--border)] hover:bg-slate-800 text-gray-200 font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                Balaji Dasika
              </a>
              <a
                href="https://github.com/balajidasika"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Aura Fitness OS. Built for modern performance coaching.
          </p>
          <p className="text-[10px] text-slate-400">All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-transparent  flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-lg"
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
