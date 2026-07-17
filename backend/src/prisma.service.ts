import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finova',
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async checkAndAwardTrophies(userId: string) {
    try {
      // 1. Get user profile
      let profile = await this.profile.findUnique({ where: { userId } });
      if (!profile) {
        profile = await this.profile.create({ data: { userId } });
      }

      // Helper to unlock badge
      const unlockBadge = async (badgeId: string, xpReward: number) => {
        try {
          const existing = await this.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId } }
          });
          if (!existing) {
            await this.userBadge.create({
              data: { userId, badgeId }
            });
            // Award XP
            await this.profile.update({
              where: { userId },
              data: { xp: { increment: xpReward } }
            });
            console.log(`Unlocked badge ${badgeId} for user ${userId} with ${xpReward} XP`);
          }
        } catch (err) {
          // Safe check
        }
      };

      // Rule 1: early-adopter is unlocked for everyone who joins
      await unlockBadge('early-adopter', 100);

      // Rule 2: saving-streak (7-day streak)
      if (profile.currentStreak >= 7) {
        await unlockBadge('saving-streak', 150);
      }

      // Rule 3: consistent-tracker (30-day streak)
      if (profile.currentStreak >= 30) {
        await unlockBadge('consistent-tracker', 1000);
      }

      // Rule 4: first-100-tx (100 total transactions)
      const txCount = await this.transaction.count({
        where: { wallet: { userId } }
      });
      if (txCount >= 100) {
        await unlockBadge('first-100-tx', 500);
      }

      // Rule 5: budget-master (stay under budget)
      const wallets = await this.wallet.findMany({ where: { userId } });
      const walletIds = wallets.map(w => w.id);
      const expenses = await this.transaction.findMany({
        where: {
          walletId: { in: walletIds },
          type: 'EXPENSE',
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      });
      const totalSpent = expenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount || 0), 0);
      const userObj = await this.user.findUnique({ where: { id: userId } });
      if (userObj && userObj.monthlyBudget && totalSpent > 0 && totalSpent <= userObj.monthlyBudget) {
        await unlockBadge('budget-master', 200);
      }

      // Rule 6: monthly-goal
      const goals = await this.goal.findMany({ where: { userId } });
      const completedGoals = goals.filter(g => g.currentSaved >= g.targetAmount).length;
      if (completedGoals >= 1) {
        await unlockBadge('monthly-goal', 400);
      }
    } catch (e) {
      console.error('Error in checkAndAwardTrophies:', e);
    }
  }
}
