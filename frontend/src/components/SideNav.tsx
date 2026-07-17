'use client';

import React from 'react';
import {
  Home,
  BarChart3,
  Plus,
  Sparkles,
  User,
  Users,
  LogOut,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type Tab = 'home' | 'track' | 'add' | 'coach' | 'profile' | 'split';

interface SideNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'track', label: 'Track', icon: BarChart3 },
  { id: 'split', label: 'Split', icon: Users },
  { id: 'coach', label: 'Coach', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function SideNav({ activeTab, onTabChange }: SideNavProps) {
  const { user, logout, xp, streak, formatCurrency, wallets } = useApp();

  const totalBalanceUSD = wallets.reduce((sum, w) => {
    // simplified for visual representation
    return sum + w.balance; 
  }, 0);

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen border-r border-white/10 z-50 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      {/* Branding */}
      <div className="p-6">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Wallet className="w-6 h-6 text-indigo-500" />
          Finova
        </h1>
      </div>

      {/* User Info Snippet */}
      <div className="px-6 pb-6 mb-2 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</h3>
            <p className="text-xs text-gray-400 truncate">Lv.{Math.floor(xp / 100) + 1} · {streak} 🔥</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <button
          onClick={() => onTabChange('add')}
          className="w-full flex items-center gap-3 p-3 mb-4 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-heading text-sm">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
