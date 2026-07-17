import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Trophy, Target, ArrowLeft } from 'lucide-react';
import GitHubCalendar from '../components/GitHubCalendar';

interface StreaksPageProps {
  onBack: () => void;
}

export default function StreaksPage({ onBack }: StreaksPageProps) {
  const { streak, highestStreak, totalActiveDays, dailyActivities } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-2 font-display">
          Your Activity Streaks
        </h1>
        <p className="text-gray-400">Consistency is the key to financial freedom.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Flame className="text-orange-500 mb-2 animate-pulse-slow" size={32} />
            <span className="text-gray-400 text-sm font-medium mb-1">Current Streak</span>
            <span className="text-4xl font-bold text-white">{streak}</span>
            <span className="text-orange-500/70 text-xs mt-1">Days</span>
        </div>
        
        <div className="bg-[#1C1D2C] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Trophy className="text-yellow-500 mb-2" size={32} />
            <span className="text-gray-400 text-sm font-medium mb-1">Longest Streak</span>
            <span className="text-4xl font-bold text-white">{highestStreak}</span>
            <span className="text-gray-500 text-xs mt-1">Personal Best</span>
        </div>

        <div className="bg-[#1C1D2C] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Target className="text-indigo-400 mb-2" size={32} />
            <span className="text-gray-400 text-sm font-medium mb-1">Total Active Days</span>
            <span className="text-4xl font-bold text-white">{totalActiveDays}</span>
            <span className="text-gray-500 text-xs mt-1">Days tracking</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Activity Calendar</h2>
      <GitHubCalendar activities={dailyActivities} />
    </div>
  );
}
