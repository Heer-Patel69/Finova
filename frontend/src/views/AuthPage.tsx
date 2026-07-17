'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, Globe, GraduationCap, DollarSign, Wallet } from 'lucide-react';
import { Currency } from '../context/AppContext';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: { id: string; name: string; baseCurrency: string }) => void;
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
  const [initialBalance, setInitialBalance] = useState('100');
  const [walletName, setWalletName] = useState('Cash');
  const [walletType, setWalletType] = useState('CASH');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        onAuthSuccess(data.token, data.user);
      } else if (mode === 'register') {
        const res = await fetch('http://localhost:5000/api/auth/register', {
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
      const res = await fetch('http://localhost:5000/api/auth/onboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          monthlyBudget: parseFloat(monthlyBudget) || 500,
          initialBalance: parseFloat(initialBalance) || 0,
          initialWalletName: walletName || 'Cash',
          initialWalletType: walletType || 'CASH',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Onboarding failed');

      // Finish auth flow completely
      onAuthSuccess(token, { id: userId, name, baseCurrency });
    } catch (err: any) {
      setError(err.message || 'Onboarding error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center px-6 min-h-screen py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md space-y-6">
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
                    placeholder="Heer Patel"
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
                    className="input text-sm bg-white font-heading font-bold"
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

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Starting Balance</label>
              <input
                type="number"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="100.00"
                className="input text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Wallet Name</label>
                <input
                  type="text"
                  required
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Cash"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Wallet Type</label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="input text-sm bg-white font-semibold"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>
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
