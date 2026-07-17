'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun, Moon, Monitor, ChevronRight, Globe, Wallet, Bell, Shield,
  Palette, Lock, Download, Trash2, HelpCircle, MessageCircle,
  Star, LogOut, User, GraduationCap, Languages, Banknote, Trophy, Flame
} from 'lucide-react';
import { useApp, Language, Currency } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';
import StreaksPage from './StreaksPage';
import TrophiesPage from './TrophiesPage';

type ProfileSection = 'main' | 'appearance' | 'language' | 'currency' | 'leaderboard' | 'streaks' | 'trophies';

export default function ProfilePage() {
  const { language, setLanguage, currency, setCurrency, monthlyBudget, setMonthlyBudget, xp, streak, logout, user } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [section, setSection] = useState<ProfileSection>('main');

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  if (section === 'appearance') {
    return (
      <section className="space-y-5 pb-4 animate-fade-in">
        <button onClick={() => setSection('main')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1">
          ← Back
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Appearance</h1>

        <div className="card p-4 space-y-4">
          <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Theme</h3>
          <div className="space-y-2">
            {([
              { id: 'light' as const, label: 'Light', icon: Sun, desc: 'Clean and bright' },
              { id: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
              { id: 'system' as const, label: 'System', icon: Monitor, desc: 'Match device settings' },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: theme === opt.id ? '#6C5CE715' : 'var(--bg-tertiary)',
                  border: theme === opt.id ? '1.5px solid #6C5CE7' : '1.5px solid transparent',
                }}
              >
                <opt.icon className="w-5 h-5" style={{ color: theme === opt.id ? '#6C5CE7' : 'var(--text-tertiary)' }} />
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section === 'language') {
    const langs: { id: Language; label: string; native: string }[] = [
      { id: 'en', label: 'English', native: 'English' },
      { id: 'ka', label: 'Georgian', native: 'ქართული' },
      { id: 'es', label: 'Spanish', native: 'Español' },
      { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
    ];
    return (
      <section className="space-y-5 pb-4 animate-fade-in">
        <button onClick={() => setSection('main')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1">
          ← Back
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Language</h1>
        <div className="card p-4 space-y-2">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
              style={{
                background: language === l.id ? '#6C5CE715' : 'var(--bg-tertiary)',
                border: language === l.id ? '1.5px solid #6C5CE7' : '1.5px solid transparent',
              }}
            >
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{l.label}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{l.native}</p>
              </div>
              {language === l.id && <div className="w-2 h-2 rounded-full" style={{ background: '#6C5CE7' }} />}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (section === 'currency') {
    const currencies: { id: Currency; label: string; symbol: string }[] = [
      { id: 'USD', label: 'US Dollar', symbol: '$' },
      { id: 'GEL', label: 'Georgian Lari', symbol: '₾' },
      { id: 'INR', label: 'Indian Rupee', symbol: '₹' },
      { id: 'EUR', label: 'Euro', symbol: '€' },
      { id: 'GBP', label: 'British Pound', symbol: '£' },
    ];
    return (
      <section className="space-y-5 pb-4 animate-fade-in">
        <button onClick={() => setSection('main')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1">
          ← Back
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Currency</h1>
        <div className="card p-4 space-y-2">
          {currencies.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
              style={{
                background: currency === c.id ? '#6C5CE715' : 'var(--bg-tertiary)',
                border: currency === c.id ? '1.5px solid #6C5CE7' : '1.5px solid transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{c.symbol}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.id}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.label}</p>
                </div>
              </div>
              {currency === c.id && <div className="w-2 h-2 rounded-full" style={{ background: '#6C5CE7' }} />}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (section === 'leaderboard') {
    return <LeaderboardView setSection={setSection} />;
  }

  if (section === 'streaks') {
    return <StreaksPage onBack={() => setSection('main')} />;
  }

  if (section === 'trophies') {
    return <TrophiesPage onBack={() => setSection('main')} />;
  }

  // Main Profile
  const menuItems = [
    { icon: Trophy, label: 'Trophies & Achievements', desc: 'Badges and unlocks', section: 'trophies' as ProfileSection },
    { icon: Trophy, label: 'Leaderboard', desc: `Rank #1`, section: 'leaderboard' as ProfileSection },
    { icon: Palette, label: 'Appearance', desc: resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode', section: 'appearance' as ProfileSection },
    { icon: Languages, label: 'Language', desc: language.toUpperCase(), section: 'language' as ProfileSection },
    { icon: Banknote, label: 'Currency', desc: currency, section: 'currency' as ProfileSection },
  ];

  return (
    <section className="space-y-5 pb-4">
      {/* Profile Card */}
      <div className="card-gradient p-5 rounded-2xl text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-heading font-bold"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
          {user?.name?.[0] || 'U'}
        </div>
        <h2 className="font-heading font-bold text-lg text-white">{user?.name || 'User'}</h2>
        <p className="text-white/60 text-xs">
          {user?.college || 'No University'} · {user?.country || 'No Country'}
        </p>
        <div className="mt-3 flex justify-center gap-4">
          <div>
            <p className="text-white font-heading font-bold">{xp}</p>
            <p className="text-white/50 text-[10px]">XP</p>
          </div>
          <div>
            <p className="text-white font-heading font-bold">Lv.{level}</p>
            <p className="text-white/50 text-[10px]">Level</p>
          </div>
          <button 
            onClick={() => setSection('streaks')}
            className="hover:scale-105 transition-transform"
          >
            <p className="text-white font-heading font-bold flex items-center gap-1 justify-center">
                {streak} <Flame size={12} className="text-orange-500" />
            </p>
            <p className="text-white/50 text-[10px]">Streak</p>
          </button>
        </div>
        <div className="mt-3">
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full rounded-full" style={{ width: `${xpInLevel}%`, background: 'rgba(255,255,255,0.6)' }} />
          </div>
          <p className="text-[10px] text-white/40 mt-1">{xpInLevel}/100 XP to Level {level + 1}</p>
        </div>
      </div>

      {/* Budget */}
      <div className="card p-4 animate-fade-in-up stagger-1">
        <h3 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Monthly Budget
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
            className="input flex-1 text-sm font-heading font-bold"
          />
          <span className="flex items-center px-3 rounded-xl text-xs font-bold font-heading"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {currency}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="card overflow-hidden animate-fade-in-up stagger-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setSection(item.section)}
            className="w-full flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
            style={{
              borderBottom: i < menuItems.length - 1 ? '1px solid var(--border-secondary)' : 'none',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
            </div>
            <span className="text-xs mr-1" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        ))}
      </div>

      {/* More Settings */}
      <div className="card overflow-hidden animate-fade-in-up stagger-3">
        {[
          { icon: Bell, label: 'Notifications' },
          { icon: Shield, label: 'Security' },
          { icon: Download, label: 'Export Data' },
          { icon: HelpCircle, label: 'Help & Support' },
          { icon: MessageCircle, label: 'Feedback' },
          { icon: Star, label: 'Rate Finova' },
        ].map((item, i) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 p-4 transition-all active:scale-[0.98]"
            style={{
              borderBottom: i < 5 ? '1px solid var(--border-secondary)' : 'none',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <span className="text-sm font-semibold flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-2"
        style={{ background: '#FF6B6B15', color: '#FF6B6B' }}
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>

      <p className="text-center text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        Finova v2.0 · Made for students 🎓
      </p>
    </section>
  );
}

function LeaderboardView({ setSection }: { setSection: (s: ProfileSection) => void }) {
  const { user, token } = useApp();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_URL}/api/leaderboard?userId=${user?.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [user, token]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section className="space-y-5 pb-4 animate-fade-in">
      <button onClick={() => setSection('main')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1">
        ← Back
      </button>
      <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['Global', 'College', 'Friends', 'This Week'].map((tab, i) => (
          <button key={tab} className={`pill text-xs ${i === 0 ? 'pill-active' : ''}`}>{tab}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm mt-10" style={{ color: 'var(--text-tertiary)' }}>Loading ranking...</p>
      ) : leaderboard.length > 0 ? (
        <>
          {/* Podium */}
          <div className="flex justify-center items-end gap-3 pt-4 pb-2">
            {[1, 0, 2].map((idx) => {
              const u = leaderboard[idx];
              if (!u) return null;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{medals[idx]}</span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-sm"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}
                  >
                    {u.name[0]}
                  </div>
                  <p className="text-xs font-semibold mt-1 text-center" style={{ color: 'var(--text-primary)' }}>
                    {u.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] font-bold" style={{ color: '#6C5CE7' }}>{u.xp} XP</p>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="space-y-2">
            {leaderboard.map((u) => (
              <div key={u.rank} className="card p-3 flex items-center gap-3">
                <span className="font-heading font-bold text-sm w-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {u.rank <= 3 ? medals[u.rank - 1] : `#${u.rank}`}
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>{u.college}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-bold text-sm" style={{ color: '#6C5CE7' }}>{u.xp}</p>
                  <p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>🔥 {u.streak}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-sm mt-10" style={{ color: 'var(--text-tertiary)' }}>No users found.</p>
      )}
    </section>
  );
}
