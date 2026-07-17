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
import { API_URL } from '../config';
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
  const { transactions, formatCurrency, monthlyBudget, user, token, deleteTransaction, updateTransaction, syncData } = useApp();
  const { resolvedTheme } = useTheme();
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [showAllTx, setShowAllTx] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleDeleteTx = async (id: string) => {
    if (window.confirm('Delete this transaction? This will also revert your wallet balance.')) {
      await deleteTransaction(id);
    }
  };

  const handleEditTx = (tx: any) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
    setEditMerchant(tx.merchant || '');
    setEditNotes(tx.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingTx) return;
    await updateTransaction(editingTx.id, {
      amount: parseFloat(editAmount),
      category: editCategory,
      merchant: editMerchant,
      notes: editNotes,
      type: editingTx.type,
    });
    setEditingTx(null);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!user) return;
    window.open(`${API_URL}/api/reports/export?userId=${user.id}&format=${format}`);
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
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      {/* Page Title & Actions */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Analytics & Charts */}
        <div className="flex flex-col gap-6">
          {/* Date Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(Object.keys(filterLabels) as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`pill ${dateFilter === f ? 'pill-active' : ''} whitespace-nowrap`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 animate-fade-in-up stagger-1">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Spending</span>
              </div>
              <p className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(totalSpending)}
              </p>
            </div>
            <div className="card p-4 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-5 h-5" style={{ color: '#00B894' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Income</span>
              </div>
              <p className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="card p-4 animate-fade-in-up stagger-3">
              <div className="flex items-center gap-2 mb-2">
                {netBalance >= 0
                  ? <TrendingUp className="w-5 h-5" style={{ color: '#00B894' }} />
                  : <TrendingDown className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                }
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Net</span>
              </div>
              <p className="font-heading font-bold text-2xl" style={{ color: netBalance >= 0 ? '#00B894' : '#FF6B6B' }}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </p>
            </div>
            <div className="card p-4 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-5 h-5" style={{ color: '#A29BFE' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Transactions</span>
              </div>
              <p className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                {txCount}
              </p>
            </div>
          </div>

          {/* Spending Chart */}
          {dailyData.length > 0 && (
            <div className="card p-5 animate-fade-in-up stagger-5">
              <h3 className="font-heading font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
                Daily Spending
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyData} barSize={24} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} dy={10} />
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
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="amount" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <div className="card p-5 animate-fade-in-up stagger-6">
              <h3 className="font-heading font-semibold text-base mb-6" style={{ color: 'var(--text-primary)' }}>
                Category Breakdown
              </h3>
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="w-32 h-32 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
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
                <div className="flex-1 space-y-3 w-full">
                  {categoryData.slice(0, 5).map((cat) => {
                    const pct = totalSpending > 0 ? Math.round((cat.value / totalSpending) * 100) : 0;
                    return (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold font-heading" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="card p-5 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-5 h-5" style={{ color: '#FDCB6E' }} />
                <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Insights
                </h3>
              </div>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {ins}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transactions List */}
        <div className="flex flex-col gap-6">
          {/* Search + Type Filters */}
          <div className="card p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search merchants, categories..."
                className="input pl-10 text-sm w-full"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`pill text-sm flex-1 justify-center py-2 ${typeFilter === t ? 'pill-active' : ''}`}
                >
                  {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="card p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                Transactions ({filtered.length})
              </h3>
            </div>
            
            {filtered.length > 0 ? (
              <div className="space-y-3 flex-1">
                {visibleTx.map((tx, i) => (
                  <TransactionItem key={tx.id} tx={tx} formatCurrency={formatCurrency} index={i} onDelete={handleDeleteTx} onEdit={handleEditTx} />
                ))}
                {!showAllTx && filtered.length > 10 && (
                  <button
                    onClick={() => setShowAllTx(true)}
                    className="w-full py-4 mt-4 text-sm font-heading font-semibold flex items-center justify-center gap-2 rounded-xl transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-finova-primary)', background: 'var(--bg-tertiary)' }}
                  >
                    Show All ({filtered.length}) <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                <EmptyState type="transactions" />
              </div>
            )}
          </div>
        </div>
      </div>

      {editingTx && (
        <EditTransactionModal
          tx={editingTx}
          editAmount={editAmount}
          setEditAmount={setEditAmount}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
          editMerchant={editMerchant}
          setEditMerchant={setEditMerchant}
          editNotes={editNotes}
          setEditNotes={setEditNotes}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}

function EditTransactionModal({ tx, editAmount, setEditAmount, editCategory, setEditCategory, editMerchant, setEditMerchant, editNotes, setEditNotes, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="card p-5 w-[90%] max-w-sm space-y-4 animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
        <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Edit Transaction</h3>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Amount</label>
          <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="input text-sm w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Category</label>
          <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input text-sm w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Merchant</label>
          <input type="text" value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} className="input text-sm w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Notes</label>
          <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="input text-sm w-full" />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2 text-sm rounded-xl">Cancel</button>
          <button onClick={onSave} className="btn-primary flex-1 py-2 text-sm rounded-xl">Save</button>
        </div>
      </div>
    </div>
  );
}
