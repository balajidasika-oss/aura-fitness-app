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
    <div className="w-full min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">AURA</span>
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Performance Workout &amp; Coach Accountability</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowPWAInstall(true)}
            className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition active:scale-95 items-center space-x-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleOpenAuth}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center space-x-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Join</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Showcase Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>High-Performance Athlete &amp; Coach Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Master Your Training. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Direct to Your Coach.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A production-ready fitness operating system. Log muscle-by-muscle volume, track cardio incline &amp; stair climbs, record live 2-minute voice memos, verify meals, and sync seamlessly with your coach.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowPWAInstall(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-white font-bold text-sm transition active:scale-95 flex items-center justify-center space-x-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Install to Phone</span>
            </button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">Built for Serious Training</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to stay accountable and hit peak performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Multi-Muscle Logger */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Muscle Group Tracker</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log chest, back, shoulders, arms, legs, and core with sets, reps, and volume calculations. Real-time session duration tracking.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between text-white font-semibold">
                  <span>Chest / Pectorals</span>
                  <span className="text-emerald-400">4 Sets • 40 Reps</span>
                </div>
                <div>Incline DB Press: 32kg × 10 reps</div>
              </div>
            </div>

            {/* Feature 2: Voice Note Memos */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">2-Minute Voice Memos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Record quick audio debriefs directly after your workout. Explain fatigue, energy levels, and form feedback without typing.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Live Audio Recorder: 01:24</span>
              </div>
            </div>

            {/* Feature 3: Coach Synchronization */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Coach Command Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trainers receive a real-time compliance dashboard sorted by attention tier. Send instant cheers, feedback, and reaction emojis.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Tier Compliance:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  94% High Compliance
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Deep Dive */}
        <section className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white">Interactive Feature Previews</h2>
              <p className="text-xs text-slate-400">Experience how the dual athlete/coach workflow functions.</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveShowcaseTab('athlete')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'athlete'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Athlete View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('coach')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'coach'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Coach View
              </button>
              <button
                onClick={() => setActiveShowcaseTab('safety')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeShowcaseTab === 'safety'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety &amp; Compliance
              </button>
            </div>
          </div>

          {activeShowcaseTab === 'athlete' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Daily Habit Logging Flow</span>
                </div>
                <h3 className="text-xl font-black text-white">Everything in one frictionless interface</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Daily Workout Progress</span>
                  <span className="text-emerald-400 font-black">100% Complete</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Cardio</div>
                    <div className="font-bold text-white">5.2 km Run (Incline 2%)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Strength</div>
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
                <h3 className="text-xl font-black text-white">Monitor all your athletes at a glance</h3>
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
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Live Client Logs</div>
                      <div className="text-[10px] text-slate-400">Workout &amp; Nutrition verified</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Legal Compliance &amp; Data Rights</span>
                </div>
                <h3 className="text-xl font-black text-white">Enterprise security &amp; safety standard</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PAR-Q (Physical Activity Readiness Questionnaire) screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Comprehensive Liability Waiver &amp; Coaching Disclaimer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>GDPR &amp; CCPA Compliant Data Portability and Erasure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition"
                  >
                    <div className="font-bold text-white">PAR-Q Form</div>
                    <div className="text-[10px] text-slate-400">Health Readiness</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('liability');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Liability Waiver</div>
                    <div className="text-[10px] text-slate-400">Coaching Terms</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('privacy');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Privacy Policy</div>
                    <div className="text-[10px] text-slate-400">Data &amp; GDPR</div>
                  </button>
                  <button
                    onClick={() => {
                      setLegalTab('gdpr');
                      setShowLegalModal(true);
                    }}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition"
                  >
                    <div className="font-bold text-white">Data Rights</div>
                    <div className="text-[10px] text-slate-400">Export &amp; Erasure</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CTA Bottom Banner */}
        <section className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Ready to elevate your training?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Create your account in 30 seconds. No credit card required.
          </p>
          <button
            onClick={handleOpenAuth}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition active:scale-95 inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 pt-8 pb-4 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-6">
        <div className="flex justify-center gap-4 text-slate-400">
          <button
            onClick={() => {
              setLegalTab('terms');
              setShowLegalModal(true);
            }}
            className="hover:text-emerald-400 transition"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('privacy');
              setShowLegalModal(true);
            }}
            className="hover:text-emerald-400 transition"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setLegalTab('parq');
              setShowLegalModal(true);
            }}
            className="hover:text-emerald-400 transition"
          >
            PAR-Q Waiver
          </button>
        </div>
        <div className="w-full text-center text-[10px] sm:text-xs">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Aura Fitness OS. Designed and Engineered by{' '}
            <a
              href="https://github.com/balajidasika-oss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
            >
              Balaji
            </a>
            .
          </p>
          <p className="text-[10px] text-slate-600">All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowPWAInstall(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-lg"
            >
              ✕
            </button>
            <PWAInstallPrompt onClose={() => setShowPWAInstall(false)} />
          </div>
        </div>
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
