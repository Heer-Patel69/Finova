import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('api/ai-coach')
export class AiCoachController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. GET MORNING BRIEFING
  @Get('briefing/morning')
  async getMorningBriefing(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);

    // Sum monthly expenses
    const expenses = await this.prisma.transaction.findMany({
      where: {
        walletId: { in: walletIds },
        type: 'EXPENSE',
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    });

    const totalSpentUSD = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);
    const budgetLimitUSD = user.monthlyBudget || 500;
    const remainingBudgetUSD = Math.max(0, budgetLimitUSD - totalSpentUSD);
    const daysRemaining = 30 - new Date().getDate() + 1;
    const dailySafeSpending = remainingBudgetUSD / daysRemaining;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Mock Fallback if no API key is defined in environment
      return {
        greeting: `Good Morning, ${user.name}!`,
        statusSummary: `You have ${daysRemaining} days left this month. Remaining budget is $${remainingBudgetUSD.toFixed(2)}.`,
        dailySafeSpending: parseFloat(dailySafeSpending.toFixed(2)),
        dailyQuest: 'No spend on cafes today! Keep the coffee streak alive.',
        coachTip: 'Brewing espresso at home today will save you approximately 5 GEL!'
      };
    }

    // Call Groq API
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are Finova, an empathetic AI coach for students. Format response strictly as a JSON object: { "greeting": "string", "statusSummary": "string", "dailySafeSpending": float, "dailyQuest": "string", "coachTip": "string" }'
            },
            {
              role: 'user',
              content: `User name: ${user.name}, remaining days: ${daysRemaining}, remaining budget: $${remainingBudgetUSD}, DSS limit: $${dailySafeSpending}`
            }
          ]
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      // Return safe fallback on connection error
      return {
        greeting: `Good Morning, ${user.name}!`,
        statusSummary: `You have ${daysRemaining} days left this month. Remaining budget is $${remainingBudgetUSD.toFixed(2)}.`,
        dailySafeSpending: parseFloat(dailySafeSpending.toFixed(2)),
        dailyQuest: 'Stay under budget today to earn bonus streak XP!',
        coachTip: 'Connection to Groq was interrupted, but your local safe limits remain active.'
      };
    }
  }

  // 2. CHAT / AFFORDABILITY CHECK
  @Post('chat')
  async chatQuery(@Body() body: any) {
    const { userId, message } = body;
    if (!userId || !message) throw new BadRequestException('User ID and message are required');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const walletIds = wallets.map(w => w.id);

    const expenses = await this.prisma.transaction.findMany({
      where: {
        walletId: { in: walletIds },
        type: 'EXPENSE',
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    });

    const totalSpentUSD = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);
    const budgetLimitUSD = user.monthlyBudget || 500;
    const remainingBudgetUSD = Math.max(0, budgetLimitUSD - totalSpentUSD);
    const daysRemaining = 30 - new Date().getDate() + 1;
    const dailySafeSpending = remainingBudgetUSD / daysRemaining;

    // Check if query is an affordability check
    const costMatch = message.match(/\d+/);
    const cost = costMatch ? parseFloat(costMatch[0]) : 0;
    const isAffordable = cost <= dailySafeSpending * 1.5;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Mock Fallback
      return {
        answer: isAffordable
          ? `Yes, this fits within your daily safe allowance of $${dailySafeSpending.toFixed(2)}. Go ahead and log it afterwards!`
          : `That purchase of $${cost.toFixed(2)} exceeds your daily safe limit of $${dailySafeSpending.toFixed(2)}. I recommend waiting or splitting it.`,
        isAffordable,
        dssImpact: dailySafeSpending - cost
      };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are Finova, the financial coach. Evaluate if the student can afford the cost. Format response strictly as a JSON object: { "answer": "string", "isAffordable": boolean, "dssImpact": float }'
            },
            {
              role: 'user',
              content: `User query: "${message}", remaining budget: $${remainingBudgetUSD}, daily allowance: $${dailySafeSpending}, proposed item cost: $${cost}`
            }
          ]
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      return {
        answer: `Evaluating offline: Your current daily safe spend limit is $${dailySafeSpending.toFixed(2)}.`,
        isAffordable,
        dssImpact: dailySafeSpending - cost
      };
    }
  }
}
