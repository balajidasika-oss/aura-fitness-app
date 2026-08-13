import React, { useState } from 'react';
import { IClientUser } from '../../types';
import { ClientDailyLogger } from './ClientDailyLogger';
import { YogaStudio } from './YogaStudio';
import { AthleteProfile } from './AthleteProfile';
import { ClientLogHistory } from './ClientLogHistory';
import { Activity, History, User, HeartPulse, Trophy } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ClientDashboardLayoutProps {
  client: IClientUser;
}

type TabType = 'logger' | 'yoga' | 'history' | 'profile';

export const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ client }) => {
  const [activeTab, setActiveTab] = useState<TabType>('logger');

  const handleTabChange = (tab: TabType) => {
    soundFx.playTapSound();
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'logger', label: 'Workout Log', icon: Activity },
    { id: 'yoga', label: 'Yoga & Zen', icon: HeartPulse },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: Trophy },
  ] as const;

  return (
    <div className="w-full flex flex-col animate-fade-in-up">
      {/* Tab Navigation - Top on desktop, Bottom fixed on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:sticky md:top-4 bg-[var(--bg-glass)] backdrop-blur-xl border-t md:border border-[var(--border-subtle)] pb-6 md:pb-0 md:rounded-2xl md:mb-6 shadow-xl">
        <div className="max-w-md mx-auto md:max-w-none flex items-center justify-around md:justify-center p-2 md:gap-4 md:p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md scale-105 border border-[var(--border-subtle)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)] hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className={`text-[10px] md:text-sm font-bold tracking-tight uppercase ${isActive ? '' : 'hidden md:block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 w-full pb-24 md:pb-0 relative">
        {activeTab === 'logger' && <ClientDailyLogger client={client} />}
        {activeTab === 'yoga' && <YogaStudio />}
        {activeTab === 'history' && <ClientLogHistory client={client} />}
        {activeTab === 'profile' && <AthleteProfile client={client} />}
      </div>
    </div>
  );
};
