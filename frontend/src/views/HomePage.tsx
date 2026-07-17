'use client';

import React from 'react';
import {
  Sparkles, Flame, ChevronRight, TrendingUp, TrendingDown,
  Wallet, Shield, Zap, Calendar, Target as TargetIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';
import TransactionItem from '../components/TransactionItem';

export default function HomePage() {
  const {
    wallets, transactions, goals, formatCurrency, monthlyBudget,
    xp, streak, t, user, token
  } = useApp();

  const [brief, setBrief] = React.useState<{
    greeting: string;
    statusSummary: string;
    dailySafeSpending: number;
    dailyQuest: string;
    coachTip: string;
  } | null>(null);

  React.useEffect(() => {
    if (!user || !token) return;
    fetch(`${API_URL}/api/ai-coach/briefing/morning?userId=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.dailySafeSpending) {
          setBrief(data);
        }
      })
      .catch((err) => console.error('Offline / failed to fetch AI morning brief:', err));
  }, [user, token]);

  const rates: Record<string, number> = {
    USD: 1.0, GEL: 2.70, INR: 83.50, EUR: 0.92, GBP: 0.78,
    CAD: 1.36, AUD: 1.50, AED: 3.67, JPY: 155.00,
  };

  const totalBalanceUSD = wallets.reduce((sum, w) => {
    const rate = rates[w.currency] || 1.0;
    return sum + w.balance / rate;
  }, 0);

  const now = new Date();
  const todayStr = now.toDateString();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;

  const monthlyExpenses = transactions.filter(
    (tx) => tx.type === 'EXPENSE' && new Date(tx.date).getMonth() === now.getMonth()
  );
  const totalSpent = monthlyExpenses.reduce((s, tx) => s + tx.convertedAmount, 0);
  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME' && new Date(tx.date).getMonth() === now.getMonth())
    .reduce((s, tx) => s + tx.convertedAmount, 0);

  const remainingBudget = Math.max(0, Math.max(monthlyBudget, totalIncome) - totalSpent);
  const dailySafeSpend = remainingBudget / daysRemaining;
  const budgetPercent = Math.min(100, Math.round((totalSpent / Math.max(monthlyBudget, totalIncome || 1)) * 100));

  const todaySpent = transactions
    .filter((tx) => tx.type === 'EXPENSE' && new Date(tx.date).toDateString() === todayStr)
    .reduce((s, tx) => s + tx.convertedAmount, 0);



  const activeDailySafeSpend = brief ? brief.dailySafeSpending : dailySafeSpend;

  // Financial health (0-100)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 50;
  const budgetHealth = budgetPercent < 80 ? 100 : budgetPercent < 100 ? 60 : 20;
  const streakHealth = Math.min(100, streak * 15);
  const healthScore = Math.round((savingsRate * 0.4 + budgetHealth * 0.35 + streakHealth * 0.25));

  const recentTx = transactions.slice(0, 5);
  const activeGoal = goals[0];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      {/* Hero: Balance + Safe Spend */}
      <div className="card-gradient p-5 rounded-2xl animate-fade-in-up">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
          {t('balance')}
        </p>
        <h1 className="font-heading font-bold text-3xl text-white">
          {formatCurrency(totalBalanceUSD)}
        </h1>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/15">
          <div>
            <p className="text-white/50 text-[11px] font-medium">{t('safeSpend')}</p>
            <p className="text-white font-heading font-bold text-lg">{formatCurrency(activeDailySafeSpend)}</p>
          </div>
          <div>
            <p className="text-white/50 text-[11px] font-medium">{t('remainingBudget')}</p>
            <p className="text-white font-heading font-bold text-lg">{formatCurrency(remainingBudget)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Financial Health */}
            <div className="card p-4 text-center">
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: healthScore > 60 ? '#00B89420' : '#FF6B6B20' }}>
                <Shield className="w-5 h-5" style={{ color: healthScore > 60 ? '#00B894' : '#FF6B6B' }} />
              </div>
              <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{healthScore}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Health</p>
            </div>

            {/* XP Level */}
            <div className="card p-4 text-center">
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: '#A29BFE20' }}>
                <Zap className="w-5 h-5" style={{ color: '#A29BFE' }} />
              </div>
              <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{xp}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>XP</p>
            </div>

            {/* Streak */}
            <div className="card p-4 text-center">
              <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: '#FF6B6B20' }}>
                <Flame className="w-5 h-5" style={{ color: '#FF6B6B' }} />
              </div>
              <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{streak}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Streak</p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Monthly Budget
              </h3>
              <span className="text-xs font-bold font-heading" style={{ color: budgetPercent > 80 ? '#FF6B6B' : '#00B894' }}>
                {budgetPercent}%
              </span>
            </div>
            <div className={`progress-bar ${budgetPercent > 80 ? 'progress-bar-warning' : 'progress-bar-success'}`}>
              <div className="progress-bar-fill" style={{ width: `${budgetPercent}%` }} />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Spent: {formatCurrency(totalSpent)}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Left: {formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>

          {/* Active Goal */}
          {activeGoal && (
            <div className="card p-5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-4 h-4" style={{ color: '#6C5CE7' }} />
                  <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {activeGoal.name}
                  </h3>
                </div>
                <span className="text-xs font-bold font-heading" style={{ color: '#6C5CE7' }}>
                  {Math.round((activeGoal.currentSaved / activeGoal.targetAmount) * 100)}%
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(activeGoal.currentSaved / activeGoal.targetAmount) * 100}%` }}
                />
              </div>
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                {formatCurrency(activeGoal.currentSaved)} / {formatCurrency(activeGoal.targetAmount)}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* AI Tip */}
          <div
            className="p-5 rounded-2xl h-full flex flex-col justify-center"
            style={{ background: 'var(--gradient-accent)', boxShadow: '0 4px 16px rgba(0, 210, 255, 0.2)' }}
          >
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">{t('aiTip')}</h3>
                <p className="text-sm text-white/90 mt-2 leading-relaxed">
                  {brief ? brief.coachTip : (todaySpent < dailySafeSpend
                    ? `Great start! You've only spent ${formatCurrency(todaySpent)} today. You have ${formatCurrency(dailySafeSpend - todaySpent)} left for safe spending.`
                    : `Heads up! You've exceeded today's safe spending by ${formatCurrency(todaySpent - dailySafeSpend)}. Consider skipping non-essentials.`)
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Today's Challenge */}
          <div className="card p-5">
            <h3 className="font-heading font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('quests')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <div>
                  <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {brief ? brief.dailyQuest : 'Stay Under Daily Safe Spend'}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {formatCurrency(todaySpent)} / {formatCurrency(activeDailySafeSpend)}
                  </p>
                </div>
                <span className="pill pill-active text-[11px] py-1 px-3">+30 XP</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <div>
                  <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Log 3 Transactions Today
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {transactions.filter(tx => new Date(tx.date).toDateString() === todayStr).length} / 3
                  </p>
                </div>
                <span className="pill text-[11px] py-1 px-3">+50 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            {t('recentTransactions')}
          </h3>
          <button className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1 hover:text-indigo-400 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentTx.length > 0 ? (
            recentTx.map((tx, i) => (
              <TransactionItem key={tx.id} tx={tx} formatCurrency={formatCurrency} index={i} />
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-white/5 rounded-xl">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No transactions yet. Tap + to start tracking!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
