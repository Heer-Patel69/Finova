'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import HomePage from '../../views/HomePage';
import TrackPage from '../../views/TrackPage';
import AddTransactionPage from '../../views/AddTransactionPage';
import CoachPage from '../../views/CoachPage';
import ProfilePage from '../../views/ProfilePage';
import AuthPage from '../../views/AuthPage';
import SplitPage from '../../views/SplitPage';

type Tab = 'home' | 'track' | 'add' | 'coach' | 'profile' | 'split';

export default function AppHome() {
  const { xp, streak, token, login } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddSheet, setShowAddSheet] = useState(false);

  const handleTabChange = (tab: Tab) => {
    if (tab === 'add') {
      setShowAddSheet(true);
    } else {
      setActiveTab(tab);
    }
  };

  if (!token) {
    return <AuthPage onAuthSuccess={login} />;
  }

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
        {activeTab === 'split' && <SplitPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {showAddSheet && (
        <AddTransactionPage onClose={() => setShowAddSheet(false)} />
      )}
    </div>
  );
}
