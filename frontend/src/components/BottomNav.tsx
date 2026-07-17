'use client';

import React from 'react';
import {
  Home,
  BarChart3,
  Plus,
  Sparkles,
  User,
  Users
} from 'lucide-react';

type Tab = 'home' | 'track' | 'add' | 'coach' | 'profile' | 'split';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'track', label: 'Track', icon: BarChart3 },
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'split', label: 'Split', icon: Users },
  { id: 'coach', label: 'Coach', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 w-full md:hidden px-4 py-2 flex justify-between items-center z-50 safe-bottom bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10">
      {tabs.map((tab) => {
        if (tab.id === 'add') {
          return (
            <button
              key={tab.id}
              id="nav-add-btn"
              onClick={() => onTabChange('add')}
              className="fab-button"
              aria-label="Add Transaction"
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
          );
        }

        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-${tab.id}-btn`}
            onClick={() => onTabChange(tab.id)}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="font-heading">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
