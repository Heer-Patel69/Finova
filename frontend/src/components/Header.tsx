'use client';

import React from 'react';
import { Flame, Trophy, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  xp: number;
  streak: number;
}

export default function Header({ xp, streak }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header
      className="px-4 py-3 flex justify-between items-center sticky top-0 z-40"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-heading font-bold text-xl tracking-tight px-2.5 py-1 rounded-xl"
          style={{ background: 'var(--gradient-primary)', color: 'white', boxShadow: 'var(--shadow-button)' }}
        >
          Finova
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-heading"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          <Flame className="w-4 h-4" style={{ color: '#FF6B6B' }} />
          <span id="streak-counter">{streak}</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-heading"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          <Trophy className="w-4 h-4" style={{ color: '#FDCB6E' }} />
          <span id="xp-counter">{xp}</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all duration-200 active:scale-90"
          style={{ background: 'var(--bg-tertiary)' }}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'light' ? (
            <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Sun className="w-4 h-4" style={{ color: '#FDCB6E' }} />
          )}
        </button>
      </div>
    </header>
  );
}
