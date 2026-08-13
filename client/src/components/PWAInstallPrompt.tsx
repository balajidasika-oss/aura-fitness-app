import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PWAInstallPromptProps {
  isOpen?: boolean;
  onClose?: () => void;
}

let globalDeferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  isOpen = false,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(isOpen);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Android/Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleInstallClick = async () => {
    soundFx.playTapSound();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccessfully(true);
        soundFx.playCheerSound();
        setTimeout(() => {
          setShowModal(false);
          onClose?.();
        }, 2000);
      }
      setDeferredPrompt(null);
    } else {
      alert("1-Tap Install is currently unavailable in this browser. To install the app, please tap your browser menu (⋮) and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const handleClose = () => {
    soundFx.playTapSound();
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl glass-card-elevated border border-[var(--border-medium)] p-6 space-y-5 animate-slide-up pb-safe">
        {/* Glow Accent */}
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-2)] text-[var(--text-primary)] flex items-center justify-center shadow-lg border border-[var(--border-subtle)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">Install Aura App</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Fast, offline & instant launch</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 p-2.5 rounded-2xl btn-ghost transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Preview Card */}
        <div className="p-4 rounded-2xl surface-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
            ⚡
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Aura Fitness Coach</span>
              <span className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                PWA v1.0
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Zero App Store required. Runs natively.
            </p>
          </div>
        </div>

        {/* State A: Already Installed */}
        {isStandalone && (
          <div className="p-3.5 rounded-2xl pill-emerald shadow-lg flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>AuraFit is installed and running natively!</span>
          </div>
        )}

        {/* State B: Success after click */}
        {installedSuccessfully && (
          <div className="p-3.5 rounded-2xl pill-emerald shadow-lg flex items-center gap-3 text-sm animate-bounce">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>Success! AuraFit is now installed.</span>
          </div>
        )}

        {/* State C: iOS Instructions */}
        {isIOS && !isStandalone && (
          <div className="space-y-3 p-4 rounded-2xl surface-card">
            <div className="text-xs font-bold tracking-tight text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <span>📱 How to Install on iOS:</span>
            </div>
            <ol className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-subtle)]">1</span>
                <span className="leading-relaxed">Tap the <strong className="text-[var(--text-primary)]">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-subtle)]">2</span>
                <span className="leading-relaxed">Scroll down and tap <strong className="text-[var(--text-primary)]">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[var(--text-primary)]" />.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-subtle)]">3</span>
                <span className="leading-relaxed">Tap <strong className="text-[var(--text-primary)]">Add</strong> in top right. You're ready to train!</span>
              </li>
            </ol>
          </div>
        )}

        {/* State D: Android / Chrome 1-Click Install Button */}
        {!isIOS && !isStandalone && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold tracking-tight flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                deferredPrompt
                  ? 'btn-primary'
                  : 'bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? '1-Tap Add to Home Screen' : 'Install via Browser Menu (⋮ > Install)'}</span>
            </button>
            <p className="text-xs text-[var(--text-muted)] text-center font-medium leading-relaxed">
              Works directly on Android Chrome, Samsung Internet, and Brave.
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-center"
        >
          Continue in Web Browser
        </button>
      </div>
    </div>
  );
};
