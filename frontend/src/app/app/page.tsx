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
import SideNav from '../../components/SideNav';

export type Tab = 'home' | 'track' | 'add' | 'coach' | 'profile' | 'split';

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
      className="flex h-screen w-full overflow-hidden relative"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SideNav activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden">
          <Header xp={xp} streak={streak} />
        </div>

        <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-6 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'track' && <TrackPage />}
        {activeTab === 'coach' && <CoachPage />}
        {activeTab === 'split' && <SplitPage />}
        {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {showAddSheet && (
          <AddTransactionPage onClose={() => setShowAddSheet(false)} />
        )}
      </div>
    </div>
  );
}
