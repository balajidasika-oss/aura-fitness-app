import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Bell, Heart, Sparkles, Activity, Clock, Image as ImageIcon, ScanEye } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AIPoseCoach } from './AIPoseCoach';

const YOGA_ASANAS = [
  { name: 'Downward Dog (Adho Mukha Svanasana)', benefits: 'Stretches hamstrings, calves, and spine. Builds upper body strength.', duration: '60s', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Warrior II (Virabhadrasana II)', benefits: 'Strengthens legs and ankles. Opens hips and chest.', duration: '45s/side', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' },
  { name: 'Tree Pose (Vrksasana)', benefits: 'Improves balance and focus. Strengthens thighs and core.', duration: '30s/side', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400' },
  { name: 'Plank Pose (Kumbhakasana)', benefits: 'Strengthens the core, arms, and wrists. Improves posture.', duration: '45s', image: 'https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Cobra Pose (Bhujangasana)', benefits: 'Strengthens the spine. Stretches chest and lungs.', duration: '30s', image: 'https://images.unsplash.com/photo-1593164842264-854604db2260?auto=format&fit=crop&q=80&w=400' },
  { name: 'Triangle Pose (Trikonasana)', benefits: 'Stretches and strengthens the thighs, knees, and ankles.', duration: '40s/side', image: 'https://images.unsplash.com/photo-1552286450-516cb3c75eb3?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bridge Pose (Setu Bandhasana)', benefits: 'Calms the brain. Stretches chest, neck, and spine.', duration: '45s', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Childs Pose (Balasana)', benefits: 'Rests the lower back. Calms the mind and central nervous system.', duration: '90s', image: 'https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?auto=format&fit=crop&q=80&w=400' },
];

const ZUMBA_VIDEOS = [
  { id: '1', title: 'High-Energy Zumba Cardio', duration: '15 Min', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400' },
  { id: '2', title: 'Latin Dance Fitness', duration: '20 Min', thumbnail: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=400' },
  { id: '3', title: 'Zumba Core & Rhythm', duration: '12 Min', thumbnail: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400' },
  { id: '4', title: 'Reggaeton Fitness Dance', duration: '25 Min', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' },
  { id: '5', title: 'Salsa Sweat Session', duration: '30 Min', thumbnail: 'https://images.unsplash.com/photo-1504609774528-ce5092a407f8?auto=format&fit=crop&q=80&w=400' },
  { id: '6', title: 'Hip Hop Cardio Blast', duration: '18 Min', thumbnail: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&q=80&w=400' },
];

export const YogaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'yoga' | 'meditation' | 'zumba'>('yoga');
  
  // Meditation Timer State
  const [meditationTimeRemaining, setMeditationTimeRemaining] = useState(300); // 5 mins default
  const [isMeditating, setIsMeditating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(300);

  // AI Coach State
  const [aiCoachAsana, setAiCoachAsana] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating && meditationTimeRemaining > 0) {
      interval = setInterval(() => {
        setMeditationTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isMeditating && meditationTimeRemaining === 0) {
      setIsMeditating(false);
      soundFx.playCheerSound(); // Alert when meditation ends
    }
    return () => clearInterval(interval);
  }, [isMeditating, meditationTimeRemaining]);

  const toggleMeditation = () => {
    soundFx.playTapSound();
    setIsMeditating(!isMeditating);
  };

  const resetMeditation = () => {
    soundFx.playTapSound();
    setIsMeditating(false);
    setMeditationTimeRemaining(selectedDuration);
  };

  const changeDuration = (mins: number) => {
    soundFx.playTapSound();
    setSelectedDuration(mins * 60);
    setMeditationTimeRemaining(mins * 60);
    setIsMeditating(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel-elevated rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative group">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh-dark opacity-30 pointer-events-none transition-opacity group-hover:opacity-50" />
      {aiCoachAsana && (
        <AIPoseCoach 
          targetAsana={aiCoachAsana} 
          onClose={() => setAiCoachAsana(null)} 
        />
      )}
      
      {/* Studio Header */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-5 border-b border-white/5 backdrop-blur-md">
        <h2 className="text-xl font-black flex items-center gap-2 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          <Sparkles className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
          Mind & Body Studio
        </h2>
        <p className="text-xs text-indigo-200/80 mt-1 font-medium tracking-wide">Holistic wellness, yoga, meditation, and dance.</p>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex border-b border-white/5 p-2 gap-2 bg-black/20 backdrop-blur-md shadow-inner">
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('yoga'); }}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'yoga' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-zinc-400 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Yoga Asanas
        </button>
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('meditation'); }}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'meditation' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-zinc-400 hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Meditation
        </button>
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('zumba'); }}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'zumba' ? 'bg-pink-500/30 text-pink-300 border border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'text-zinc-400 hover:bg-white/5'
          }`}
        >
          <Heart className="w-3.5 h-3.5" /> Zumba Class
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {/* YOGA TAB */}
        {activeTab === 'yoga' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Follow these foundational asanas to improve flexibility, balance, and core strength. Breathe deeply through each posture.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {YOGA_ASANAS.map((asana, idx) => (
                <div key={idx} className="glass-panel rounded-2xl overflow-hidden group hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]">
                  <div className="h-36 bg-zinc-900 relative overflow-hidden">
                    <img src={asana.image} alt={asana.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        {asana.duration}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">{asana.name}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[40px]">{asana.benefits}</p>
                    <button
                      onClick={() => {
                        soundFx.playTapSound();
                        setAiCoachAsana(asana.name);
                      }}
                      className="w-full py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-400 flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <ScanEye className="w-3.5 h-3.5" />
                      Start AI Coach
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDITATION TAB */}
        {activeTab === 'meditation' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Guided Silent Meditation</h3>
              <p className="text-xs text-zinc-400">Clear your mind. A bell will sound when your session ends.</p>
            </div>
            
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-4 border-zinc-800 ${isMeditating ? 'animate-pulse border-purple-500/50' : ''}`} />
              <div className="text-5xl font-black text-white tabular-nums tracking-tighter">
                {formatTime(meditationTimeRemaining)}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={() => changeDuration(3)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300">3 Min</button>
              <button onClick={() => changeDuration(5)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300">5 Min</button>
              <button onClick={() => changeDuration(10)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300">10 Min</button>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={toggleMeditation}
                className="w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 transition active:scale-95"
              >
                {isMeditating ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button
                onClick={resetMeditation}
                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ZUMBA TAB */}
        {activeTab === 'zumba' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
            <p className="text-xs text-pink-200/80 leading-relaxed font-medium">
              Get your heart rate up with these fun, high-energy dance cardio sessions.
            </p>
            <div className="space-y-3">
              {ZUMBA_VIDEOS.map((video) => (
                <div key={video.id} className="flex items-center p-2.5 rounded-2xl glass-panel hover:border-pink-500/40 hover:-translate-x-1 hover:shadow-[0_5px_15px_rgba(236,72,153,0.15)] transition-all duration-300 group cursor-pointer">
                  <div className="w-28 h-20 rounded-xl overflow-hidden relative shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)] group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-black text-white group-hover:text-pink-300 transition-colors">{video.title}</h4>
                    <span className="text-[10px] text-pink-400 font-black bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded mt-2 inline-block">
                      {video.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
