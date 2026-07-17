'use client';

import React from 'react';
import {
  Coffee, ShoppingBag, Car, Utensils, Film, GraduationCap,
  Stethoscope, Zap, Plane, Home, Smartphone, Wallet, CreditCard,
  Banknote, Gift, Briefcase, ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  Receipt, PiggyBank, type LucideIcon
} from 'lucide-react';

interface CategoryConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
}

const categoryMap: Record<string, CategoryConfig> = {
  Food:          { icon: Utensils,       bg: '#FF6B6B20', color: '#FF6B6B' },
  Groceries:     { icon: ShoppingBag,    bg: '#00B89420', color: '#00B894' },
  Coffee:        { icon: Coffee,         bg: '#F39C1220', color: '#F39C12' },
  Shopping:      { icon: ShoppingBag,    bg: '#A29BFE20', color: '#A29BFE' },
  Transport:     { icon: Car,            bg: '#00D2FF20', color: '#00D2FF' },
  Rent:          { icon: Home,           bg: '#6C5CE720', color: '#6C5CE7' },
  Entertainment: { icon: Film,           bg: '#FD79A820', color: '#FD79A8' },
  Education:     { icon: GraduationCap,  bg: '#6C5CE720', color: '#6C5CE7' },
  Medical:       { icon: Stethoscope,    bg: '#FF6B6B20', color: '#FF6B6B' },
  Utilities:     { icon: Zap,            bg: '#FDCB6E20', color: '#F39C12' },
  Travel:        { icon: Plane,          bg: '#00D2FF20', color: '#00D2FF' },
  Bills:         { icon: Receipt,        bg: '#FF6B6B20', color: '#FF6B6B' },
  Phone:         { icon: Smartphone,     bg: '#A29BFE20', color: '#A29BFE' },
  Salary:        { icon: Briefcase,      bg: '#00B89420', color: '#00B894' },
  Scholarship:   { icon: GraduationCap,  bg: '#6C5CE720', color: '#6C5CE7' },
  'Pocket Money':{ icon: Wallet,         bg: '#FDCB6E20', color: '#F39C12' },
  Freelancing:   { icon: Briefcase,      bg: '#00D2FF20', color: '#00D2FF' },
  Gifts:         { icon: Gift,           bg: '#FD79A820', color: '#FD79A8' },
  Refunds:       { icon: ArrowDownLeft,  bg: '#00B89420', color: '#00B894' },
  Savings:       { icon: PiggyBank,      bg: '#00B89420', color: '#00B894' },
  Other:         { icon: Banknote,       bg: '#6B719420', color: '#6B7194' },
};

const typeIcons: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  INCOME:   { icon: ArrowDownLeft,  bg: '#00B89420', color: '#00B894' },
  EXPENSE:  { icon: ArrowUpRight,   bg: '#FF6B6B20', color: '#FF6B6B' },
  TRANSFER: { icon: ArrowLeftRight, bg: '#00D2FF20', color: '#00D2FF' },
};

interface CategoryIconProps {
  category: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  size?: 'sm' | 'md' | 'lg';
}

export default function CategoryIcon({ category, type, size = 'md' }: CategoryIconProps) {
  const config = categoryMap[category] || (type ? typeIcons[type] : typeIcons.EXPENSE);
  const Icon = config.icon;

  const sizes = {
    sm: { container: 32, icon: 14 },
    md: { container: 40, icon: 18 },
    lg: { container: 48, icon: 22 },
  };

  const s = sizes[size];

  return (
    <div
      className="flex items-center justify-center rounded-xl flex-shrink-0"
      style={{
        width: s.container,
        height: s.container,
        background: config.bg,
      }}
    >
      <Icon style={{ width: s.icon, height: s.icon, color: config.color }} />
    </div>
  );
}

export function getCategoryColor(category: string): string {
  return categoryMap[category]?.color || '#6B7194';
}
