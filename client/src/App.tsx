import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LandingShowcase } from './features/landing/LandingShowcase';
import { ClientDailyLogger } from './features/client/ClientDailyLogger';
import { CoachDashboard } from './features/coach/CoachDashboard';
import { IClientUser } from './types';
import { fetchClients } from './services/api';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { LegalCenterModal } from './components/LegalCenterModal';
import { PrivacyDataSettingsModal } from './components/PrivacyDataSettingsModal';
import { soundFx } from './utils/audio';
import { Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isAuthenticated, activeRole } = useAuth();
  const [clients, setClients] = useState<IClientUser[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true);

  // Mobile & Compliance Modals
  const [showPWAInstall, setShowPWAInstall] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Load clients roster if Coach is logged in
  const loadRoster = async () => {
    try {
      setIsLoadingClients(true);
      const coachId = currentUser?.role === 'coach' ? currentUser._id : undefined;
      const data = await fetchClients(coachId);
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRoster();
      
      // Request notification permissions and schedule reminder for clients
      if (currentUser?.role === 'client' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        
        // Simulating a reminder alert if they haven't logged recently
        const reminderTimer = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Coach Reminder!', {
              body: "Don't break your streak! Time to log your daily fitness and meals.",
              icon: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png'
            });
            soundFx.playCheerSound();
          }
        }, 120000); // Trigger after 2 mins for demo purposes
        
        return () => clearTimeout(reminderTimer);
      }
    }
  }, [isAuthenticated, currentUser?._id, currentUser?.role]);

  // Convert current user to IClientUser format for ClientDailyLogger
  const activeClient: IClientUser | null = (currentUser && currentUser.role === 'client')
    ? {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: 'client',
        avatarUrl: currentUser.avatarUrl,
        coachId: currentUser.coachId,
        coachName: currentUser.coachName,
        fitnessGoal: currentUser.fitnessGoal || 'Hypertrophy & Incline Conditioning',
        compliance: {
          score: 100,
          tier: 'green',
          streak: currentUser.streak || 0,
          weeklyHistory: [],
          loggedDaysCount: 0,
          totalKmRan: 0,
          averageKmPerRun: 0,
        },
        streak: currentUser.streak || 0,
        latestLogDate: null,
        totalLogsSubmitted: 0,
      }
    : null;

  // If user is not authenticated, show the interactive Fitness Showcase & Auth Landing page
  if (!isAuthenticated || !currentUser) {
    return (
      <LandingShowcase
        onOpenPWAInstall={() => setShowPWAInstall(true)}
        onOpenLegal={() => setShowLegalModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenPWAInstall={() => setShowPWAInstall(true)}
        onOpenLegal={() => setShowLegalModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />

      {/* Main Role Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeRole === 'client' && activeClient && (
          <ClientDailyLogger client={activeClient} />
        )}

        {activeRole === 'coach' && (
          <CoachDashboard
            coachUser={currentUser}
            clients={clients}
            isLoading={isLoadingClients}
            onRefresh={loadRoster}
          />
        )}
      </main>

      {/* Premium Portfolio Footer */}
      <footer className="w-full py-8 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-3xl relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white/5 pr-6 pl-2 py-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <img src="https://github.com/balajidasika.png" alt="Balaji Dasika" className="w-12 h-12 rounded-full border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20" />
            <div className="text-left">
              <p className="text-white text-sm font-black tracking-wide uppercase">Balaji Dasika</p>
              <p className="text-emerald-400/80 text-[10px] font-bold tracking-widest uppercase">Lead Engineer • Aura OS</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <a href="https://www.linkedin.com/in/balajidasika/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-blue-500/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              Connect
            </a>
            <a href="https://github.com/balajidasika" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-white/10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View GitHub
            </a>
          </div>
        </div>
      </footer>

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
        initialTab="parq"
      />

      {/* Privacy & GDPR Data Settings Modal */}
      <PrivacyDataSettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        user={currentUser}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
