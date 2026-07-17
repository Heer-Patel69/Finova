'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Languages supported
export type Language = 'en' | 'ka' | 'es' | 'hi';

// Translations Dictionary
export const translations = {
  en: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    add: 'Add',
    goals: 'Goals',
    profile: 'Profile',
    balance: 'Current Balance',
    safeSpend: 'Today\'s Safe Spending',
    remainingBudget: 'Remaining Budget',
    daysLeft: 'Days Left',
    streak: 'Current Streak',
    xp: 'XP',
    recentTransactions: 'Recent Transactions',
    aiTip: 'AI Tip of the Day',
    upcomingBills: 'Upcoming Bills',
    goalsProgress: 'Savings Goals Progress',
    quests: 'Daily Challenges',
    addTransaction: 'Add Transaction',
    amount: 'Amount',
    category: 'Category',
    wallet: 'Wallet',
    notes: 'Notes (optional)',
    merchant: 'Merchant (optional)',
    save: 'Save',
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    split: 'Finova Split',
    canIBuy: 'Can I Buy This?',
    chatWithCoach: 'Chat with AI Coach',
    languages: 'Languages',
    currencies: 'Currencies'
  },
  ka: {
    dashboard: 'პანელი',
    transactions: 'ტრანზაქციები',
    add: 'დამატება',
    goals: 'მიზნები',
    profile: 'პროფილი',
    balance: 'მიმდინარე ბალანსი',
    safeSpend: 'დღევანდელი უსაფრთხო ხარჯი',
    remainingBudget: 'დარჩენილი ბიუჯეტი',
    daysLeft: 'დარჩენილი დღეები',
    streak: 'აქტიური დღეები',
    xp: 'ქულები (XP)',
    recentTransactions: 'ბოლო ტრანზაქციები',
    aiTip: 'დღის AI რჩევა',
    upcomingBills: 'მომავალი გადასახადები',
    goalsProgress: 'დაზოგვის მიზნები',
    quests: 'ყოველდღიური გამოწვევები',
    addTransaction: 'ტრანზაქციის დამატება',
    amount: 'თანხა',
    category: 'კატეგორია',
    wallet: 'საფულე',
    notes: 'შენიშვნა (სურვილისამებრ)',
    merchant: 'ობიექტი (სურვილისამებრ)',
    save: 'შენახვა',
    income: 'შემოსავალი',
    expense: 'გასავალი',
    transfer: 'გადარიცხვა',
    split: 'გაყოფა (Split)',
    canIBuy: 'შემიძლია ვიყიდო?',
    chatWithCoach: 'AI კონსულტანტი',
    languages: 'ენები',
    currencies: 'ვალუტები'
  },
  es: {
    dashboard: 'Panel',
    transactions: 'Transacciones',
    add: 'Añadir',
    goals: 'Metas',
    profile: 'Perfil',
    balance: 'Saldo Actual',
    safeSpend: 'Gasto Diario Seguro',
    remainingBudget: 'Presupuesto Restante',
    daysLeft: 'Días Restantes',
    streak: 'Racha Actual',
    xp: 'XP',
    recentTransactions: 'Transacciones Recientes',
    aiTip: 'Consejo AI del Día',
    upcomingBills: 'Próximas Facturas',
    goalsProgress: 'Progreso de Metas',
    quests: 'Desafíos Diarios',
    addTransaction: 'Nueva Transacción',
    amount: 'Monto',
    category: 'Categoría',
    wallet: 'Billetera',
    notes: 'Notas (opcional)',
    merchant: 'Comercio (opcional)',
    save: 'Guardar',
    income: 'Ingreso',
    expense: 'Gasto',
    transfer: 'Transferencia',
    split: 'Dividir Gastos',
    canIBuy: '¿Puedo comprar esto?',
    chatWithCoach: 'Chat con Coach AI',
    languages: 'Idiomas',
    currencies: 'Monedas'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    transactions: 'लेन-देन',
    add: 'जोड़ें',
    goals: 'लक्ष्य',
    profile: 'प्रोफाइल',
    balance: 'कुल शेष',
    safeSpend: 'आज का सुरक्षित खर्च',
    remainingBudget: 'बचा हुआ बजट',
    daysLeft: 'शेष दिन',
    streak: 'लगातार दिन',
    xp: 'एक्सपी (XP)',
    recentTransactions: 'हाल के लेन-देन',
    aiTip: 'आज की एआई सलाह',
    upcomingBills: 'आगामी बिल',
    goalsProgress: 'बचत लक्ष्य की प्रगति',
    quests: 'दैनिक चुनौतियाँ',
    addTransaction: 'लेन-देन जोड़ें',
    amount: 'राशि',
    category: 'श्रेणी',
    wallet: 'बटुआ',
    notes: 'टिप्पणी (वैकल्पिक)',
    merchant: 'दुकानदार (वैकल्पic)',
    save: 'सहेजें',
    income: 'आय',
    expense: 'खर्च',
    transfer: 'स्थानांतरण',
    split: 'पैसा बांटें',
    canIBuy: 'क्या मैं यह खरीद सकता हूँ?',
    chatWithCoach: 'एआई कोच से बातचीत',
    languages: 'भाषाएं',
    currencies: 'मुद्राएं'
  }
};

