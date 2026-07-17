'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Shield, TrendingUp, Wallet, Zap, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';

const quickQuestions = [
  'Can I afford pizza tonight?',
  'How can I save more?',
  'Why am I overspending?',
  'Will I make it to end of month?',
];

export default function CoachPage() {
  const { transactions, monthlyBudget, formatCurrency, streak, user, token } = useApp();

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: "Hey! I'm your Finova AI Coach 🧠 Ask me anything about your finances — from \"Can I buy this?\" to \"How do I save for a laptop?\"" },
  ]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load chat history for the currently logged-in user
  useEffect(() => {
    if (!user || !token) return;
    
    setLoadingHistory(true);
    fetch(`${API_URL}/api/ai-coach/history?userId=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load chat history');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const msgs: { sender: 'user' | 'ai'; text: string }[] = [];
          data.forEach((item) => {
            msgs.push({ sender: 'user', text: item.prompt });
            msgs.push({ sender: 'ai', text: item.response });
          });
          setChatMessages([
            { sender: 'ai', text: "Hey! I'm your Finova AI Coach 🧠 Ask me anything about your finances — from \"Can I buy this?\" to \"How do I save for a laptop?\"" },
            ...msgs
          ]);
        } else {
          // Reset to default greeting if no messages
          setChatMessages([
            { sender: 'ai', text: "Hey! I'm your Finova AI Coach 🧠 Ask me anything about your finances — from \"Can I buy this?\" to \"How do I save for a laptop?\"" },
          ]);
        }
      })
      .catch((err) => {
        console.error('Error loading history:', err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [user, token]);

  const handleClearChat = async () => {
    if (!user || !token) return;
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;

    try {
      const res = await fetch(`${API_URL}/api/ai-coach/history?userId=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChatMessages([
          { sender: 'ai', text: "Hey! I'm your Finova AI Coach 🧠 Ask me anything about your finances — from \"Can I buy this?\" to \"How do I save for a laptop?\"" },
        ]);
      }
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const totalSpent = transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.convertedAmount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.convertedAmount, 0);

  const remainingBudget = Math.max(0, Math.max(monthlyBudget, totalIncome) - totalSpent);
  const dailySafeSpend = remainingBudget / daysRemaining;

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.id, message: userMsg }),
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      const aiText = data.answer || data.message || 'I had trouble processing that. Try asking in a different way!';
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch {
      // Offline / API error fallback — generate a useful local response
      let reply = '';
      if (userMsg.toLowerCase().includes('buy') || userMsg.toLowerCase().includes('afford')) {
        const costStr = userMsg.match(/\d+/);
        const cost = costStr ? parseInt(costStr[0]) : 30;
        reply = cost > dailySafeSpend * 1.5
          ? `That ${formatCurrency(cost)} purchase exceeds your safe limit of ${formatCurrency(dailySafeSpend)}. I'd suggest waiting or splitting the cost.`
          : `Yes! That fits within your daily allowance of ${formatCurrency(dailySafeSpend)}. Go for it and log it right after!`;
      } else if (userMsg.toLowerCase().includes('save')) {
        reply = `Great question! Try capping coffee at ${formatCurrency(15)}/week. That alone saves ${formatCurrency(30)}/month. Small changes compound fast.`;
      } else if (userMsg.toLowerCase().includes('budget')) {
        reply = `Your monthly budget is ${formatCurrency(monthlyBudget)}. You've spent ${formatCurrency(totalSpent)} so far with ${formatCurrency(remainingBudget)} remaining across ${daysRemaining} days.`;
      } else {
        reply = `Based on your data: you've spent ${formatCurrency(totalSpent)} this month with ${formatCurrency(remainingBudget)} remaining. Your daily safe spend is ${formatCurrency(dailySafeSpend)}. You're on a ${streak}-day streak — keep it up!`;
      }
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(chatInput);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] w-full animate-fade-in-up">
      {/* Left Column: Dashboard Cards */}
      <div className="flex-shrink-0 lg:w-1/3 space-y-6 mb-4 lg:mb-0">
        <div className="flex justify-between items-center">
          <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            AI Coach
          </h1>
          {chatMessages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 p-1 px-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} />
              Clear Chat
            </button>
          )}
        </div>

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
        <div className="flex flex-col gap-2">
          <h3 className="font-heading font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Quick Questions</h3>
          <div className="flex flex-wrap lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="pill text-xs flex-shrink-0 justify-start w-fit lg:w-full py-2.5 px-4"
              >
                <Zap className="w-3.5 h-3.5 mr-2" /> {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="flex-1 flex flex-col card p-4 lg:p-6 shadow-sm border border-white/5">
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
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0 mt-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask about your finances..."
          className="input flex-1 text-sm bg-black/5 dark:bg-white/5 border-transparent focus:border-indigo-500/50"
        />
        <button type="submit" className="btn-primary p-3 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold">
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
      </div>
    </div>
  );
}
