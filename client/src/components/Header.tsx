import React, { useState } from 'react';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Shield, 
  Flame, 
  Smartphone, 
  Award,
  Lock,
  User as UserIcon,
  Copy,
  Check,
  Github,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  onOpenPWAInstall?: () => void;
  onOpenLegal?: () => void;
  onOpenPrivacy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPWAInstall,
  onOpenLegal,
  onOpenPrivacy,
}) => {
  const { currentUser, logout, activeRole } = useAuth();
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [copiedCode, setCopiedCode] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      const isInstalledAlready = localStorage.getItem('pwa_installed') === 'true';
      setIsStandalone(isStandaloneMode || isInstalledAlready);

      const handleAppInstalled = () => {
        localStorage.setItem('pwa_installed', 'true');
        setIsStandalone(true);
      };
      
      window.addEventListener('appinstalled', handleAppInstalled);
      return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }
  }, []);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCoachCode = () => {
    if (currentUser?.coachCode) {
      navigator.clipboard.writeText(currentUser.coachCode);
      setCopiedCode(true);
      soundFx.playSuccessChime();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-glass)] backdrop-blur-xl border-b border-[var(--border-subtle)] transition-all duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0 animate-fade-in-up">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg text-white font-bold">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--bg-void)] text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">AURAFIT</span>
                <span className="pill text-[9px] sm:text-[10px] uppercase font-bold">
                  {activeRole === 'coach' ? 'Coach Portal' : 'Athlete'}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] hidden sm:block">Performance Habit Logger & Coach OS</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If Coach: Show their Invite Code */}
            {currentUser?.role === 'coach' && currentUser.coachCode && (
              <button
                onClick={handleCopyCoachCode}
                title="Copy Coach Invite Code to share with athletes"
                className="hidden sm:flex items-center gap-1.5 btn-ghost rounded-2xl px-2.5 py-1 text-xs transition active:scale-95 animate-scale-in"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{currentUser.coachCode}</span>
                {copiedCode ? <Check className="w-3 h-3 text-[var(--text-primary)]" /> : <Copy className="w-3 h-3 text-[var(--text-secondary)]" />}
              </button>
            )}

            {/* Active User Info */}
            {currentUser && (
              <div className="flex items-center gap-2 glass-card rounded-2xl px-2 sm:px-2.5 py-1 sm:py-1.5">
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[var(--border-subtle)]"
                  />
                  {currentUser.streak && currentUser.streak > 0 ? (
                    <span className="absolute -bottom-1 -right-1 bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-bold text-[7px] sm:text-[8px] px-1 rounded-full flex items-center border border-[var(--border-subtle)]">
                      <Flame className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-amber-500 text-amber-500" />
                    </span>
                  ) : null}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] capitalize">
                    {currentUser.role === 'coach' ? 'Coach' : `${currentUser.streak || 0}d streak`}
                  </p>
                </div>
              </div>
            )}

            {/* Audio Sound Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className={`p-1.5 sm:p-2 rounded-2xl text-xs transition-all duration-300 active:scale-95 ${
                isMuted
                  ? 'bg-[var(--bg-surface-1)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  : 'btn-ghost border border-[var(--border-subtle)]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* GitHub Profile */}
            <a
              href="https://github.com/balajidasika"
              target="_blank"
              rel="noopener noreferrer"
              title="Developer GitHub Profile"
              className="flex p-1.5 sm:p-2 rounded-2xl btn-ghost border border-[var(--border-subtle)] active:scale-95 transition-all duration-300"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Install PWA Button */}
            {onOpenPWAInstall && !isStandalone && (
              <button
                onClick={() => {
                  soundFx.playTapSound();
                  onOpenPWAInstall();
                }}
                title="Install PWA / Add to Home Screen"
                className="flex p-1.5 sm:p-2 rounded-2xl btn-ghost border border-[var(--border-subtle)] active:scale-95 transition-all duration-300"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            {/* Privacy / Legal */}
            {onOpenLegal && (
              <button
                onClick={() => {
                  soundFx.playTapSound();
                  onOpenLegal();
                }}
                title="Legal & Safety Policy"
                className="hidden md:flex p-1.5 sm:p-2 rounded-2xl btn-ghost border border-[var(--border-subtle)] active:scale-95 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={() => {
                logout();
              }}
              title="Sign Out"
              className="p-1.5 sm:p-2 rounded-2xl btn-danger active:scale-95 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
