'use client';

import React, { useState } from 'react';
import { Plus, Users, Receipt, ChevronRight, ArrowLeft, Trash2, DollarSign } from 'lucide-react';
import { useApp, Currency } from '../context/AppContext';

type SplitView = 'groups' | 'create-group' | 'group-detail' | 'add-expense';

export default function SplitPage() {
  const { splitGroups, addSplitGroup, addSplitExpense, formatCurrency, currency, user } = useApp();
  const [view, setView] = useState<SplitView>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Create Group form
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  // Add Expense form
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');

  const selectedGroup = splitGroups.find(g => g.id === selectedGroupId);

  const handleCreateGroup = () => {
    if (!groupName.trim() || members.length === 0) return;
    const allMembers = [user?.name || 'Me', ...members];
    addSplitGroup(groupName.trim(), allMembers);
    setGroupName('');
    setMembers([]);
    setMemberInput('');
    setView('groups');
  };

  const handleAddMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name)) {
      setMembers(prev => [...prev, name]);
      setMemberInput('');
    }
  };

  const handleAddExpense = () => {
    if (!selectedGroupId || !expenseDesc.trim() || !expenseAmount || !paidBy) return;
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) return;

    const group = splitGroups.find(g => g.id === selectedGroupId);
    if (!group) return;

    // Equal split
    const sharePerPerson = amt / group.members.length;
    const shares: Record<string, number> = {};
    group.members.forEach(m => { shares[m] = sharePerPerson; });

    addSplitExpense(selectedGroupId, expenseDesc.trim(), amt, currency, paidBy, shares);
    setExpenseDesc('');
    setExpenseAmount('');
    setPaidBy('');
    setView('group-detail');
  };

  // Calculate balances for a group
  const calculateBalances = (group: typeof splitGroups[0]) => {
    const balances: Record<string, number> = {};
    group.members.forEach(m => { balances[m] = 0; });

    group.expenses.forEach(exp => {
      // The payer paid full amount
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
      // Each person owes their share
      Object.entries(exp.shares).forEach(([person, share]) => {
        balances[person] = (balances[person] || 0) - share;
      });
    });

    return balances;
  };

  const simplifyDebts = (balances: Record<string, number>) => {
    const debts: { from: string; to: string; amount: number }[] = [];
    const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).map(([k, v]) => ({ name: k, amount: -v }));
    const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).map(([k, v]) => ({ name: k, amount: v }));

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const payment = Math.min(debtors[i].amount, creditors[j].amount);
      if (payment > 0.01) {
        debts.push({ from: debtors[i].name, to: creditors[j].name, amount: payment });
      }
      debtors[i].amount -= payment;
      creditors[j].amount -= payment;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return debts;
  };

  if (view === 'create-group') {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in-up">
        <button onClick={() => setView('groups')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Create Group</h1>

        <div className="card p-5 max-w-md w-full space-y-5">
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Roommates, Trip to Paris"
              className="input text-base w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Add Members</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                placeholder="Enter name"
                className="input text-base flex-1"
              />
              <button onClick={handleAddMember} className="btn-primary px-4 py-2 rounded-xl text-sm">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                Members ({members.length + 1} including you)
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="pill pill-active text-sm">{user?.name || 'Me'} (You)</span>
                {members.map((m) => (
                  <span key={m} className="pill text-sm flex items-center gap-2">
                    {m}
                    <button onClick={() => setMembers(prev => prev.filter(x => x !== m))} className="hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || members.length === 0}
            className="btn-primary w-full py-4 rounded-xl text-base font-heading font-semibold mt-4"
            style={{ opacity: (!groupName.trim() || members.length === 0) ? 0.5 : 1 }}
          >
            Create Group
          </button>
        </div>
      </div>
    );
  }

  if (view === 'add-expense' && selectedGroup) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in-up">
        <button onClick={() => setView('group-detail')} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Add Expense</h1>

        <div className="card p-5 max-w-md w-full space-y-5">
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Description</label>
            <input
              type="text"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="e.g., Dinner, Groceries"
              className="input text-base w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Amount</label>
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              className="input text-base w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Paid By</label>
            <div className="flex flex-wrap gap-2">
              {selectedGroup.members.map((m) => (
                <button
                  key={m}
                  onClick={() => setPaidBy(m)}
                  className={`pill text-sm ${paidBy === m ? 'pill-active' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Split equally among {selectedGroup.members.length} members ({formatCurrency(parseFloat(expenseAmount || '0') / selectedGroup.members.length)} each)
          </p>

          <button
            onClick={handleAddExpense}
            disabled={!expenseDesc.trim() || !expenseAmount || !paidBy}
            className="btn-primary w-full py-4 rounded-xl text-base font-heading font-semibold mt-4"
            style={{ opacity: (!expenseDesc.trim() || !expenseAmount || !paidBy) ? 0.5 : 1 }}
          >
            Add Expense
          </button>
        </div>
      </div>
    );
  }

  // Group Detail View
  if (view === 'group-detail' && selectedGroup) {
    const balances = calculateBalances(selectedGroup);
    const debts = simplifyDebts(balances);
    const totalExpenses = selectedGroup.expenses.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in-up">
        <button onClick={() => { setView('groups'); setSelectedGroupId(null); }} className="btn-ghost text-sm font-heading font-semibold flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{selectedGroup.name}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{selectedGroup.members.length} members · {selectedGroup.expenses.length} expenses</p>
          </div>
          <button
            onClick={() => setView('add-expense')}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-heading font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        {/* Total */}
        <div className="card p-5 text-center">
          <p className="text-sm uppercase tracking-wider font-semibold" style={{ color: 'var(--text-tertiary)' }}>Total Expenses</p>
          <p className="font-heading font-bold text-3xl mt-1" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Settlements */}
          <div className="flex flex-col gap-6">
            {debts.length > 0 && (
              <div className="card p-5 space-y-4">
                <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Who Owes Who</h3>
                {debts.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>
                        {d.from[0]}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{d.from}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#00B89420', color: '#00B894' }}>
                        {d.to[0]}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{d.to}</span>
                    </div>
                    <span className="font-heading font-bold text-base" style={{ color: '#6C5CE7' }}>{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Expense List */}
          <div className="flex flex-col gap-6">
            {selectedGroup.expenses.length > 0 && (
              <div className="card p-5 space-y-4">
                <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Expenses</h3>
                {selectedGroup.expenses.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ background: 'var(--bg-tertiary)' }}>
                    <div>
                      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{exp.description}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Paid by {exp.paidBy}</p>
                    </div>
                    <p className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>{formatCurrency(exp.amount)}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedGroup.expenses.length === 0 && (
              <div className="text-center py-12 card bg-transparent border-dashed border-2 border-white/10">
                <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-base" style={{ color: 'var(--text-tertiary)' }}>No expenses yet. Tap "Add Expense" to start splitting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Groups List (Default)
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Split Expenses</h1>
        <button
          onClick={() => setView('create-group')}
          className="btn-primary px-3 py-2 rounded-xl text-xs font-heading font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> New Group
        </button>
      </div>

      {splitGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {splitGroups.map((group) => {
            const total = group.expenses.reduce((s, e) => s + e.amount, 0);
            return (
              <button
                key={group.id}
                onClick={() => { setSelectedGroupId(group.id); setView('group-detail'); }}
                className="card p-5 w-full text-left flex items-center gap-4 hover:ring-2 ring-[#6C5CE7]/30 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {group.members.length} members · {group.expenses.length} expenses
                  </p>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <p className="font-heading font-bold text-base" style={{ color: '#6C5CE7' }}>{formatCurrency(total)}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 card max-w-lg mx-auto bg-transparent border-dashed border-2 border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <Users className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 className="font-heading font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No groups yet</h3>
          <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
            Create a group to start splitting expenses with friends
          </p>
          <button
            onClick={() => setView('create-group')}
            className="btn-primary px-6 py-3 rounded-xl text-base font-heading font-semibold mx-auto w-fit"
          >
            Create Your First Group
          </button>
        </div>
      )}
    </div>
  );
}
