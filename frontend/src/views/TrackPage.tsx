'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Download, Filter, Lightbulb, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import CategoryIcon, { getCategoryColor } from '../components/CategoryIcon';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';

type DateFilter = 'today' | '7d' | '30d' | 'month' | 'lastMonth' | 'year';

const filterLabels: Record<DateFilter, string> = {
  today: 'Today',
  '7d': '7 Days',
  '30d': '30 Days',
  month: 'This Month',
  lastMonth: 'Last Month',
  year: 'This Year',
};

export default function TrackPage() {
  const { transactions, formatCurrency, monthlyBudget, user, token } = useApp();
  const { resolvedTheme } = useTheme();
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [showAllTx, setShowAllTx] = useState(false);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!user) return;
    window.open(`http://localhost:5000/api/reports/export?userId=${user.id}&format=${format}`);
  };

  const now = new Date();

  const filteredByDate = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      switch (dateFilter) {
        case 'today': return d.toDateString() === now.toDateString();
        case '7d': return d >= new Date(now.getTime() - 7 * 86400000);
        case '30d': return d >= new Date(now.getTime() - 30 * 86400000);
        case 'month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'lastMonth': {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          return d >= lm && d <= lmEnd;
        }
        case 'year': return d.getFullYear() === now.getFullYear();
        default: return true;
      }
    });
  }, [transactions, dateFilter]);

  const filtered = useMemo(() => {
    return filteredByDate.filter((tx) => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          tx.category.toLowerCase().includes(s) ||
          (tx.merchant || '').toLowerCase().includes(s) ||
          tx.amount.toString().includes(s)
        );
      }
      return true;
    });
  }, [filteredByDate, typeFilter, search]);

  const totalSpending = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.convertedAmount, 0);
  const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.convertedAmount, 0);
  const netBalance = totalIncome - totalSpending;
  const txCount = filtered.length;

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === 'EXPENSE').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.convertedAmount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)), color: getCategoryColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Daily spending for bar chart
  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === 'EXPENSE').forEach((t) => {
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
      map.set(day, (map.get(day) || 0) + t.convertedAmount);
    });
    return Array.from(map.entries()).map(([day, amt]) => ({
      day,
      amount: parseFloat(amt.toFixed(2)),
    }));
  }, [filtered]);

  // Insights
  const insights = useMemo(() => {
    const result: string[] = [];
    if (categoryData.length > 0) {
      const top = categoryData[0];
      const pct = totalSpending > 0 ? Math.round((top.value / totalSpending) * 100) : 0;
      result.push(`${top.name} accounts for ${pct}% of your spending (${formatCurrency(top.value)})`);
    }
    const budgetPct = monthlyBudget > 0 ? Math.round((totalSpending / monthlyBudget) * 100) : 0;
    if (budgetPct > 80) {
      result.push(`⚠️ You've used ${budgetPct}% of your monthly budget`);
    } else if (budgetPct < 50) {
      result.push(`✅ Great! You've only used ${budgetPct}% of your budget so far`);
    }
    if (netBalance > 0) {
      result.push(`You saved ${formatCurrency(netBalance)} this period`);
    }
    return result;
  }, [categoryData, totalSpending, monthlyBudget, netBalance, formatCurrency]);

  const chartTextColor = resolvedTheme === 'dark' ? '#9CA3C4' : '#6B7194';
  const visibleTx = showAllTx ? filtered : filtered.slice(0, 10);

  return (
    <section className="space-y-5 pb-4">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          Analytics
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 font-heading"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 font-heading"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Date Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(Object.keys(filterLabels) as DateFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`pill ${dateFilter === f ? 'pill-active' : ''}`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3.5 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4" style={{ color: '#FF6B6B' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Spending</span>
          </div>
          <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(totalSpending)}
          </p>
        </div>
        <div className="card p-3.5 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft className="w-4 h-4" style={{ color: '#00B894' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Income</span>
          </div>
          <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="card p-3.5 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2 mb-1">
            {netBalance >= 0
              ? <TrendingUp className="w-4 h-4" style={{ color: '#00B894' }} />
              : <TrendingDown className="w-4 h-4" style={{ color: '#FF6B6B' }} />
            }
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Net</span>
          </div>
          <p className="font-heading font-bold text-lg" style={{ color: netBalance >= 0 ? '#00B894' : '#FF6B6B' }}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </p>
        </div>
        <div className="card p-3.5 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4" style={{ color: '#A29BFE' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Transactions</span>
          </div>
          <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {txCount}
          </p>
        </div>
      </div>

      {/* Spending Chart */}
      {dailyData.length > 0 && (
        <div className="card p-4 animate-fade-in-up stagger-5">
          <h3 className="font-heading font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Daily Spending
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData} barSize={20}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: resolvedTheme === 'dark' ? '#222545' : '#FFF',
                  border: 'none',
                  borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  fontSize: 12,
                  color: resolvedTheme === 'dark' ? '#E8EAF6' : '#1A1D2E',
                }}
              />
              <Bar dataKey="amount" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="card p-4 animate-fade-in-up stagger-6">
          <h3 className="font-heading font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Category Breakdown
          </h3>
          <div className="flex gap-4 items-center">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.slice(0, 4).map((cat) => {
                const pct = totalSpending > 0 ? Math.round((cat.value / totalSpending) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: '#FDCB6E' }} />
            <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Insights
            </h3>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {ins}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Search + Type Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants, categories..."
            className="input pl-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`pill text-xs ${typeFilter === t ? 'pill-active' : ''}`}
            >
              {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Transactions ({filtered.length})
        </h3>
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {visibleTx.map((tx, i) => (
              <TransactionItem key={tx.id} tx={tx} formatCurrency={formatCurrency} index={i} />
            ))}
            {!showAllTx && filtered.length > 10 && (
              <button
                onClick={() => setShowAllTx(true)}
                className="w-full py-3 text-xs font-heading font-semibold flex items-center justify-center gap-1 rounded-xl"
                style={{ color: 'var(--color-finova-primary)', background: 'var(--bg-tertiary)' }}
              >
                Show All ({filtered.length}) <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <EmptyState type="transactions" />
        )}
      </div>
    </section>
  );
}
