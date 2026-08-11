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

      {/* Footer Watermark */}
      <footer className="w-full py-6 mt-auto border-t border-slate-800/50 bg-[#07090e]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
          <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
            Engineered with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> by
            <a href="https://www.linkedin.com/in/balajidasika/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors ml-1">
              Balaji Dasika
            </a>
          </p>
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
