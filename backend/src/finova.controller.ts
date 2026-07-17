import { Controller, Get, Post, Patch, Body, Param, Query, BadRequestException } from '@nestjs/common';
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

  @Post('auth/register')
  async register(@Body() body: any) {
    const { email, password, name, country, college, baseCurrency } = body;
    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required');
    }

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
        country,
        college,
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
    return { message: 'User registered successfully', token, user: { id: user.id, email: user.email, name: user.name } };
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
    return { token, user: { id: user.id, name: user.name, baseCurrency: user.baseCurrency } };
  }

  @Patch('auth/onboard')
  async onboard(@Body() body: any) {
    const { userId, monthlyBudget, initialBalance, initialWalletName, initialWalletType } = body;
    if (!userId) throw new BadRequestException('User ID is required');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyBudget,
        currentBalance: initialBalance || 0,
        wallets: {
          create: {
            name: initialWalletName || 'Cash',
            type: initialWalletType || 'CASH',
            balance: initialBalance || 0
          }
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
  async getTransactions(@Query('walletId') walletId: string) {
    if (!walletId) throw new BadRequestException('Wallet ID required');
    return this.prisma.transaction.findMany({
      where: { walletId },
      orderBy: { date: 'desc' }
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
}