// Supported Currencies and rates relative to USD
export type Currency = 'USD' | 'GEL' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'AED' | 'JPY';

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  GEL: '₾',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  AED: 'د.إ',
  JPY: '¥'
};

export const currencyRates: Record<Currency, number> = {
  USD: 1.0,
  GEL: 2.70,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.50,
  AED: 3.67,
  JPY: 155.00
};

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  convertedAmount: number; // in USD
  category: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  merchant?: string;
  notes?: string;
  walletId: string;
  date: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: Currency;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string;
}

export interface SplitGroup {
  id: string;
  name: string;
  members: string[];
  expenses: {
    description: string;
    amount: number;
    currency: Currency;
    paidBy: string;
    shares: Record<string, number>; // username: amount
  }[];
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'convertedAmount'>) => void;
  goals: SavingGoal[];
  setGoals: React.Dispatch<React.SetStateAction<SavingGoal[]>>;
  updateGoalAmount: (id: string, amount: number) => void;
  splitGroups: SplitGroup[];
  addSplitGroup: (name: string, members: string[]) => void;
  addSplitExpense: (groupId: string, description: string, amount: number, currency: Currency, paidBy: string, shares: Record<string, number>) => void;
  t: (key: keyof typeof translations['en']) => string;
  formatCurrency: (amountInUSD: number) => string;
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500);
  const [xp, setXp] = useState<number>(340);
  const [streak, setStreak] = useState<number>(5);

  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w1', name: 'Cash', type: 'CASH', balance: 120.00, currency: 'USD' },
    { id: 'w2', name: 'Bank of Georgia', type: 'BANK_ACCOUNT', balance: 540.00, currency: 'GEL' }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', amount: 4.50, currency: 'GEL', convertedAmount: 1.67, category: 'Coffee', type: 'EXPENSE', merchant: 'Entree Cafe', walletId: 'w2', date: new Date().toISOString() },
    { id: 't2', amount: 10.00, currency: 'USD', convertedAmount: 10.00, category: 'Food', type: 'EXPENSE', merchant: 'McDonalds', walletId: 'w1', date: new Date().toISOString() }
  ]);

  const [goals, setGoals] = useState<SavingGoal[]>([
    { id: 'g1', name: 'New Laptop', targetAmount: 1000.00, currentSaved: 350.00, targetDate: '2026-12-31' },
    { id: 'g2', name: 'Tuition Payment', targetAmount: 2500.00, currentSaved: 1200.00, targetDate: '2026-09-01' }
  ]);

  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([
    {
      id: 'sg1',
      name: 'Flat 5B Roomies',
      members: ['Jane', 'Heer', 'David'],
      expenses: [
        { description: 'Electricity', amount: 90.00, currency: 'GEL', paidBy: 'Heer', shares: { Jane: 30, Heer: 30, David: 30 } }
      ]
    }
  ]);

  // Load from local storage for offline support
  useEffect(() => {
    const savedLang = localStorage.getItem('finova_lang');
    if (savedLang) setLanguage(savedLang as Language);
    const savedCur = localStorage.getItem('finova_cur');
    if (savedCur) setCurrency(savedCur as Currency);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('finova_lang', lang);
  };

  const changeCurrency = (cur: Currency) => {
    setCurrency(cur);
    localStorage.setItem('finova_cur', cur);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'convertedAmount'>) => {
    const rate = currencyRates[tx.currency];
    const convertedAmount = tx.amount / rate; // Convert original to USD base
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(7),
      convertedAmount
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === tx.walletId) {
        let balanceDiff = tx.amount;
        // If wallet currency differs from transaction currency, convert
        if (w.currency !== tx.currency) {
          const txInUSD = tx.amount / currencyRates[tx.currency];
          balanceDiff = txInUSD * currencyRates[w.currency];
        }
        
        return {
          ...w,
          balance: tx.type === 'INCOME' ? w.balance + balanceDiff : w.balance - balanceDiff
        };
      }
      return w;
    }));

    // Grant XP for logging transaction
    setXp(x => x + 15);
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, currentSaved: Math.min(g.targetAmount, g.currentSaved + amount) };
      }
      return g;
    }));
  };

  const addSplitGroup = (name: string, members: string[]) => {
    const newGroup: SplitGroup = {
      id: Math.random().toString(36).substring(7),
      name,
      members,
      expenses: []
    };
    setSplitGroups(prev => [...prev, newGroup]);
  };

  const addSplitExpense = (groupId: string, description: string, amount: number, currency: Currency, paidBy: string, shares: Record<string, number>) => {
    setSplitGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          expenses: [...g.expenses, { description, amount, currency, paidBy, shares }]
        };
      }
      return g;
    }));
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  };

  // Convert USD amount to current selected currency for representation
  const formatCurrency = (amountInUSD: number) => {
    const rate = currencyRates[currency];
    const localAmount = amountInUSD * rate;
    return `${currencySymbols[currency]} ${localAmount.toFixed(2)}`;
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      currency,
      setCurrency: changeCurrency,
      wallets,
      setWallets,
      transactions,
      addTransaction,
      goals,
      setGoals,
      updateGoalAmount,
      splitGroups,
      addSplitGroup,
      addSplitExpense,
      t,
      formatCurrency,
      monthlyBudget,
      setMonthlyBudget,
      xp,
      setXp,
      streak,
      setStreak
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
