import { Controller, Get, Post, Patch, Body, Param, Query, Res, BadRequestException, Delete, Put } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Controller('api')
export class FinovaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  // 1. AUTHENTICATION & ONBOARDING

  @Get('users/profile')
  async getProfile(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID required');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      baseCurrency: user.baseCurrency,
      college: user.college,
      country: user.country
    };
  }

  @Post('auth/register')
  async register(@Body() body: any) {
    const { email, password, name, country, college, baseCurrency } = body;
    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required');
    }

    try {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          country: country || '',
          college: college || '',
          baseCurrency: baseCurrency || 'USD',
          profile: {
            create: {
              xp: 0,
              currentStreak: 0,
              highestStreak: 0
            }
          }
        }
      });

      const token = this.jwtService.sign({ userId: user.id, email: user.email });
      return { message: 'User registered successfully', token, user: { id: user.id, email: user.email, name: user.name, college: user.college, country: user.country, baseCurrency: user.baseCurrency } };
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.status) throw error; // Re-throw NestJS exceptions
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, baseCurrency: user.baseCurrency, college: user.college, country: user.country } };
  }

  @Patch('auth/onboard')
  async onboard(@Body() body: any) {
    const { userId, monthlyBudget, wallets } = body;
    if (!userId) throw new BadRequestException('User ID is required');

    let totalInitialBalance = 0;
    const walletsToCreate = Array.isArray(wallets) ? wallets.map(w => {
      totalInitialBalance += (w.balance || 0);
      return {
        name: w.name || 'Wallet',
        type: w.type || 'CASH',
        balance: w.balance || 0,
        currency: w.currency || 'USD'
      };
    }) : [];

    // Fallback if empty
    if (walletsToCreate.length === 0) {
      walletsToCreate.push({ name: 'Cash', type: 'CASH', balance: 0, currency: 'USD' });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyBudget,
        currentBalance: totalInitialBalance,
        wallets: {
          create: walletsToCreate
        }
      }
    });

    return { success: true, onboardingCompleted: true };
  }

  // 2. WALLETS SYSTEM

  @Get('wallets')
  async getWallets(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID required');
    return this.prisma.wallet.findMany({ where: { userId } });
  }

  @Post('wallets')
  async createWallet(@Body() body: any) {
    const { userId, name, type, balance, currency } = body;
    if (!userId || !name) throw new BadRequestException('User ID and Name are required');

    return this.prisma.wallet.create({
      data: {
        userId,
        name,
        type: type || 'CASH',
        balance: balance || 0,
        currency: currency || 'USD'
      }
    });
  }

  // 3. TRANSACTIONS

  @Post('transactions')
  async logTransaction(@Body() body: any) {
    const { walletId, amount, currency, category, type, merchant, notes, date } = body;
    if (!walletId || !amount || !category || !type) {
      throw new BadRequestException('Missing required transaction fields');
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new BadRequestException('Wallet not found');

    // Exchange rates mockup logic matching TRD specs
    const rates: Record<string, number> = {
      USD: 1.0, GEL: 2.70, INR: 83.50, EUR: 0.92, GBP: 0.78, CAD: 1.36, AUD: 1.50, AED: 3.67, JPY: 155.00
    };
    const txRate = rates[currency] || 1.0;
    const convertedAmount = amount / txRate; // Converted to base currency USD

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId,
        amount,
        currency,
        convertedAmount,
        exchangeRate: txRate,
        category,
        type,
        merchant,
        notes,
        date: date ? new Date(date) : new Date()
      }
    });

    // Update wallet balance
    const balanceDiff = type === 'INCOME' ? amount : -amount;
    await this.prisma.wallet.update({
      where: { id: walletId },
      data: { balance: wallet.balance + balanceDiff }
    });

    // Grant XP in profile
    await this.prisma.profile.update({
      where: { userId: wallet.userId },
      data: { xp: { increment: 15 } }
    });

    return transaction;
  }

  @Get('transactions')
  async getTransactions(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID required');
    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);
    return this.prisma.transaction.findMany({
      where: { walletId: { in: walletIds } },
      orderBy: { date: 'desc' }
    });
  }

  @Delete('transactions/:id')
  async deleteTransaction(@Param('id') id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');

    const wallet = await this.prisma.wallet.findUnique({ where: { id: tx.walletId } });
    if (wallet) {
      // Revert wallet balance
      const balanceDiff = tx.type === 'INCOME' ? -tx.amount : tx.amount;
      await this.prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: wallet.balance + balanceDiff }
      });
    }

    return this.prisma.transaction.delete({ where: { id } });
  }

  @Put('transactions/:id')
  async updateTransaction(@Param('id') id: string, @Body() body: any) {
    const { amount, date, notes, merchant, category, type } = body;
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');

    // Revert old amount
    const wallet = await this.prisma.wallet.findUnique({ where: { id: tx.walletId } });
    if (wallet) {
      const oldDiff = tx.type === 'INCOME' ? -tx.amount : tx.amount;
      const newDiff = type === 'INCOME' ? amount : -amount;
      await this.prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: wallet.balance + oldDiff + newDiff }
      });
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        category,
        merchant,
        notes,
        date: date ? new Date(date) : undefined
      }
    });
  }

  // 4. BUDGETS & GOALS

  @Get('budgets/active')
  async getActiveBudgets(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID required');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);

    const expenses = await this.prisma.transaction.findMany({
      where: {
        walletId: { in: walletIds },
        type: 'EXPENSE',
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } // current month
      }
    });

    const totalSpentUSD = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);
    const budgetLimitUSD = user.monthlyBudget || 500;
    const remainingBudgetUSD = Math.max(0, budgetLimitUSD - totalSpentUSD);
    const daysRemaining = 30 - new Date().getDate() + 1;
    const dailySafeSpending = remainingBudgetUSD / daysRemaining;

    return {
      monthlyBudget: budgetLimitUSD,
      totalSpent: totalSpentUSD,
      remainingBudget: remainingBudgetUSD,
      dailySafeSpending
    };
  }

  @Post('goals')
  async createGoal(@Body() body: any) {
    const { userId, name, targetAmount, targetDate, currentSaved } = body;
    if (!userId || !name || !targetAmount) throw new BadRequestException('Name and target amount required');

    const monthlyRequired = targetAmount / 12; // mock simple layout

    return this.prisma.goal.create({
      data: {
        userId,
        name,
        targetAmount,
        currentSaved: currentSaved || 0,
        targetDate: new Date(targetDate),
        health: 'ON_TRACK',
        monthlyRequired,
        estimatedCompletion: new Date(targetDate)
      }
    });
  }

  // 5. FINOVA SPLIT (EXPENSE MINIMIZATION ALGORITHM)

  @Post('split/groups')
  async createSplitGroup(@Body() body: any) {
    const { name, memberEmails } = body;
    if (!name || !memberEmails) throw new BadRequestException('Name and Member emails required');

    // Create group
    const group = await this.prisma.splitGroup.create({
      data: { name }
    });

    // Mock link users (for demo compilation, we populate with placeholders if users don't exist)
    for (const email of memberEmails) {
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            passwordHash: 'dummy',
            name: email.split('@')[0],
            country: 'Georgia',
            college: 'Placeholder'
          }
        });
      }

      await this.prisma.splitGroupMember.create({
        data: {
          groupId: group.id,
          userId: user.id
        }
      });
    }

    return group;
  }

  @Get('split/groups/:groupId/balances')
  async getGroupBalances(@Param('groupId') groupId: string) {
    const members = await this.prisma.splitGroupMember.findMany({
      where: { groupId },
      include: { user: true }
    });

    const expenses = await this.prisma.splitExpense.findMany({
      where: { groupId },
      include: { shares: true }
    });

    // 1. Calculate Net Balances (Paid - Owed)
    const netBalances: Record<string, number> = {};
    for (const m of members) {
      netBalances[m.user.name] = 0;
    }

    for (const exp of expenses) {
      const payerName = members.find(m => m.userId === exp.paidById)?.user.name;
      if (payerName) {
        netBalances[payerName] += exp.amount;
      }
      for (const share of exp.shares) {
        const shareMemberName = members.find(m => m.userId === share.userId)?.user.name;
        if (shareMemberName) {
          netBalances[shareMemberName] -= share.amount;
        }
      }
    }

    // 2. Separate into Debtors and Creditors
    const debtors: { name: string, balance: number }[] = [];
    const creditors: { name: string, balance: number }[] = [];

    for (const name of Object.keys(netBalances)) {
      const bal = netBalances[name];
      if (bal < -0.01) {
        debtors.push({ name, balance: bal });
      } else if (bal > 0.01) {
        creditors.push({ name, balance: bal });
      }
    }

    // 3. Mini Debt Minimizer Loop
    const settlements: { debtor: string, creditor: string, amount: number }[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);
      settlements.push({
        debtor: debtor.name,
        creditor: creditor.name,
        amount: parseFloat(amountToSettle.toFixed(2))
      });

      debtor.balance += amountToSettle;
      creditor.balance -= amountToSettle;

      if (Math.abs(debtor.balance) < 0.01) dIdx++;
      if (creditor.balance < 0.01) cIdx++;
    }

    return { netBalances, settlements };
  }

  // 6. ANALYTICS ENDPOINTS

  @Get('analytics/summary')
  async getAnalyticsSummary(@Query('userId') userId: string, @Query('dateRange') dateRange: string) {
    if (!userId) throw new BadRequestException('User ID required');
    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);

    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // default this month
    if (dateRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 86400000);
    } else if (dateRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 86400000);
    } else if (dateRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const txs = await this.prisma.transaction.findMany({
      where: {
        walletId: { in: walletIds },
        date: { gte: startDate }
      }
    });

    const totalSpending = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.convertedAmount, 0);
    const totalIncome = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.convertedAmount, 0);
    const netBalance = totalIncome - totalSpending;

    return {
      totalSpending,
      totalIncome,
      netBalance,
      transactionCount: txs.length
    };
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('scope') scope: string,
    @Query('college') college: string,
    @Query('userId') userId: string
  ) {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { profile: { xp: 'desc' } },
      take: 20
    });

    return users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      college: u.college || 'Universal',
      xp: u.profile?.xp || 0,
      streak: u.profile?.currentStreak || 0,
      badge: (u.profile?.xp || 0) > 300 ? 'Budget Guru' : 'Saver Starter'
    }));
  }

  @Get('reports/export')
  async exportReport(
    @Query('userId') userId: string,
    @Query('format') format: string,
    @Res() res: any
  ) {
    if (!userId) throw new BadRequestException('User ID required');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);
    const txs = await this.prisma.transaction.findMany({
      where: { walletId: { in: walletIds } },
      orderBy: { date: 'desc' }
    });

    if (format === 'csv') {
      let csv = 'ID,Date,Category,Type,Amount,Currency,ConvertedAmountUSD,Merchant,Notes\n';
      for (const t of txs) {
        csv += `"${t.id}","${t.date.toISOString()}","${t.category}","${t.type}",${t.amount},"${t.currency}",${t.convertedAmount},"${t.merchant || ''}","${t.notes || ''}"\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=finova_report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    // PDF / HTML Print Layout
    const totalSpent = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.convertedAmount, 0),
      totalIncome = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.convertedAmount, 0);

    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Finova Financial Report</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { padding: 0 !important; background: white !important; }
            .no-print { display: none !important; }
          }
          body { font-family: sans-serif; padding: 40px; color: #1A1D2E; background: #F8F9FC; }
          h1 { font-family: sans-serif; color: #6C5CE7; margin-bottom: 5px; }
          .summary { display: flex; gap: 20px; margin: 30px 0; }
          .card { flex: 1; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          .card h3 { margin: 0 0 10px 0; font-size: 14px; color: #718096; }
          .card p { margin: 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E2E8F0; }
          th { background: #EEF0F6; color: #4A5568; }
          .badge { padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; }
          .badge-income { background: #E6FFFA; color: #319795; }
          .badge-expense { background: #FFF5F5; color: #E53E3E; }
          @media print {
            .no-print { display: none; }
            body { background: white; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #6C5CE7; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Print / Save as PDF
          </button>
        </div>
        <h1>Finova Report</h1>
        <p style="color: #718096;">Generated for ${user.name} (${user.email}) · ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <div class="card">
            <h3>Total Spent (USD)</h3>
            <p>$${totalSpent.toFixed(2)}</p>
          </div>
          <div class="card">
            <h3>Total Income (USD)</h3>
            <p>$${totalIncome.toFixed(2)}</p>
          </div>
          <div class="card">
            <h3>Net Savings (USD)</h3>
            <p style="color: ${totalIncome - totalSpent >= 0 ? '#319795' : '#E53E3E'}">
              $${(totalIncome - totalSpent).toFixed(2)}
            </p>
          </div>
        </div>

        <h2>Transactions History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Merchant</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${txs.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.category}</td>
                <td><span class="badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}">${t.type}</span></td>
                <td>${t.merchant || 'Manual'}</td>
                <td style="font-weight: bold; color: ${t.type === 'INCOME' ? '#319795' : '#1A1D2E'}">
                  ${t.type === 'INCOME' ? '+' : '-'}${t.currency} ${t.amount}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #6C5CE7; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">
            Print / Save as PDF
          </button>
        </div>
        
        <script>
          // Automatically open print dialog when loaded
          window.onload = function() {
            setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlReport);
  }
}
