import React from 'react';
import { Flame, Trophy, Zap, Activity, Award } from 'lucide-react';

export const GamificationDashboard: React.FC = () => {
  return (
    <div className="w-full bg-[#0F0F0F]  border border-neutral-800 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-neutral-800 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Athlete Profile
          </h2>
          <p className="text-neutral-200/80 font-medium mt-1">Level 4 • Pro Contender</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1">Streak</span>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="text-xl font-black text-white">5 Days</span>
            </div>
          </div>
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl px-5 py-3 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Volume</span>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
              <span className="text-xl font-black text-white">12.4k lbs</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trophy Room</h3>
          <span className="text-xs font-bold text-neutral-200 bg-neutral-800 px-2 py-1 rounded-md">2 / 12 Unlocked</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Unlocked Badge */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-neutral-700 rounded-2xl p-4 flex flex-col items-center text-center shadow-none relative overflow-hidden group hover:scale-105 transition-all cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-neutral-200" />
            </div>
            <h4 className="text-white font-bold text-sm">First Flow</h4>
            <p className="text-neutral-200 text-xs font-medium mt-1">Completed Yoga</p>
          </div>
          
          {/* Unlocked Badge */}
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-900/20 border border-pink-500/30 rounded-2xl p-4 flex flex-col items-center text-center shadow-none relative overflow-hidden group hover:scale-105 transition-all cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h4 className="text-white font-bold text-sm">Rhythm King</h4>
            <p className="text-pink-400 text-xs font-medium mt-1">Completed Zumba</p>
          </div>
          
          {/* Locked Badge */}
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex flex-col items-center text-center opacity-50 grayscale cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-gray-500" />
            </div>
            <h4 className="text-gray-300 font-bold text-sm">Iron Week</h4>
            <p className="text-gray-500 text-xs font-medium mt-1">7 Day Streak</p>
          </div>
          
          {/* Locked Badge */}
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 flex flex-col items-center text-center opacity-50 grayscale cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-gray-500" />
            </div>
            <h4 className="text-gray-300 font-bold text-sm">Form Master</h4>
            <p className="text-gray-500 text-xs font-medium mt-1">99% AI Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
