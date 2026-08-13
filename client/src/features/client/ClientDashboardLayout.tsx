import React, { useState } from 'react';
import { IClientUser } from '../../types';
import { ClientDailyLogger } from './ClientDailyLogger';
import { YogaStudio } from './YogaStudio';
import { AthleteProfile } from './AthleteProfile';
import { ArrowLeft, Dumbbell, Flame, Apple, Sparkles, BrainCircuit, Trophy, ChevronRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';

const ClientCardioDashboard = () => (
  <div className="p-8 text-center glass-card rounded-3xl border border-[var(--border-subtle)] max-w-2xl mx-auto mt-12 animate-fade-in-up">
    <Flame className="w-16 h-16 text-rose-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Cardio & Movement</h2>
    <p className="text-[var(--text-secondary)] mt-2">Activity tracking and conditioning routines coming soon.</p>
  </div>
);

const ClientNutritionDashboard = () => (
  <div className="p-8 text-center glass-card rounded-3xl border border-[var(--border-subtle)] max-w-2xl mx-auto mt-12 animate-fade-in-up">
    <Apple className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Nutrition & Macros</h2>
    <p className="text-[var(--text-secondary)] mt-2">Meal planning and macro tracking coming soon.</p>
  </div>
);

interface ClientDashboardLayoutProps {
  client: IClientUser;
}

type TabType = 'hub' | 'workout' | 'cardio' | 'nutrition' | 'yoga' | 'profile';

export const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ client }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hub');

  const handleTabChange = (tab: TabType) => {
    soundFx.playTapSound();
    setActiveTab(tab);
  };

  const portals = [
    { id: 'hub', label: 'Hub', icon: BrainCircuit, image: null },
    { id: 'workout', label: 'Weight Training', icon: Dumbbell, image: '/weight_training_portal_1786600262335.jpg', color: 'text-indigo-400' },
    { id: 'cardio', label: 'Cardio', icon: Flame, image: '/cardio_portal_1786600827157.jpg', color: 'text-rose-400' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, image: '/nutrition_portal_1786600857872.jpg', color: 'text-emerald-400' },
    { id: 'yoga', label: 'Yoga Studio', icon: Sparkles, image: '/yoga_ai_portal_1786601101378.jpg', color: 'text-violet-400' },
    { id: 'profile', label: 'Profile', icon: Trophy, image: '/profile_portal_1786602132695.jpg', color: 'text-amber-400' }
  ] as const;

  return (
    <div className="w-full flex flex-col animate-fade-in-up min-h-screen pb-safe">
      {/* Top Navigation when not in Hub */}
      {activeTab !== 'hub' && (
        <div className="sticky top-0 z-50 w-full bg-[var(--bg-surface-0)]/90 backdrop-blur-2xl border-b border-[var(--border-subtle)] px-2 py-3 md:px-4 md:py-4 shadow-sm pt-safe">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto snap-x hide-scrollbar pb-1 max-w-6xl mx-auto">
            <button
              onClick={() => handleTabChange('hub')}
              className="flex-shrink-0 snap-start flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-1)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {portals.filter(p => p.id !== 'hub').map(portal => (
              <button
                key={portal.id}
                onClick={() => handleTabChange(portal.id as TabType)}
                className={`flex-shrink-0 snap-start relative overflow-hidden rounded-2xl border transition-all duration-300 w-32 md:w-40 h-12 md:h-14 flex items-center px-3 ${
                  activeTab === portal.id 
                    ? 'border-[var(--text-primary)] ring-2 ring-[var(--text-primary)]/20' 
                    : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url('${portal.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
                <div className="relative z-10 flex items-center gap-2">
                  <portal.icon className={`w-4 h-4 md:w-5 md:h-5 ${portal.color}`} />
                  <span className="text-[10px] md:text-xs font-bold text-white tracking-wide truncate">{portal.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 w-full pb-24 md:pb-8 relative">
        {activeTab === 'hub' && (
          <div className="animate-scale-in">
            {/* Header for Hub */}
            <div className="text-center mb-10 px-4 mt-8 md:mt-12">
              <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
                Welcome back, {client.name.split(' ')[0]}
              </h1>
              <p className="text-sm md:text-lg text-[var(--text-secondary)] font-medium">
                Select a module to continue your training
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 w-full max-w-6xl mx-auto">
              
              {/* Weight Training */}
              <button 
                onClick={() => handleTabChange('workout')} 
                className="group text-left p-5 md:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 glass-card-interactive md:col-span-2 min-h-[200px] md:min-h-[240px] flex flex-col justify-end border border-[var(--border-subtle)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                  style={{ backgroundImage: `url('/weight_training_portal_1786600262335.jpg')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-4 bg-[var(--bg-glass)] rounded-xl md:rounded-2xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500">
                  <Dumbbell className="w-5 h-5 md:w-8 md:h-8 text-indigo-400" />
                </div>
                <div className="relative z-10 pr-12 md:pr-0">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-1.5 md:mb-2 tracking-tight">Weight Training</h3>
                  <p className="text-white/80 font-medium text-xs md:text-lg max-w-sm line-clamp-2 md:line-clamp-none">Track heavy lifts, progressive overload, and build serious muscle mass.</p>
                </div>
              </button>

              {/* Cardio & Movement */}
              <button 
                onClick={() => handleTabChange('cardio')} 
                className="group text-left p-5 md:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 glass-card-interactive min-h-[200px] md:min-h-[240px] flex flex-col justify-end border border-[var(--border-subtle)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                  style={{ backgroundImage: `url('/cardio_portal_1786600827157.jpg')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-4 bg-[var(--bg-glass)] rounded-xl md:rounded-2xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500">
                  <Flame className="w-5 h-5 md:w-8 md:h-8 text-rose-400" />
                </div>
                <div className="relative z-10 pr-12 md:pr-0">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 md:mb-2 tracking-tight">Cardio & Movement</h3>
                  <p className="text-white/80 font-medium text-xs md:text-base line-clamp-2 md:line-clamp-none">Heart rate, conditioning, and endurance work.</p>
                </div>
              </button>

              {/* Nutrition & Macros */}
              <button 
                onClick={() => handleTabChange('nutrition')} 
                className="group text-left p-5 md:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 glass-card-interactive min-h-[200px] md:min-h-[240px] flex flex-col justify-end border border-[var(--border-subtle)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                  style={{ backgroundImage: `url('/nutrition_portal_1786600857872.jpg')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-4 bg-[var(--bg-glass)] rounded-xl md:rounded-2xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500">
                  <Apple className="w-5 h-5 md:w-8 md:h-8 text-emerald-400" />
                </div>
                <div className="relative z-10 pr-12 md:pr-0">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 md:mb-2 tracking-tight">Nutrition & Macros</h3>
                  <p className="text-white/80 font-medium text-xs md:text-base line-clamp-2 md:line-clamp-none">Fuel your body. Track calories, protein, and daily habits.</p>
                </div>
              </button>

              {/* Yoga & AI Pose Coach */}
              <button 
                onClick={() => handleTabChange('yoga')} 
                className="group text-left p-5 md:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 glass-card-interactive md:col-span-2 min-h-[200px] md:min-h-[240px] flex flex-col justify-end border border-[var(--border-subtle)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                  style={{ backgroundImage: `url('/yoga_ai_portal_1786601101378.jpg')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 md:gap-3">
                  <div className="p-2.5 md:p-4 bg-[var(--bg-glass)] rounded-xl md:rounded-2xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:-translate-y-1 transition-transform duration-500 hidden sm:block">
                    <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-cyan-400" />
                  </div>
                  <div className="p-2.5 md:p-4 bg-[var(--bg-glass)] rounded-xl md:rounded-2xl border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:translate-y-1 transition-transform duration-500">
                    <BrainCircuit className="w-5 h-5 md:w-8 md:h-8 text-violet-400" />
                  </div>
                </div>
                
                <div className="relative z-10 pr-12 md:pr-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-1.5 md:mb-2 items-start">
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Yoga Studio</h3>
                    <span className="px-2.5 py-0.5 md:px-3 md:py-1 bg-violet-500/20 text-violet-300 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-violet-500/30 whitespace-nowrap">AI Coach</span>
                  </div>
                  <p className="text-white/80 font-medium text-xs md:text-lg max-w-sm line-clamp-2 md:line-clamp-none">Real-time pose correction and guided flows powered by advanced computer vision.</p>
                </div>
              </button>

              {/* Athlete Profile & History */}
              <button 
                onClick={() => handleTabChange('profile')} 
                className="group text-left p-5 md:p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 glass-card-interactive lg:col-span-3 min-h-[160px] md:min-h-[200px] flex flex-col justify-end border border-[var(--border-subtle)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
                  style={{ backgroundImage: `url('/profile_portal_1786602132695.jpg')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 md:p-6 bg-[var(--bg-glass)] rounded-2xl md:rounded-[2rem] border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 hidden sm:block">
                  <Trophy className="w-8 h-8 md:w-12 md:h-12 text-amber-400" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="pr-12 md:pr-32">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1.5 md:mb-2 tracking-tight">Athlete Profile</h3>
                    <p className="text-white/80 font-medium text-xs md:text-lg max-w-2xl line-clamp-2 md:line-clamp-none">View past performance, analyze trends, and manage your personal details.</p>
                  </div>
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-amber-400 group-hover:translate-x-2 transition-transform duration-300 sm:hidden absolute right-0" />
                </div>
              </button>

            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto md:px-4">
          {activeTab === 'workout' && <ClientDailyLogger client={client} />}
          {activeTab === 'cardio' && <ClientCardioDashboard />}
          {activeTab === 'nutrition' && <ClientNutritionDashboard />}
          {activeTab === 'yoga' && <YogaStudio />}
          {activeTab === 'profile' && <AthleteProfile client={client} />}
        </div>
      </div>
    </div>
  );
};

