'use client';

import React, { useState } from 'react';
import { useApp, translations, Language, Currency } from '../context/AppContext';
import { 
  Home as HomeIcon, 
  ReceiptText, 
  Plus, 
  Target, 
  User as UserIcon, 
  Sparkles, 
  Users, 
  Flame, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Globe, 
  Send
} from 'lucide-react';

export default function AppHome() {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    wallets,
    transactions,
    addTransaction,
    goals,
    updateGoalAmount,
    splitGroups,
    addSplitGroup,
    addSplitExpense,
    t,
    formatCurrency,
    monthlyBudget,
    setMonthlyBudget,
    xp,
    streak
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'tx' | 'add' | 'goals' | 'split' | 'ai' | 'profile'>('home');

  // Input states for logging transaction
  const [txAmount, setTxAmount] = useState('');
  const [txCurrency, setTxCurrency] = useState<Currency>('GEL');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txCategory, setTxCategory] = useState('Food');
  const [txWallet, setTxWallet] = useState('w2');
  const [txMerchant, setTxMerchant] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Input states for adding split expense
  const [splitDesc, setSplitDesc] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [splitPaidBy, setSplitPaidBy] = useState('Heer');

  // AI Chat inputs
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: 'Hey there! I am Finova, your AI Coach. Ask me anything like "Can I buy this?" or "How do I save more?"' }
  ]);

  // Calculate stats
  const totalBalanceUSD = wallets.reduce((sum, w) => {
    // Basic rate conversion to USD for calculation
    const rates: Record<string, number> = {
      USD: 1.0, GEL: 2.70, INR: 83.50, EUR: 0.92, GBP: 0.78, CAD: 1.36, AUD: 1.50, AED: 3.67, JPY: 155.00
    };
    const rate = rates[w.currency] || 1.0;
    return sum + (w.balance / rate);
  }, 0);

  const totalSpentTodayUSD = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.convertedAmount, 0);

  const daysRemaining = 14; // hardcoded mockup representation
  const remainingBudgetUSD = monthlyBudget - transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.convertedAmount, 0);
  const dailySafeSpendUSD = Math.max(0, remainingBudgetUSD / daysRemaining);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(parseFloat(txAmount))) return;

    addTransaction({
      amount: parseFloat(txAmount),
      currency: txCurrency,
      type: txType as 'INCOME' | 'EXPENSE',
      category: txCategory,
      walletId: txWallet,
      merchant: txMerchant || undefined,
      notes: txNotes || undefined,
      date: new Date().toISOString()
    });

    // Reset input fields
    setTxAmount('');
    setTxMerchant('');
    setTxNotes('');
    setActiveTab('home');
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulate AI Coaching response based on context
    setTimeout(() => {
      let reply = '';
      if (userMsg.toLowerCase().includes('buy') || userMsg.toLowerCase().includes('afford')) {
        const costStr = userMsg.match(/\d+/);
        const cost = costStr ? parseInt(costStr[0]) : 30;
        if (cost > dailySafeSpendUSD * 1.5) {
          reply = `Oops! That spending of ${formatCurrency(cost)} exceeds your Daily Safe Spending of ${formatCurrency(dailySafeSpendUSD)}. Doing this might delay your "New Laptop" goal. I suggest cooking at home or splitting it!`;
        } else {
          reply = `Yes, you can afford it! It fits within your today's budget allowance of ${formatCurrency(dailySafeSpendUSD)}. Make sure to log it right after.`;
        }
      } else if (userMsg.toLowerCase().includes('save')) {
        reply = `To hit your "New Laptop" goal by December, you need to save about $110/month. Try capping your coffee expenses at $15/week. That is an easy $30 saved!`;
      } else {
        reply = `I analyzed your spending. You are doing great staying under budget for ${streak} days in a row! Keep this up to earn the 'Budget Master' badge.`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  const handleAddSplitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitAmount || isNaN(parseFloat(splitAmount))) return;

    const amt = parseFloat(splitAmount);
    const shares: Record<string, number> = {
      Jane: amt / 3,
      Heer: amt / 3,
      David: amt / 3
    };

    addSplitExpense('sg1', splitDesc || 'Shared Expense', amt, 'GEL', splitPaidBy, shares);
    setSplitAmount('');
    setSplitDesc('');
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-finova-bg min-h-screen relative pb-24 border-x-2 border-finova-black shadow-2xl">
      {/* Header */}
      <header className="p-4 bg-white border-b-2 border-finova-black flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-2xl tracking-tight bg-finova-yellow border-2 border-finova-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_#000000]">
            Finova
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-heading font-bold bg-orange-100 border-2 border-finova-black px-2 py-0.5 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span id="streak-counter">{streak}</span>
          </div>
          <div className="flex items-center gap-1 font-heading font-bold bg-yellow-100 border-2 border-finova-black px-2 py-0.5 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span id="xp-counter">{xp}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <section className="space-y-6">
            
            {/* Safe Spend Card */}
            <div className="bg-finova-yellow border-2 border-finova-black p-5 rounded-2xl shadow-brutal">
              <span className="font-heading text-xs uppercase tracking-wider font-bold text-gray-800">
                {t('safeSpend')}
              </span>
              <h1 className="font-heading font-bold text-4xl mt-1 text-black">
                {formatCurrency(dailySafeSpendUSD)}
              </h1>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/20 text-sm font-semibold">
                <div>
                  <p className="text-black/60">{t('balance')}</p>
                  <p className="text-black text-lg font-bold">{formatCurrency(totalBalanceUSD)}</p>
                </div>
                <div>
                  <p className="text-black/60">{t('remainingBudget')}</p>
                  <p className="text-black text-lg font-bold">{formatCurrency(remainingBudgetUSD)}</p>
                </div>
              </div>
            </div>

            {/* AI Tip Box */}
            <div className="brutal-card p-4 bg-white flex gap-3 items-start">
              <div className="p-2 bg-purple-100 border-2 border-black rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-black">{t('aiTip')}</h3>
                <p className="font-body text-xs text-gray-600 mt-1">
                  Georgian Metro rides are flat-rate! You logged a Taxi transaction yesterday. Staying on the metro today earns you 50 XP!
                </p>
              </div>
            </div>

            {/* Quests / Streaks */}
            <div className="brutal-card p-4 bg-white">
              <h3 className="font-heading font-bold text-black mb-3">{t('quests')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 border-2 border-black rounded-lg bg-emerald-50">
                  <div className="text-xs">
                    <p className="font-bold text-black">Stay Under Daily Safe Spend</p>
                    <p className="text-gray-500">Progress: {formatCurrency(totalSpentTodayUSD)} / {formatCurrency(dailySafeSpendUSD)}</p>
                  </div>
                  <span className="bg-emerald-200 border border-emerald-500 font-bold px-2 py-0.5 rounded text-xs text-emerald-800">
                    +30 XP
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 border-2 border-black rounded-lg bg-yellow-50">
                  <div className="text-xs">
                    <p className="font-bold text-black">Metro Transit Quest</p>
                    <p className="text-gray-500">Log one metro ride today</p>
                  </div>
                  <span className="bg-yellow-200 border border-yellow-500 font-bold px-2 py-0.5 rounded text-xs text-yellow-800">
                    +50 XP
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading font-bold text-black">{t('recentTransactions')}</h3>
                <button 
                  id="view-all-tx-btn"
                  onClick={() => setActiveTab('tx')} 
                  className="font-heading font-bold text-xs underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 brutal-card bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 border-2 border-black rounded-lg ${tx.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-black">{tx.category}</p>
                        <p className="text-xs text-gray-500">{tx.merchant || 'Manual Entry'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-heading font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-black'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.currency} {tx.amount}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* TAB 2: TRANSACTIONS LIST */}
        {activeTab === 'tx' && (
          <section className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-black mb-4">{t('transactions')}</h1>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 brutal-card bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 border-2 border-black rounded-lg ${tx.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {tx.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-black text-sm">{tx.category}</p>
                      <p className="text-xs text-gray-500">{tx.merchant || 'No Merchant'} | {tx.notes || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-heading font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-black'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.currency} {tx.amount}
                    </p>
                    <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: ADD TRANSACTION OVERLAY */}
        {activeTab === 'add' && (
          <section className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-black">{t('addTransaction')}</h1>
            <form onSubmit={handleSaveTransaction} className="space-y-4 bg-white brutal-card p-5">
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`flex-1 py-2 font-heading font-bold border-2 border-black rounded-lg text-sm transition-colors ${txType === 'EXPENSE' ? 'bg-red-200 text-red-900 shadow-[2px_2px_0px_0px_#000000]' : 'bg-gray-100 text-gray-500'}`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`flex-1 py-2 font-heading font-bold border-2 border-black rounded-lg text-sm transition-colors ${txType === 'INCOME' ? 'bg-emerald-200 text-emerald-900 shadow-[2px_2px_0px_0px_#000000]' : 'bg-gray-100 text-gray-500'}`}
                >
                  {t('income')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('amount')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 brutal-input font-bold text-lg"
                  />
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as Currency)}
                    className="brutal-input bg-white font-bold"
                  >
                    <option value="GEL">GEL (₾)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('category')}</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full brutal-input bg-white font-bold"
                >
                  <option value="Food">Food</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Pocket Money">Pocket Money</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('merchant')}</label>
                <input
                  type="text"
                  value={txMerchant}
                  onChange={(e) => setTxMerchant(e.target.value)}
                  placeholder="e.g. Spar Metro, Dunkin Donuts"
                  className="w-full brutal-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Lunch with team"
                  className="w-full brutal-input text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 brutal-btn-primary"
              >
                {t('save')}
              </button>
            </form>
          </section>
        )}

        {/* TAB 4: SAVINGS GOALS */}
        {activeTab === 'goals' && (
          <section className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-black mb-4">{t('goalsProgress')}</h1>
            <div className="space-y-4">
              {goals.map((g) => {
                const percent = Math.round((g.currentSaved / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="brutal-card p-4 bg-white space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-heading font-bold text-black">{g.name}</h3>
                      <span className="font-heading font-bold text-xs bg-purple-100 border-2 border-black px-2 py-0.5 rounded">
                        Target: ${g.targetAmount}
                      </span>
                    </div>
                    {/* Goal progress bar */}
                    <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-finova-yellow h-full border-r-2 border-black" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                      <p>Saved: ${g.currentSaved} ({percent}%)</p>
                      <p>Due: {g.targetDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateGoalAmount(g.id, 10)} 
                        className="flex-1 py-1 text-xs font-bold border-2 border-black rounded-lg bg-gray-50 active:bg-gray-200"
                      >
                        Add $10
                      </button>
                      <button 
                        onClick={() => updateGoalAmount(g.id, 50)} 
                        className="flex-1 py-1 text-xs font-bold border-2 border-black rounded-lg bg-gray-50 active:bg-gray-200"
                      >
                        Add $50
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 5: FINOVA SPLIT */}
        {activeTab === 'split' && (
          <section className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-black mb-4">{t('split')}</h1>
            
            {/* Split transaction calculator */}
            <div className="brutal-card p-4 bg-white">
              <h3 className="font-heading font-bold text-black mb-3">Add Bill to Split (Flat 5B Roomies)</h3>
              <form onSubmit={handleAddSplitExpense} className="space-y-3">
                <input
                  type="text"
                  required
                  value={splitDesc}
                  onChange={(e) => setSplitDesc(e.target.value)}
                  placeholder="Expense Description (e.g. WiFi)"
                  className="w-full brutal-input text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="Total Amount (GEL)"
                    className="flex-1 brutal-input text-sm"
                  />
                  <select
                    value={splitPaidBy}
                    onChange={(e) => setSplitPaidBy(e.target.value)}
                    className="brutal-input text-sm bg-white font-bold"
                  >
                    <option value="Heer">Heer</option>
                    <option value="Jane">Jane</option>
                    <option value="David">David</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 brutal-btn-primary text-sm">
                  Add Bill
                </button>
              </form>
            </div>

            {/* Split balance list */}
            <div className="brutal-card p-4 bg-white">
              <h3 className="font-heading font-bold text-black mb-3">Group Balance (Equally Split)</h3>
              <div className="space-y-3">
                {splitGroups[0]?.expenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 border-2 border-black rounded-lg text-xs bg-gray-50">
                    <div>
                      <p className="font-bold text-black">{exp.description}</p>
                      <p className="text-gray-500">Paid by {exp.paidBy}</p>
                    </div>
                    <span className="font-heading font-bold">
                      {exp.currency} {exp.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: AI COACH CHAT */}
        {activeTab === 'ai' && (
          <section className="flex flex-col h-[calc(100vh-170px)]">
            <h1 className="font-heading font-bold text-2xl text-black mb-2">{t('chatWithCoach')}</h1>
            
            {/* Message Area */}
            <div className="flex-1 brutal-card bg-white p-4 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-[85%] border-2 border-black rounded-xl text-xs font-semibold ${msg.sender === 'user' ? 'bg-finova-yellow shadow-[2px_2px_0px_0px_#000000]' : 'bg-gray-50'}`}>
                    <p className="text-black leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask e.g. Can I buy a phone?"
                className="flex-1 brutal-input text-xs"
              />
              <button type="submit" className="p-3 brutal-btn-primary">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === 'profile' && (
          <section className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-black mb-4">{t('profile')}</h1>

            <div className="brutal-card p-4 bg-white space-y-4">
              <h3 className="font-heading font-bold text-black">Settings</h3>
              
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('languages')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['en', 'ka', 'es', 'hi'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`py-1.5 border-2 border-black rounded-lg text-xs font-bold uppercase transition-colors ${language === lang ? 'bg-finova-yellow' : 'bg-gray-50'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('currencies')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['USD', 'GEL', 'INR', 'EUR', 'GBP'] as Currency[]).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setCurrency(cur)}
                      className={`py-1.5 border-2 border-black rounded-lg text-xs font-bold transition-colors ${currency === cur ? 'bg-finova-yellow' : 'bg-gray-50'}`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* App Budget setting */}
            <div className="brutal-card p-4 bg-white space-y-3">
              <h3 className="font-heading font-bold text-black">Monthly Budget Limit</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                  className="flex-1 brutal-input text-sm font-bold"
                />
                <span className="p-3 bg-gray-100 border-2 border-black rounded-lg font-bold text-xs uppercase">
                  USD
                </span>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Bottom Fixed Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-finova-black px-4 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'home' ? 'text-black' : 'text-gray-400'}`}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('tx')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'tx' ? 'text-black' : 'text-gray-400'}`}
        >
          <ReceiptText className="w-5 h-5" />
          <span>Track</span>
        </button>
        <button 
          onClick={() => setActiveTab('add')} 
          className="w-12 h-12 bg-finova-yellow border-2 border-finova-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all transform -translate-y-4"
        >
          <Plus className="w-6 h-6 text-black" />
        </button>
        <button 
          onClick={() => setActiveTab('goals')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'goals' ? 'text-black' : 'text-gray-400'}`}
        >
          <Target className="w-5 h-5" />
          <span>Goals</span>
        </button>
        <button 
          onClick={() => setActiveTab('split')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'split' ? 'text-black' : 'text-gray-400'}`}
        >
          <Users className="w-5 h-5" />
          <span>Split</span>
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'ai' ? 'text-black' : 'text-gray-400'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Coach</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'profile' ? 'text-black' : 'text-gray-400'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
