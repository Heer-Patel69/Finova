'use client';

import React from 'react';
import { Inbox, Target, MessageCircle, Trophy } from 'lucide-react';

interface EmptyStateProps {
  type: 'transactions' | 'goals' | 'messages' | 'leaderboard';
  title?: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

const configs = {
  transactions: { icon: Inbox, title: 'No transactions yet', subtitle: 'Tap + to log your first expense or income' },
  goals: { icon: Target, title: 'No goals set', subtitle: 'Create a savings goal to start building your future' },
  messages: { icon: MessageCircle, title: 'Start a conversation', subtitle: 'Ask your AI Coach anything about your finances' },
  leaderboard: { icon: Trophy, title: 'Leaderboard loading', subtitle: 'Rankings will appear once more students join' },
};

export default function EmptyState({ type, title, subtitle, action }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <Icon className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3
        className="font-heading font-bold text-lg mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title || config.title}
      </h3>
      <p className="text-sm max-w-[260px]" style={{ color: 'var(--text-tertiary)' }}>
        {subtitle || config.subtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary px-6 py-2.5 mt-5 text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
