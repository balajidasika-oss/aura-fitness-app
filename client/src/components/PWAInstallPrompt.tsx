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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent  animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-[var(--border)] p-5 shadow-none space-y-4">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--surface)] rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--surface)] text-gray-200 flex items-center justify-center shadow-lg shadow-[#FF3B30]/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Install Aura Phone App</h3>
              <p className="text-[10px] text-[#8E8E93] font-medium">Fast, offline & instant home screen launch</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-[#8E8E93] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[var(--border)] flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold tracking-tight text-xl shadow-lg shadow-[#FF3B30]/30">
            ⚡
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold tracking-tight text-white">Aura Fitness Coach</span>
              <span className="text-[9px] font-bold text-gray-200 bg-[var(--surface)] px-1.5 py-0.2 rounded border border-[var(--border)]">
                PWA v1.0
              </span>
            </div>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">
              Zero App Store downloads required. Runs in standalone native screen.
            </p>
          </div>
        </div>

        {/* State A: Already Installed */}
        {isStandalone && (
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-gray-200 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>AuraFit is already installed and running as a standalone phone app!</span>
          </div>
        )}

        {/* State B: Success after click */}
        {installedSuccessfully && (
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-gray-200 text-xs flex items-center space-x-2 animate-bounce">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Success! AuraFit is now installed on your device.</span>
          </div>
        )}

        {/* State C: iOS Instructions */}
        {isIOS && !isStandalone && (
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-[11px] font-bold tracking-tight text-gray-200 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📱 How to Install on iPhone / iPad:</span>
            </div>
            <ol className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[var(--surface)] text-gray-200 text-[10px] font-bold tracking-tight flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at bottom of Safari.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[var(--surface)] text-gray-200 text-[10px] font-bold tracking-tight flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-gray-200" />.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-[var(--surface)] text-gray-200 text-[10px] font-bold tracking-tight flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Tap <strong className="text-white">Add</strong> in top right. You're ready to train!</span>
              </li>
            </ol>
          </div>
        )}

        {/* State D: Android / Chrome 1-Click Install Button */}
        {!isIOS && !isStandalone && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className={`w-full py-3 rounded-2xl text-xs font-bold tracking-tight flex items-center justify-center space-x-2 transition shadow-lg ${
                deferredPrompt
                  ? 'bg-[#FF3B30] text-white shadow-[#FF3B30]/30 hover:scale-[1.02] active:scale-98'
                  : 'bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-[#8E8E93] cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? '1-Tap Add to Home Screen' : 'Install via Browser Menu (⋮ > Install)'}</span>
            </button>
            <p className="text-[10px] text-[#8E8E93] text-center font-medium">
              Works directly on Android Chrome, Samsung Internet, and Brave.
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2 text-xs font-bold text-[#8E8E93] hover:text-zinc-200 transition text-center"
        >
          Continue in Web Browser
        </button>
      </div>
    </div>
  );
};
