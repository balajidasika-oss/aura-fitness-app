import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Shield,
  UserCheck,
  Flame,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  ChevronRight,
  Activity,
  Award,
  Camera,
  Upload,
  RefreshCw,
  X,
  ShieldAlert,
  Check,
  Dumbbell,
  Target,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCoaches } from '../../services/api';
import { IUser, UserRole } from '../../types';
import { soundFx } from '../../utils/audio';
import { LiveCameraModal } from '../../components/LiveCameraModal';
import { LegalCenterModal, LegalTab } from '../../components/LegalCenterModal';

interface AuthScreenProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  isModal?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onLoginSuccess, isModal = false }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [availableCoaches, setAvailableCoaches] = useState<IUser[]>([]);

  // Sign In / Sign Up Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Hypertrophy & Incline Conditioning');
  const [coachCode, setCoachCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Photo State for Registration
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legal & Compliance State
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTab>('parq');

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const coaches = await fetchCoaches();
      setAvailableCoaches(coaches);
    } catch {
      setAvailableCoaches([]);
    }
  };

  const handleComplete = () => {
    if (onLoginSuccess) onLoginSuccess();
    if (onSuccess) onSuccess();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      soundFx.playTapSound();
    }
  };

  const handleCaptureCamera = (photoDataUrl: string) => {
    setAvatarPreview(photoDataUrl);
    setIsCameraOpen(false);
    soundFx.playSuccessChime();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await login(email.trim(), password);
      soundFx.playCheerSound();
      handleComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      soundFx.playErrorSound();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!legalAgreed) {
      setErrorMsg('Please review and accept the Health Readiness & Terms to proceed.');
      soundFx.playErrorSound();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        fitnessGoal: selectedRole === 'coach' ? (fitnessGoal || 'Head Performance Coach') : fitnessGoal,
        phone: phone.trim(),
        coachCode: selectedRole === 'client' ? coachCode.trim() : undefined,
        avatarUrl: avatarPreview || undefined,
        avatarFile,
      });

      soundFx.playSuccessChime();
      handleComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      soundFx.playErrorSound();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${isModal ? 'p-0' : 'p-4 sm:p-6'}`}>
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-none relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-[var(--surface)] blur-3xl pointer-events-none rounded-full" />

        {/* Header Branding */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-gray-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Aura Fitness OS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white tracking-tight">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Aura Profile'}
          </h2>
          <p className="text-sm text-[#8E8E93] mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Access your daily training logs, nutrition tracking, and coaching portal.'
              : 'Join elite athletes and coaches with encrypted cloud sync.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              soundFx.playTapSound();
            }}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-[var(--surface)] text-white shadow-lg shadow-[#FF3B30]/20 font-bold tracking-tight'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              soundFx.playTapSound();
            }}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'register'
                ? 'bg-[var(--surface)] text-white shadow-lg shadow-[#FF3B30]/20 font-bold tracking-tight'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-rose-200">Attention Needed</div>
              <div>{errorMsg}</div>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold tracking-tight text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-none shadow-[#FF3B30]/25 transition-all transform active:scale-98 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#8E8E93]">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-bold text-gray-200 hover:underline"
              >
                Create one now
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5 relative z-10">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('client');
                    soundFx.playTapSound();
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                    selectedRole === 'client'
                      ? 'bg-[var(--surface)] border-[var(--border)] text-white shadow-lg shadow-[#FF3B30]/10'
                      : 'bg-slate-950/60 border-slate-800 text-[#8E8E93] hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                      selectedRole === 'client' ? 'bg-[var(--surface)] text-white font-bold' : 'bg-slate-800 text-[#8E8E93]'
                    }`}
                  >
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Athlete / Client</div>
                    <div className="text-[11px] text-[#8E8E93]">Log workouts & meals</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('coach');
                    soundFx.playTapSound();
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                    selectedRole === 'coach'
                      ? 'bg-[var(--surface)] border-[var(--border)] text-white shadow-lg shadow-[#FF3B30]/10'
                      : 'bg-slate-950/60 border-slate-800 text-[#8E8E93] hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                      selectedRole === 'coach' ? 'bg-[var(--surface)] text-white font-bold' : 'bg-slate-800 text-[#8E8E93]'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Trainer / Coach</div>
                    <div className="text-[11px] text-[#8E8E93]">Manage client roster</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Profile Avatar Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Profile Photo (Optional)
              </label>
              <div className="flex items-center gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-[var(--border)] shrink-0 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-xs text-slate-300 font-medium">Upload or snap a headshot</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-200" />
                      <span>Choose File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-gray-200" />
                      <span>Take Photo</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password (6+ chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Fitness Goal or Coach Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {selectedRole === 'client' ? 'Primary Fitness Goal' : 'Coaching Specialty / Bio'}
              </label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'client'
                      ? 'e.g. Muscle Gain, Marathon Prep, Fat Loss'
                      : 'e.g. Strength & Conditioning Specialist'
                  }
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* If Client: Optional Coach Invite Code */}
            {selectedRole === 'client' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Coach Invite Code (Optional)
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. COACH-ALEX-8392"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm uppercase tracking-wider focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                {availableCoaches.length > 0 && (
                  <div className="mt-2 text-xs text-[#8E8E93]">
                    Active Coaches:{' '}
                    {availableCoaches.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setCoachCode(c.coachCode || '')}
                        className="inline-block text-gray-200 hover:underline mr-2"
                      >
                        {c.name} ({c.coachCode || 'No Code'})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legal & Health Consent */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={legalAgreed}
                  onChange={(e) => setLegalAgreed(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-700 text-gray-200 focus:ring-emerald-500 bg-slate-900 mt-0.5"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLegalInitialTab('parq');
                      setIsLegalOpen(true);
                    }}
                    className="text-gray-200 underline font-semibold"
                  >
                    PAR-Q Health Readiness
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLegalInitialTab('liability');
                      setIsLegalOpen(true);
                    }}
                    className="text-gray-200 underline font-semibold"
                  >
                    Liability Waiver
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLegalInitialTab('privacy');
                      setIsLegalOpen(true);
                    }}
                    className="text-gray-200 underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold tracking-tight text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-none shadow-[#FF3B30]/25 transition-all transform active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#8E8E93]">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-bold text-gray-200 hover:underline"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Live Camera Modal */}
        <LiveCameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCaptureCamera}
          title="Take Profile Photo"
        />

        {/* Legal Center Modal */}
        <LegalCenterModal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          initialTab={legalInitialTab}
        />
      </div>
    </div>
  );
};
