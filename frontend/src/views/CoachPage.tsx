'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Shield, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';

const quickQuestions = [
  'Can I afford pizza tonight?',
  'How can I save more?',
  'Why am I overspending?',
  'Will I make it to end of month?',
];

export default function CoachPage() {
  const { transactions, monthlyBudget, formatCurrency, streak } = useApp();

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: "Hey! I'm your Finova AI Coach 🧠 Ask me anything about your finances — from \"Can I buy this?\" to \"How do I save for a laptop?\"" },
  ]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const totalSpent = transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.convertedAmount, 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const dailySafeSpend = remainingBudget / daysRemaining;
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.convertedAmount, 0);
  const healthScore = Math.round(
    ((totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 50) * 0.4) +
    ((totalSpent / monthlyBudget < 0.8 ? 100 : totalSpent / monthlyBudget < 1 ? 60 : 20) * 0.35) +
    (Math.min(100, streak * 15) * 0.25)
  );

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const response = await fetch(`${API_URL}/api/ai-coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-uuid-1', message: userMsg }),
      });
      const data = await response.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.answer || data.message || 'I had trouble processing that.' }]);
    } catch {
      // Offline fallback
      setTimeout(() => {
        let reply = '';
        if (userMsg.toLowerCase().includes('buy') || userMsg.toLowerCase().includes('afford')) {
          const costStr = userMsg.match(/\d+/);
          const cost = costStr ? parseInt(costStr[0]) : 30;
          reply = cost > dailySafeSpend * 1.5
            ? `That ${formatCurrency(cost)} purchase exceeds your safe limit of ${formatCurrency(dailySafeSpend)}. I'd suggest waiting or splitting the cost.`
            : `Yes! That fits within your daily allowance of ${formatCurrency(dailySafeSpend)}. Go for it and log it right after!`;
        } else if (userMsg.toLowerCase().includes('save')) {
          reply = `Great question! Try capping coffee at ${formatCurrency(15)}/week. That alone saves ${formatCurrency(30)}/month. Small changes compound fast.`;
        } else {
          reply = `Based on your data: you've spent ${formatCurrency(totalSpent)} this month with ${formatCurrency(remainingBudget)} remaining. You're on a ${streak}-day streak — keep it up!`;
        }
        setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(chatInput);
  };

  return (
    <section className="flex flex-col h-[calc(100vh-140px)]">
      {/* Dashboard Cards */}
      <div className="flex-shrink-0 space-y-4 mb-4">
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          AI Coach
        </h1>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="card p-3 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1" style={{ color: '#00B894' }} />
            <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(dailySafeSpend)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Safe Today</p>
          </div>
          <div className="card p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1" style={{ color: '#6C5CE7' }} />
            <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(remainingBudget)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Budget Left</p>
          </div>
          <div className="card p-3 text-center">
            <Shield className="w-4 h-4 mx-auto mb-1" style={{ color: healthScore > 60 ? '#00B894' : '#FF6B6B' }} />
            <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {healthScore}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Health</p>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="pill text-[11px] flex-shrink-0"
            >
              <Zap className="w-3 h-3" /> {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 px-1 mb-3"
        style={{ minHeight: 0 }}
      >
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                style={{ background: 'var(--gradient-primary)' }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask about your finances..."
          className="input flex-1 text-sm"
        />
        <button type="submit" className="btn-primary p-3 rounded-xl">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}
