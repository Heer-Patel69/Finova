'use client';

import React from 'react';
import CategoryIcon from './CategoryIcon';
import type { Transaction } from '../context/AppContext';

interface TransactionItemProps {
  tx: Transaction;
  formatCurrency: (amount: number) => string;
  index?: number;
}

export default function TransactionItem({ tx, formatCurrency, index = 0 }: TransactionItemProps) {
  const delayClass = index < 6 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`card p-3 flex justify-between items-center animate-fade-in-up ${delayClass}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <CategoryIcon category={tx.category} type={tx.type} size="md" />
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {tx.category}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
            {tx.merchant || 'Manual Entry'} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p
          className="font-heading font-bold text-sm"
          style={{ color: tx.type === 'INCOME' ? '#00B894' : 'var(--text-primary)' }}
        >
          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.convertedAmount)}
        </p>
      </div>
    </div>
  );
}
