import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Bell, Heart, Sparkles, Activity, Clock, Image as ImageIcon, ScanEye } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AIPoseCoach } from './AIPoseCoach';

const YOGA_ASANAS = [
  { name: 'Downward Dog (Adho Mukha Svanasana)', benefits: 'Stretches hamstrings, calves, and spine. Builds upper body strength.', duration: '60s', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Warrior II (Virabhadrasana II)', benefits: 'Strengthens legs and ankles. Opens hips and chest.', duration: '45s/side', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' },
  { name: 'Tree Pose (Vrksasana)', benefits: 'Improves balance and focus. Strengthens thighs and core.', duration: '30s/side', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400' },
  { name: 'Childs Pose (Balasana)', benefits: 'Rests the lower back. Calms the mind and central nervous system.', duration: '90s', image: 'https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?auto=format&fit=crop&q=80&w=400' },
];

const ZUMBA_VIDEOS = [
  { id: '1', title: 'High-Energy Zumba Cardio', duration: '15 Min', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400' },
  { id: '2', title: 'Latin Dance Fitness', duration: '20 Min', thumbnail: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=400' },
  { id: '3', title: 'Zumba Core & Rhythm', duration: '12 Min', thumbnail: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400' },
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
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      {aiCoachAsana && (
        <AIPoseCoach 
          targetAsana={aiCoachAsana} 
          onClose={() => setAiCoachAsana(null)} 
        />
      )}
      
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-4 border-b border-indigo-500/30">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Mind & Body Studio
        </h2>
        <p className="text-xs text-indigo-200 mt-1">Holistic wellness, yoga, meditation, and dance.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 p-2 gap-2 bg-zinc-950/50">
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('yoga'); }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'yoga' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Yoga Asanas
        </button>
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('meditation'); }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'meditation' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Meditation
        </button>
        <button
          onClick={() => { soundFx.playTapSound(); setActiveTab('zumba'); }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'zumba' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-zinc-400 hover:bg-zinc-800'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {YOGA_ASANAS.map((asana, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition">
                  <div className="h-32 bg-zinc-800 relative">
                    <img src={asana.image} alt={asana.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-[10px] font-black bg-indigo-500/90 text-white px-2 py-0.5 rounded shadow-sm">
                      {asana.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-white mb-1">{asana.name}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">{asana.benefits}</p>
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get your heart rate up with these fun, high-energy dance cardio sessions.
            </p>
            <div className="space-y-3">
              {ZUMBA_VIDEOS.map((video) => (
                <div key={video.id} className="flex items-center p-2 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-pink-500/40 transition group cursor-pointer">
                  <div className="w-24 h-16 rounded-xl overflow-hidden relative shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10">
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                        <Play className="w-3 h-3 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition">{video.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded mt-1 inline-block">
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
