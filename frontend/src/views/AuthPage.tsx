'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, Globe, GraduationCap, DollarSign, Wallet, Flame, ChevronRight, ChevronLeft, Award, HelpCircle } from 'lucide-react';
import { Currency } from '../context/AppContext';
import { API_URL } from '../config';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: { id: string; name: string; baseCurrency: string; college?: string; country?: string }) => void;
}

type AuthMode = 'tour' | 'login' | 'register' | 'onboard';

const onboardingSlides = [
  {
    title: "Welcome to Finova 🧠",
    description: "An intelligent financial operating system designed for students and young professionals. This is not just another expense tracker—it's your command center for financial freedom.",
    details: [
      "Real-time financial status & alerts",
      "Unified overview of all your holdings",
      "Tailored budget advice"
    ],
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "AI Financial Coach 💬",
    description: "Get immediate answers to questions like \"Can I afford this pizza?\" or \"How do I save for a laptop?\" with our LLaMA 3.3 AI Coach.",
    details: [
      "Morning briefings to start your day",
      "Concise, conversational answers by default",
      "Affordability checks before you buy"
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Track Cash, Cards & UPI 💳",
    description: "Set up and manage multiple payment sources. Know exactly where your funds are coming from and going to.",
    details: [
      "Cash, Bank Accounts, Cards & Digital Wallets",
      "Visual indicators for wallet categories",
      "Multi-currency support"
    ],
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Smart Budgeting & DSS 📊",
    description: "Set a budget and let Finova compute your Daily Safe Spending (DSS). The app auto-adjusts limits dynamically to keep you from running dry.",
    details: [
      "Dynamic Daily Safe Spending limits",
      "Tracks days remaining in the month",
      "Interactive graphs and category analytics"
    ],
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Gamification & Streaks 🔥",
    description: "Earn XP and build streaks by staying within your daily safe spending and logging activity daily.",
    details: [
      "Interactive GitHub-style activity calendar",
      "XP levels to track your growth",
      "Unlock rarity-based trophies (Common to Legendary)"
    ],
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Climb the Leaderboard 🏆",
    description: "Compete with other students from Caucasas University and worldwide. Grow your financial habits together.",
    details: [
      "Global and college-specific rankings",
      "Weekly and monthly challenge quests",
      "Bonus XP for high-streak milestones"
    ],
    color: "from-red-500 to-pink-600",
  },
  {
    title: "Privacy & Data Isolation 🔒",
    description: "Your financial data is your business. Finova enforces strict data isolation and secure local session clearing.",
    details: [
      "No account data leakage",
      "Encrypted communications",
      "Clear state on logout"
    ],
    color: "from-purple-500 to-pink-600",
  }
];

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('tour');
  const [tourStep, setTourStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Georgia');
  const [college, setCollege] = useState('');
  const [baseCurrency, setBaseCurrency] = useState<Currency>('GEL');

  // Onboarding states
  const [userId, setUserId] = useState('');
  const [onboardStep, setOnboardStep] = useState(1); // 1: Income Setup, 2: Wallets Setup
  const [monthlyBudget, setMonthlyBudget] = useState('500');
  
  // Income sources
  const [monthlyIncome, setMonthlyIncome] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [salary, setSalary] = useState('0');
  const [freelanceIncome, setFreelanceIncome] = useState('0');
  const [otherIncome, setOtherIncome] = useState('0');

  // Starting wallets
  const [setupWallets, setSetupWallets] = useState<{name: string, type: 'CASH' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'DIGITAL_WALLET', balance: string}[]>([
    { name: 'Cash', type: 'CASH', balance: '100' },
    { name: 'Bank Account', type: 'BANK_ACCOUNT', balance: '1000' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextTour = () => {
    if (tourStep < onboardingSlides.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      setMode('register');
    }
  };

  const handlePrevTour = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        onAuthSuccess(data.token, data.user);
      } else if (mode === 'register') {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, country, college, baseCurrency }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        
        // Save token & userId, and transition to onboarding step
        localStorage.setItem('finova_token', data.token);
        setUserId(data.user.id);
        setMode('onboard');
        setOnboardStep(1); // Set to income configuration step
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('finova_token') || '';
      const res = await fetch(`${API_URL}/api/auth/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          monthlyBudget: parseFloat(monthlyBudget) || 500,
          monthlyIncome: parseFloat(monthlyIncome) || 0,
          allowance: parseFloat(allowance) || 0,
          salary: parseFloat(salary) || 0,
          freelanceIncome: parseFloat(freelanceIncome) || 0,
          otherIncome: parseFloat(otherIncome) || 0,
          wallets: setupWallets.map(w => ({
            name: w.name,
            type: w.type,
            balance: parseFloat(w.balance) || 0,
            currency: baseCurrency
          }))
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Onboarding failed');

      // Finish auth flow completely
      onAuthSuccess(token, { id: userId, name, baseCurrency, college, country });
    } catch (err: any) {
      setError(err.message || 'Onboarding error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 min-h-screen py-8 sm:py-12 overflow-y-auto"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md space-y-6" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
        
        {/* Logo Header */}
        <div className="text-center">
          <span
            className="font-heading font-bold text-2xl tracking-tight px-4 py-2 rounded-2xl"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            Finova
          </span>
        </div>

        {error && (
          <div
            className="p-3.5 rounded-xl text-xs font-semibold text-center border"
            style={{ background: '#FF6B6B15', borderColor: '#FF6B6B', color: '#FF6B6B' }}
          >
            {error}
          </div>
        )}

        {/* 1. TOUR MODE */}
        {mode === 'tour' && (
          <div className="card p-6 space-y-6 flex flex-col animate-fade-in relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${onboardingSlides[tourStep].color} blur-3xl opacity-20 transition-all duration-500`}></div>
            
            {/* Step indicator */}
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>PRODUCT TOUR</span>
              <span>{tourStep + 1} / {onboardingSlides.length}</span>
            </div>

            {/* Slide content */}
            <div className="space-y-4 min-h-[220px]">
              <h3 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                {onboardingSlides[tourStep].title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {onboardingSlides[tourStep].description}
              </p>
              
              <ul className="space-y-2 pt-2">
                {onboardingSlides[tourStep].details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress indicators (Dots) */}
            <div className="flex justify-center gap-1.5 my-2">
              {onboardingSlides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-5 bg-indigo-500' : 'w-1.5 bg-white/10'}`}
                ></div>
              ))}
            </div>

            {/* Nav Controls */}
            <div className="flex justify-between gap-4 pt-2">
              <button
                onClick={handlePrevTour}
                disabled={tourStep === 0}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 bg-[#1C1D2C]/40 text-gray-400 hover:text-white transition-colors ${tourStep === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <button
                onClick={handleNextTour}
                className="flex-grow flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all animate-pulse-glow"
              >
                {tourStep === onboardingSlides.length - 1 ? 'Start Registration' : 'Next Step'} <ChevronRight size={16} />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setMode('login')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        )}

        {/* 2. LOGIN / REGISTER FORM */}
        {(mode === 'login' || mode === 'register') && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-center" style={{ color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="text-xs text-center mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {mode === 'login' ? 'Track smarter. Save better. Stress less.' : 'Enter your university details to join Finova.'}
            </p>

            <form onSubmit={handleAuth} className="card p-5 space-y-4 animate-fade-in">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex"
                      className="input pl-10 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="input pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 text-sm"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Georgia"
                          className="input pl-10 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>College / School</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                          type="text"
                          required
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="Caucasus University"
                          className="input pl-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Base Currency</label>
                    <select
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                      className="input text-sm font-heading font-bold"
                    >
                      <option value="GEL">GEL (₾)</option>
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm animate-pulse-glow">
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="flex flex-col gap-2.5 text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-semibold underline"
                style={{ color: 'var(--color-finova-primary)' }}
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
              <button
                onClick={() => setMode('tour')}
                className="text-[11px] text-gray-400 hover:text-gray-200"
              >
                ← Return to Tour
              </button>
            </div>
          </div>
        )}

        {/* 3. MULTI-STEP ONBOARDING SETUP */}
        {mode === 'onboard' && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-center" style={{ color: 'var(--text-primary)' }}>
              Onboarding Setup ({onboardStep}/2)
            </h2>
            <p className="text-xs text-center mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {onboardStep === 1 
                ? 'Configure your income streams & monthly budget limits.' 
                : 'Define your starting wallets so AI calculations remain accurate.'
              }
            </p>

            <form onSubmit={handleOnboard} className="card p-5 space-y-5 animate-fade-in">
              {onboardStep === 1 ? (
                /* STEP 1: INCOME & BUDGET */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Monthly Budget Limit ({baseCurrency})</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <input
                        type="number"
                        required
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        placeholder="500"
                        className="input pl-10 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mt-6 mb-2">Monthly Income Sources</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-400">Regular Salary</label>
                      <input
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="input text-sm font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-400">Allowance / Pocket</label>
                      <input
                        type="number"
                        value={allowance}
                        onChange={(e) => setAllowance(e.target.value)}
                        className="input text-sm font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-400">Freelance Income</label>
                      <input
                        type="number"
                        value={freelanceIncome}
                        onChange={(e) => setFreelanceIncome(e.target.value)}
                        className="input text-sm font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-gray-400">Other / Side Hustles</label>
                      <input
                        type="number"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(e.target.value)}
                        className="input text-sm font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Combined Monthly Income Estimate</label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="input text-sm font-bold bg-white/5 border-white/10"
                      placeholder="Combine automatically"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const sum = (parseFloat(salary) || 0) + (parseFloat(allowance) || 0) + (parseFloat(freelanceIncome) || 0) + (parseFloat(otherIncome) || 0);
                        setMonthlyIncome(String(sum));
                      }}
                      className="text-[10px] text-indigo-400 hover:underline mt-1 font-semibold block text-right"
                    >
                      Calculate sum automatically
                    </button>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setOnboardStep(2)}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-1 font-bold"
                  >
                    Continue to Wallets Setup <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                /* STEP 2: WALLETS SETUP */
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400">Payment Methods & Starting Balances</label>
                    
                    {setupWallets.map((wallet, index) => (
                      <div key={index} className="flex gap-2 items-center bg-[#1C1D2C] p-2 rounded-xl border border-white/5">
                        <select 
                          value={wallet.type}
                          onChange={(e) => {
                            const newWallets = [...setupWallets];
                            newWallets[index].type = e.target.value as any;
                            setSetupWallets(newWallets);
                          }}
                          className="bg-transparent text-xs font-semibold p-1 outline-none text-gray-300 border-r border-white/10 w-28"
                        >
                          <option value="CASH">Cash 💵</option>
                          <option value="BANK_ACCOUNT">Bank Acc 🏦</option>
                          <option value="CREDIT_CARD">Credit Card 💳</option>
                          <option value="DIGITAL_WALLET">UPI / Paytm 💰</option>
                        </select>

                        <input
                          type="text"
                          value={wallet.name}
                          onChange={(e) => {
                            const newWallets = [...setupWallets];
                            newWallets[index].name = e.target.value;
                            setSetupWallets(newWallets);
                          }}
                          placeholder="Chase / Cash"
                          className="bg-transparent text-sm text-white w-full outline-none px-1"
                        />

                        <input
                          type="number"
                          value={wallet.balance}
                          onChange={(e) => {
                            const newWallets = [...setupWallets];
                            newWallets[index].balance = e.target.value;
                            setSetupWallets(newWallets);
                          }}
                          placeholder="0.00"
                          className="bg-transparent text-sm font-bold text-white w-20 text-right outline-none pr-1"
                        />

                        {setupWallets.length > 1 && (
                          <button type="button" onClick={() => setSetupWallets(setupWallets.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 pr-1">
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                    <button 
                      type="button" 
                      onClick={() => setSetupWallets([...setupWallets, { name: 'Debit Card', type: 'BANK_ACCOUNT', balance: '0' }])}
                      className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 text-xs font-semibold hover:bg-white/5 transition-colors"
                    >
                      + Add Another Wallet Source
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setOnboardStep(1)}
                      className="px-4 py-3 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      Back
                    </button>
                    
                    <button type="submit" disabled={loading} className="btn-primary flex-grow py-3 text-sm font-bold animate-pulse-glow">
                      {loading ? 'Completing Setup...' : 'Finish Setup & Enter Finova'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
