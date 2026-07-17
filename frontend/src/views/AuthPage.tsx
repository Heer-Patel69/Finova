'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, Globe, GraduationCap, DollarSign, Wallet } from 'lucide-react';
import { Currency } from '../context/AppContext';
import { API_URL } from '../config';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: { id: string; name: string; baseCurrency: string; college?: string; country?: string }) => void;
}

type AuthMode = 'login' | 'register' | 'onboard';

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Georgia');
  const [college, setCollege] = useState('');
  const [baseCurrency, setBaseCurrency] = useState<Currency>('GEL');

  // Onboarding states
  const [userId, setUserId] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('500');
  const [setupWallets, setSetupWallets] = useState<{name: string, type: 'CASH' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'DIGITAL_WALLET', balance: string}[]>([
    { name: 'Cash', type: 'CASH', balance: '0' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          monthlyBudget: parseFloat(monthlyBudget) || 500,
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
      className="flex-1 flex flex-col items-center px-4 sm:px-6 min-h-screen py-8 sm:py-12 overflow-y-auto"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md space-y-5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
        {/* Brand Logo */}
        <div className="text-center">
          <span
            className="font-heading font-bold text-2xl tracking-tight px-3 py-1.5 rounded-2xl"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            Finova
          </span>
          <h2 className="font-heading font-bold text-xl mt-4" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Welcome back!' : mode === 'register' ? 'Create your account' : 'Customize your budget'}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {mode === 'login' ? 'Track smarter. Save better. Stress less.' : mode === 'register' ? 'Join 50+ students saving every day.' : 'Set up your starting wallet.'}
          </p>
        </div>

        {error && (
          <div
            className="p-3 rounded-xl text-xs font-semibold text-center border"
            style={{ background: '#FF6B6B15', borderColor: '#FF6B6B', color: '#FF6B6B' }}
          >
            {error}
          </div>
        )}

        {/* Auth Forms */}
        {mode !== 'onboard' ? (
          <form onSubmit={handleAuth} className="card p-5 space-y-4">
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
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>College</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Caucasus Univ"
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
        ) : (
          /* Onboarding Form */
          <form onSubmit={handleOnboard} className="card p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Monthly Budget Limit</label>
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

            <div className="space-y-3 mt-4">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Payment Methods</label>
              
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
                    <option value="CASH">Cash</option>
                    <option value="BANK_ACCOUNT">Bank Acc</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DIGITAL_WALLET">Digital Wallet</option>
                  </select>

                  <input
                    type="text"
                    value={wallet.name}
                    onChange={(e) => {
                      const newWallets = [...setupWallets];
                      newWallets[index].name = e.target.value;
                      setSetupWallets(newWallets);
                    }}
                    placeholder="Name (e.g. Chase)"
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
                onClick={() => setSetupWallets([...setupWallets, { name: 'Bank Account', type: 'BANK_ACCOUNT', balance: '0' }])}
                className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                + Add Another Account
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm animate-pulse-glow">
              {loading ? 'Completing Onboarding...' : 'Finish Setup & Enter'}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        {mode !== 'onboard' && (
          <div className="text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs font-heading font-semibold underline"
              style={{ color: 'var(--color-finova-primary)' }}
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
