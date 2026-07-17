'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

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
  USD: '$', GEL: '₾', INR: '₹', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', AED: 'د.إ', JPY: '¥'
};

export const currencyRates: Record<Currency, number> = {
  USD: 1.0, GEL: 2.70, INR: 83.50, EUR: 0.92, GBP: 0.78, CAD: 1.36, AUD: 1.50, AED: 3.67, JPY: 155.00
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
    shares: Record<string, number>;
  }[];
}

interface UserProfile {
  id: string;
  name: string;
  baseCurrency: string;
}

interface AppContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'convertedAmount'>) => Promise<void>;
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
  syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('GEL');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500);
  const [xp, setXp] = useState<number>(340);
  const [streak, setStreak] = useState<number>(5);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);

  // Sync data from database
  const syncData = useCallback(async () => {
    const activeToken = token || localStorage.getItem('finova_token');
    const activeUser = user || JSON.parse(localStorage.getItem('finova_user') || 'null');

    if (!activeToken || !activeUser) return;

    try {
      // 1. Fetch Wallets
      const walletsRes = await fetch(`${API_URL}/api/wallets?userId=${activeUser.id}`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (walletsRes.ok) {
        const walletsData = await walletsRes.json();
        setWallets(walletsData.map((w: any) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          balance: w.balance,
          currency: w.currency as Currency
        })));
      }

      // 2. Fetch Active Budgets & Onboarding Settings
      const budgetRes = await fetch(`${API_URL}/api/budgets/active?userId=${activeUser.id}`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setMonthlyBudget(budgetData.monthlyBudget || 500);
      }

      // 3. Fetch Transactions (retrieve from the first active wallet)
      const walletsResData = await walletsRes.clone().json();
      if (walletsResData && walletsResData.length > 0) {
        const primaryWalletId = walletsResData[0].id;
        const txRes = await fetch(`${API_URL}/api/transactions?walletId=${primaryWalletId}`, {
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.map((t: any) => ({
            id: t.id,
            amount: t.amount,
            currency: t.currency as Currency,
            convertedAmount: t.convertedAmount,
            category: t.category,
            type: t.type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
            merchant: t.merchant,
            notes: t.notes,
            walletId: t.walletId,
            date: t.date
          })));
        }
      }
    } catch (err) {
      console.error('Offline / Failed to sync database items:', err);
    }
  }, [token, user]);

  // Load from local storage for offline support
  useEffect(() => {
    const savedLang = localStorage.getItem('finova_lang');
    if (savedLang) setLanguage(savedLang as Language);
    
    const savedCur = localStorage.getItem('finova_cur');
    if (savedCur) setCurrency(savedCur as Currency);

    const savedToken = localStorage.getItem('finova_token');
    const savedUser = localStorage.getItem('finova_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync data automatically when user or token updates
  useEffect(() => {
    if (token && user) {
      syncData();
    }
  }, [token, user, syncData]);

  const login = (authToken: string, authUser: UserProfile) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('finova_token', authToken);
    localStorage.setItem('finova_user', JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWallets([]);
    setTransactions([]);
    localStorage.removeItem('finova_token');
    localStorage.removeItem('finova_user');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('finova_lang', lang);
  };

  const changeCurrency = (cur: Currency) => {
    setCurrency(cur);
    localStorage.setItem('finova_cur', cur);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'convertedAmount'>) => {
    // Optimistic offline update
    const rate = currencyRates[tx.currency];
    const convertedAmount = tx.amount / rate;
    const optimisticTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(7),
      convertedAmount
    };

    setTransactions(prev => [optimisticTx, ...prev]);

    // Send backend request
    try {
      const activeToken = token || localStorage.getItem('finova_token');
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(tx)
      });
      if (res.ok) {
        // Sync complete database states
        await syncData();
        setXp(x => x + 15);
      }
    } catch {
      console.warn('Saved transaction locally (offline).');
      // Update local wallet balance on offline fallback
      setWallets(prev => prev.map(w => {
        if (w.id === tx.walletId) {
          let balanceDiff = tx.amount;
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
    }
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

  const formatCurrency = (amountInUSD: number) => {
    const rate = currencyRates[currency];
    const localAmount = amountInUSD * rate;
    return `${currencySymbols[currency]} ${localAmount.toFixed(2)}`;
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      login,
      logout,
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
      setStreak,
      syncData
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
