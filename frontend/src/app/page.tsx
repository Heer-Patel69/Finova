'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import HomePage from '../pages/HomePage';
import TrackPage from '../pages/TrackPage';
import AddTransactionPage from '../pages/AddTransactionPage';
import CoachPage from '../pages/CoachPage';
import ProfilePage from '../pages/ProfilePage';

type Tab = 'home' | 'track' | 'add' | 'coach' | 'profile';

export default function AppHome() {
  const { xp, streak } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddSheet, setShowAddSheet] = useState(false);

  const handleTabChange = (tab: Tab) => {
    if (tab === 'add') {
      setShowAddSheet(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-screen relative pb-24"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Header xp={xp} streak={streak} />

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'track' && <TrackPage />}
        {activeTab === 'coach' && <CoachPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {showAddSheet && (
        <AddTransactionPage onClose={() => setShowAddSheet(false)} />
      )}
    </div>
  );
}
