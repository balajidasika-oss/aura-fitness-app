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
    }
  }, [isAuthenticated, currentUser?._id]);

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
