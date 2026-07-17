'use client';

import React from 'react';
import CategoryIcon from './CategoryIcon';
import type { Transaction } from '../context/AppContext';

import { Trash2, Edit2 } from 'lucide-react';

interface TransactionItemProps {
  tx: Transaction;
  formatCurrency: (amount: number) => string;
  index?: number;
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
}

export default function TransactionItem({ tx, formatCurrency, index = 0, onDelete, onEdit }: TransactionItemProps) {
  const delayClass = index < 6 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`card p-3 flex justify-between items-center animate-fade-in-up ${delayClass} group relative`}
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
      <div className="flex items-center gap-2">
        <div className="text-right flex-shrink-0 ml-3">
          <p
            className="font-heading font-bold text-sm"
            style={{ color: tx.type === 'INCOME' ? '#00B894' : 'var(--text-primary)' }}
          >
            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.convertedAmount)}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button onClick={() => onEdit(tx)} className="p-1.5 rounded-full hover:bg-gray-500/20 text-gray-400 hover:text-blue-500 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(tx.id)} className="p-1.5 rounded-full hover:bg-gray-500/20 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
