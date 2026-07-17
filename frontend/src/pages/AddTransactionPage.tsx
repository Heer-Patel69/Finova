'use client';

import React, { useState } from 'react';
import { X, Repeat, Tag, MapPin, Mic, Camera } from 'lucide-react';
import { useApp, Currency } from '../context/AppContext';
import CategoryIcon from '../components/CategoryIcon';

const expenseCategories = ['Food', 'Groceries', 'Coffee', 'Shopping', 'Transport', 'Rent', 'Entertainment', 'Education', 'Medical', 'Utilities', 'Travel', 'Bills', 'Other'];
const incomeCategories = ['Salary', 'Scholarship', 'Pocket Money', 'Freelancing', 'Gifts', 'Refunds', 'Other'];
const quickAmounts = [5, 10, 20, 50, 100];

interface AddTransactionPageProps {
  onClose: () => void;
}

export default function AddTransactionPage({ onClose }: AddTransactionPageProps) {
  const { addTransaction, wallets, formatCurrency } = useApp();

  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('GEL');
  const [category, setCategory] = useState('Food');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [tags, setTags] = useState('');

  const categories = txType === 'EXPENSE' ? expenseCategories : incomeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    addTransaction({
      amount: parseFloat(amount),
      currency,
      type: txType,
      category,
      walletId,
      merchant: merchant || undefined,
      notes: notes || undefined,
      date: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'var(--overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl animate-slide-up overflow-y-auto"
        style={{
          background: 'var(--bg-secondary)',
          maxHeight: '92vh',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-primary)' }} />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3">
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            New Transaction
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-5">
          {/* Type Selector */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              type="button"
              onClick={() => { setTxType('EXPENSE'); setCategory('Food'); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-heading font-bold transition-all duration-200"
              style={{
                background: txType === 'EXPENSE' ? 'var(--bg-secondary)' : 'transparent',
                color: txType === 'EXPENSE' ? '#FF6B6B' : 'var(--text-tertiary)',
                boxShadow: txType === 'EXPENSE' ? 'var(--shadow-card)' : 'none',
              }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setTxType('INCOME'); setCategory('Salary'); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-heading font-bold transition-all duration-200"
              style={{
                background: txType === 'INCOME' ? 'var(--bg-secondary)' : 'transparent',
                color: txType === 'INCOME' ? '#00B894' : 'var(--text-tertiary)',
                boxShadow: txType === 'INCOME' ? 'var(--shadow-card)' : 'none',
              }}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input flex-1 text-2xl font-heading font-bold text-center"
                style={{ letterSpacing: '-0.5px' }}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="input font-heading font-bold text-center"
                style={{ width: 80 }}
              >
                <option value="GEL">GEL</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className="pill text-xs flex-shrink-0"
              >
                {qa}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    category === cat ? '' : ''
                  }`}
                  style={{
                    background: category === cat ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                    color: category === cat ? 'white' : 'var(--text-secondary)',
                    boxShadow: category === cat ? 'var(--shadow-button)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Wallet
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWalletId(w.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                  style={{
                    background: walletId === w.id ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                    color: walletId === w.id ? 'white' : 'var(--text-secondary)',
                    boxShadow: walletId === w.id ? 'var(--shadow-button)' : 'none',
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Merchant
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Spar Metro, Dunkin Donuts"
              className="input text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lunch with friends"
              className="input text-sm"
            />
          </div>

          {/* Extras Row */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button type="button" className="p-2.5 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <Camera className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </button>
              <button type="button" className="p-2.5 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <Mic className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </button>
              <button type="button" className="p-2.5 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: isRecurring ? '#6C5CE720' : 'var(--bg-tertiary)',
                color: isRecurring ? '#6C5CE7' : 'var(--text-tertiary)',
              }}
            >
              <Repeat className="w-3.5 h-3.5" />
              Recurring
            </button>
          </div>

          {/* Save */}
          <button type="submit" className="btn-primary w-full py-3.5 text-sm animate-pulse-glow">
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
