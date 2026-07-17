import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock, Star, ShieldCheck, Trophy, Flame, Target, Award, Calendar, TrendingUp } from 'lucide-react';
import { TROPHIES } from '../config/trophies';

// Map icon names to lucide react components
const iconMap: Record<string, React.ReactNode> = {
  Star: <Star size={32} />,
  ShieldCheck: <ShieldCheck size={32} />,
  Trophy: <Trophy size={32} />,
  Flame: <Flame size={32} />,
  Target: <Target size={32} />,
  Award: <Award size={32} />,
  Calendar: <Calendar size={32} />,
  TrendingUp: <TrendingUp size={32} />,
};

const rarityColors = {
  Common: 'from-gray-400 to-gray-500 shadow-gray-500/20 text-gray-300',
  Rare: 'from-blue-400 to-indigo-500 shadow-indigo-500/20 text-indigo-300',
  Epic: 'from-purple-400 to-pink-500 shadow-pink-500/20 text-pink-300',
  Legendary: 'from-yellow-400 to-orange-500 shadow-orange-500/20 text-yellow-300',
};

interface TrophiesPageProps {
  onBack: () => void;
}

export default function TrophiesPage({ onBack }: TrophiesPageProps) {
  const { unlockedBadges } = useApp();
  
  // Set for fast O(1) lookup
  const unlockedMap = new Map(unlockedBadges.map(b => [b.badgeId, b.unlockedAt]));

  const unlockedCount = unlockedMap.size;
  const totalCount = TROPHIES.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2 font-display flex items-center gap-3">
            <Trophy className="text-yellow-500" size={36} />
            Achievements
          </h1>
          <p className="text-gray-400">Unlock trophies by building great financial habits.</p>
        </div>
        
        <div className="bg-[#1C1D2C] border border-white/5 rounded-2xl p-4 min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-400">Completion</span>
                <span className="text-sm font-bold text-white">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TROPHIES.map(trophy => {
            const unlockedDate = unlockedMap.get(trophy.id);
            const isUnlocked = !!unlockedDate;
            const rarityStyle = rarityColors[trophy.rarity];
            
            return (
              <div 
                key={trophy.id} 
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col
                  ${isUnlocked ? 'bg-[#1C1D2C] border-white/10 hover:border-white/20' : 'bg-black/20 border-white/5 opacity-70'}
                `}
              >
                  {/* Rarity Glow if unlocked */}
                  {isUnlocked && (
                      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${rarityStyle.split(' ')[0]} ${rarityStyle.split(' ')[1]} blur-3xl opacity-20`}></div>
                  )}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`p-4 rounded-xl flex items-center justify-center
                        ${isUnlocked ? `bg-gradient-to-br ${rarityStyle.split(' ').slice(0,2).join(' ')} text-white shadow-lg ${rarityStyle.split(' ')[2]}` : 'bg-white/5 text-gray-500'}
                      `}>
                          {iconMap[trophy.icon] || <Trophy size={32} />}
                      </div>
                      
                      {!isUnlocked && (
                          <div className="p-2 bg-black/40 rounded-full text-gray-500">
                              <Lock size={16} />
                          </div>
                      )}
                      
                      {isUnlocked && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/10 ${rarityStyle.split(' ')[3]}`}>
                              {trophy.rarity}
                          </span>
                      )}
                  </div>
                  
                  <div className="relative z-10">
                      <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                          {trophy.name}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                          {trophy.description}
                      </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                      <span className="text-sm font-bold text-indigo-400">+{trophy.xp} XP</span>
                      {isUnlocked && unlockedDate ? (
                          <span className="text-xs text-gray-500">Unlocked {new Date(unlockedDate).toLocaleDateString()}</span>
                      ) : (
                          <span className="text-xs text-gray-600">Locked</span>
                      )}
                  </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
