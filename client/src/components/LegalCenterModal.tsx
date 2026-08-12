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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent  animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-[var(--border)] shadow-none">
        {/* Top Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]  relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[var(--surface)] text-gray-200 flex items-center justify-center shadow-md">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Aura Legal & Compliance Center</h3>
              <p className="text-[10px] text-[#8E8E93] font-medium">Terms, Health Waiver & Privacy Protection</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-[#8E8E93] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 gap-1.5 bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] border-b border-[var(--border)] text-xs">
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('parq');
            }}
            className={`py-2 px-1 rounded-2xl font-bold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'parq'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                : 'text-[#8E8E93] hover:text-zinc-200 hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>PAR-Q Waiver</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('privacy');
            }}
            className={`py-2 px-1 rounded-2xl font-bold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'privacy'
                ? 'bg-[var(--surface)] text-gray-200 border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                : 'text-[#8E8E93] hover:text-zinc-200 hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy & GDPR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setActiveTab('terms');
            }}
            className={`py-2 px-1 rounded-2xl font-bold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'terms'
                ? 'bg-[var(--surface)] text-gray-200 border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                : 'text-[#8E8E93] hover:text-zinc-200 hover:bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-zinc-300 leading-relaxed font-normal">
          {/* TAB 1: PAR-Q & HEALTH LIABILITY WAIVER */}
          {activeTab === 'parq' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white">Physical Activity Readiness & Medical Disclaimer</h4>
                  <p className="text-[11px] text-red-300/90 mt-0.5">
                    Physical training involves inherent risk of physical injury. Please review carefully before participating.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">1. Not Medical Advice</h5>
                <p>
                  The workouts, cardiovascular routines, rep schemes, and coaching voice feedback provided via Aura Fitness Coach are for general physical conditioning and educational purposes only. They do not constitute medical diagnosis, treatment, or professional physical therapy.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">2. PAR-Q Health Screening Checklist</h5>
                <p>
                  By utilizing this application, you attest that you do not have any of the following contraindications unless explicitly cleared in writing by a licensed physician:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[#8E8E93]">
                  <li>Diagnosed cardiovascular heart conditions or chest pain during physical exertion.</li>
                  <li>Frequent dizziness, loss of consciousness, or severe balance disorders.</li>
                  <li>Acute orthopedic bone, joint, or spinal issues aggravated by heavy resistance training.</li>
                  <li>Prescribed medications for blood pressure or heart conditions requiring clinical monitoring.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">3. Assumption of Risk & Voluntary Release</h5>
                <p>
                  You voluntarily agree to assume all physical risks associated with resistance lifting, high incline treadmill protocols, StairMaster climbing, and athletic activities. You release Aura Fitness, coaches, and administrators from any liability for accidental injury or property damage resulting from workout execution.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & GDPR DATA RIGHTS */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-gray-200 flex items-start space-x-2.5">
                <Shield className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white">Privacy Policy & Biometric Protection (GDPR / CCPA)</h4>
                  <p className="text-[11px] text-gray-200/90 mt-0.5">
                    Your personal biometric data, photos, and voice memos belong to you. We do not sell or broker user data.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">1. Data We Collect</h5>
                <ul className="list-disc pl-4 space-y-1 text-[#8E8E93]">
                  <li><strong className="text-zinc-200">Account Profile:</strong> Name, email address, fitness goals, and profile photo.</li>
                  <li><strong className="text-zinc-200">Workout Logs:</strong> Muscle groups, exercises, sets, reps, weight (kg), session duration, and cardio metrics (incline, floors, pace).</li>
                  <li><strong className="text-zinc-200">Media & Sensor Audio:</strong> Daily meal photos, post-workout selfies, and voice memos recorded via your device microphone.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">2. Device Sensor Permissions (Camera & Microphone)</h5>
                <p>
                  Microphone access is used exclusively during client-initiated voice recording to deliver daily updates to your coach. Camera access is used solely for capturing live meal and session photos. Sensors are never accessed passively in the background.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">3. GDPR Data Subject Rights</h5>
                <p>Under GDPR (EU) and CCPA (California), you hold the unconditional right to:</p>
                <ul className="list-disc pl-4 space-y-1 text-[#8E8E93]">
                  <li><strong className="text-zinc-200">Right to Portability (Export):</strong> Download a complete machine-readable JSON copy of your logs anytime from Privacy Settings.</li>
                  <li><strong className="text-zinc-200">Right to Erasure (Forget Me):</strong> Permanently delete your account and all associated media files with 1-tap in your settings.</li>
                  <li><strong className="text-zinc-200">Zero Ad-Network Tracking:</strong> We do not deploy third-party advertising cookies or track users across external websites.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">4. Security Disclaimer & "As Is" Provision</h5>
                <p>
                  While we implement strict cryptographic measures (e.g., PBKDF2 hashing) to protect your account, this platform is provided "AS IS" and without warranties. You agree that the creators and operators of Aura Fitness OS are <strong className="text-white font-bold">strictly not liable</strong> for any unauthorized access, data loss, server interruptions, or account breaches. Do not store sensitive health records beyond general fitness tracking on this platform.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-gray-200 flex items-start space-x-2.5">
                <FileText className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white">Terms of Platform Service</h4>
                  <p className="text-[11px] text-gray-200/90 mt-0.5">
                    Standard rules governing user conduct, coach communication, and platform usage.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">1. Account Responsibility</h5>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree not to impersonate another athlete or coach.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">2. Acceptable Use & Media Uploads</h5>
                <p>
                  Uploaded photos and voice notes must strictly relate to athletic training, workout verification, nutrition meals, or coaching inquiries. Uploading obscene, harassing, or unlawful media is strictly prohibited and results in immediate account termination.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">3. Coach-Athlete Communication</h5>
                <p>
                  Voice feedback and emoji cheers provided by coaches within the app are professional guidance. Coaches are independent fitness professionals who adhere to high athletic standards.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider">4. Limitation of Liability (Data & Security)</h5>
                <p className="text-red-200/90 bg-red-950/20 p-2.5 rounded-2xl border border-red-900/50">
                  By using this application, you expressly agree that the developers, engineers, and platform hosts hold zero liability for data loss, accidental deletion, system downtime, or malicious security breaches resulting in data exposure. It is your sole responsibility to safeguard your account credentials.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Accept / Close Button */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-200 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Updated & Compliant 2026</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              onClose();
            }}
            className="py-2 px-5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface)] text-white text-xs font-bold tracking-tight transition shadow-lg shadow-[#FF3B30]/20 active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
