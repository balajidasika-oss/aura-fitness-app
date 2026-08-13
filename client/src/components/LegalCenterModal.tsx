import React, { useState } from 'react';
import { Shield, FileText, AlertTriangle, Lock, X, CheckCircle, Scale, HeartPulse } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type LegalTab = 'terms' | 'parq' | 'privacy' | 'liability' | 'gdpr';

interface LegalCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalCenterModal: React.FC<LegalCenterModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'parq',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl glass-card-elevated border border-[var(--border-medium)] shadow-2xl animate-slide-up">
        {/* Top Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)] backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-2)] text-[var(--text-primary)] flex items-center justify-center shadow-lg border border-[var(--border-subtle)]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">Legal & Compliance Center</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Terms, Health Waiver & Privacy</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              onClose();
            }}
            className="w-10 h-10 p-2.5 rounded-2xl btn-icon transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2.5 gap-2 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] text-xs z-10 relative">
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('parq');
            }}
            className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeTab === 'parq'
                ? 'pill-rose shadow-lg'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PAR-Q Waiver</span>
            <span className="sm:hidden">PAR-Q</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('privacy');
            }}
            className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeTab === 'privacy'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Privacy & GDPR</span>
            <span className="sm:hidden">Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('terms');
            }}
            className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              activeTab === 'terms'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terms of Use</span>
            <span className="sm:hidden">Terms</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-[var(--text-secondary)] leading-relaxed font-normal bg-[var(--bg-void)]">
          {/* TAB 1: PAR-Q & HEALTH LIABILITY WAIVER */}
          {activeTab === 'parq' && (
            <div className="space-y-5 animate-slide-in-right">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-rose-200">Physical Activity Readiness & Medical Disclaimer</h4>
                  <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                    Physical training involves inherent risk of physical injury. Please review carefully before participating.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">1. Not Medical Advice</h5>
                <p>
                  The workouts, cardiovascular routines, rep schemes, and coaching voice feedback provided via Aura Fitness Coach are for general physical conditioning and educational purposes only. They do not constitute medical diagnosis, treatment, or professional physical therapy.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">2. PAR-Q Health Screening Checklist</h5>
                <p>
                  By utilizing this application, you attest that you do not have any of the following contraindications unless explicitly cleared in writing by a licensed physician:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)] text-xs">
                  <li>Diagnosed cardiovascular heart conditions or chest pain during physical exertion.</li>
                  <li>Frequent dizziness, loss of consciousness, or severe balance disorders.</li>
                  <li>Acute orthopedic bone, joint, or spinal issues aggravated by heavy resistance training.</li>
                  <li>Prescribed medications for blood pressure or heart conditions requiring clinical monitoring.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">3. Assumption of Risk & Voluntary Release</h5>
                <p>
                  You voluntarily agree to assume all physical risks associated with resistance lifting, high incline treadmill protocols, StairMaster climbing, and athletic activities. You release Aura Fitness, coaches, and administrators from any liability for accidental injury or property damage resulting from workout execution.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & GDPR DATA RIGHTS */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-slide-in-right">
              <div className="p-4 rounded-2xl surface-card flex items-start gap-3">
                <Shield className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Privacy Policy & Biometric Protection (GDPR / CCPA)</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    Your personal biometric data, photos, and voice memos belong to you. We do not sell or broker user data.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">1. Data We Collect</h5>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)] text-xs">
                  <li><strong className="text-[var(--text-primary)] font-medium">Account Profile:</strong> Name, email address, fitness goals, and profile photo.</li>
                  <li><strong className="text-[var(--text-primary)] font-medium">Workout Logs:</strong> Muscle groups, exercises, sets, reps, weight (kg), session duration, and cardio metrics.</li>
                  <li><strong className="text-[var(--text-primary)] font-medium">Media & Sensor Audio:</strong> Daily meal photos, post-workout selfies, and voice memos recorded via your device microphone.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">2. Device Sensor Permissions (Camera & Microphone)</h5>
                <p>
                  Microphone access is used exclusively during client-initiated voice recording to deliver daily updates to your coach. Camera access is used solely for capturing live meal and session photos. Sensors are never accessed passively in the background.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">3. GDPR Data Subject Rights</h5>
                <p>Under GDPR (EU) and CCPA (California), you hold the unconditional right to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)] text-xs">
                  <li><strong className="text-[var(--text-primary)] font-medium">Right to Portability (Export):</strong> Download a complete machine-readable JSON copy of your logs anytime from Privacy Settings.</li>
                  <li><strong className="text-[var(--text-primary)] font-medium">Right to Erasure (Forget Me):</strong> Permanently delete your account and all associated media files with 1-tap in your settings.</li>
                  <li><strong className="text-[var(--text-primary)] font-medium">Zero Ad-Network Tracking:</strong> We do not deploy third-party advertising cookies or track users across external websites.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-slide-in-right">
              <div className="p-4 rounded-2xl surface-card flex items-start gap-3">
                <FileText className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Terms of Platform Service</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    Standard rules governing user conduct, coach communication, and platform usage.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">1. Account Responsibility</h5>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree not to impersonate another athlete or coach.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">2. Acceptable Use & Media Uploads</h5>
                <p>
                  Uploaded photos and voice notes must strictly relate to athletic training, workout verification, nutrition meals, or coaching inquiries. Uploading obscene, harassing, or unlawful media is strictly prohibited and results in immediate account termination.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">3. Coach-Athlete Communication</h5>
                <p>
                  Voice feedback and emoji cheers provided by coaches within the app are professional guidance. Coaches are independent fitness professionals who adhere to high athletic standards.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider">4. Limitation of Liability (Data & Security)</h5>
                <p className="text-rose-300 bg-rose-500/10 p-4 rounded-xl border border-rose-500/30 text-xs leading-relaxed">
                  By using this application, you expressly agree that the developers, engineers, and platform hosts hold zero liability for data loss, accidental deletion, system downtime, or malicious security breaches resulting in data exposure. It is your sole responsibility to safeguard your account credentials.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Accept / Close Button */}
        <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] flex items-center justify-between backdrop-blur-xl pb-safe">
          <div className="flex items-center gap-2 text-xs text-[var(--text-primary)] font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Updated & Compliant 2026</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              onClose();
            }}
            className="py-2.5 px-6 rounded-2xl btn-primary text-xs font-bold tracking-tight shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
