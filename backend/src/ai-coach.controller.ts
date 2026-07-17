import { Controller, Get, Post, Delete, Body, Query, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function cleanJsonResponse(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
  }
  return clean.trim();
}

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

    const totalSpentUSD = expenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount || 0), 0);
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
          model: 'llama-3.3-70b-versatile',
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

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error(`Invalid response structure from Groq: ${JSON.stringify(data)}`);
      }
      const contentText = data.choices[0].message.content;
      return JSON.parse(cleanJsonResponse(contentText));
    } catch (err) {
      console.error('Morning Briefing AI Error:', err);
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

  // 2. GET CHAT HISTORY
  @Get('history')
  async getChatHistory(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID is required');
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // 3. DELETE CHAT HISTORY
  @Delete('history')
  async deleteChatHistory(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('User ID is required');
    await this.prisma.aIConversation.deleteMany({
      where: { userId }
    });
    return { success: true, message: 'Chat history cleared' };
  }

  // 4. CHAT / AFFORDABILITY CHECK
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

    const totalSpentUSD = expenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount || 0), 0);
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
      const fallbackAns = isAffordable
        ? `Yes, this fits within your daily safe allowance of $${dailySafeSpending.toFixed(2)}. Go ahead and log it afterwards!`
        : `That purchase of $${cost.toFixed(2)} exceeds your daily safe limit of $${dailySafeSpending.toFixed(2)}. I recommend waiting or splitting it.`;

      // Save fallback in DB
      await this.prisma.aIConversation.create({
        data: {
          userId,
          prompt: message,
          response: fallbackAns
        }
      });

      return {
        answer: fallbackAns,
        isAffordable,
        dssImpact: dailySafeSpending - cost
      };
    }

    try {
      // Get conversation history
      const history = await this.prisma.aIConversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8
      });
      const reversedHistory = history.reverse();

      const messages: any[] = [
        {
          role: 'system',
          content: 'You are Finova, the financial coach. Evaluate if the student can afford the cost, or answer their financial question. CRITICAL: By default, you MUST provide simple, concise, short, practical, conversational, and easy-to-understand answers (max 1-2 sentences). DO NOT use long or overly technical explanations for everyday financial questions. ONLY generate detailed or complex responses if the user EXPLICITLY asks for them. Format response strictly as a JSON object: { "answer": "string", "isAffordable": boolean, "dssImpact": float }'
        }
      ];

      for (const conv of reversedHistory) {
        messages.push({ role: 'user', content: conv.prompt });
        // Ensure response is inside valid assistant content
        let cleanResponse = conv.response;
        try {
          const parsed = JSON.parse(conv.response);
          if (parsed && parsed.answer) cleanResponse = parsed.answer;
        } catch {}
        messages.push({ role: 'assistant', content: cleanResponse });
      }

      messages.push({
        role: 'user',
        content: `User query: "${message}", remaining budget: $${remainingBudgetUSD}, daily allowance: $${dailySafeSpending}, proposed item cost: $${cost}`
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error(`Invalid response structure from Groq: ${JSON.stringify(data)}`);
      }
      const contentText = data.choices[0].message.content;
      const parsedAns = JSON.parse(cleanJsonResponse(contentText));

      // Save conversation in DB
      await this.prisma.aIConversation.create({
        data: {
          userId,
          prompt: message,
          response: parsedAns.answer || parsedAns.message || 'Processed response'
        }
      });

      return parsedAns;
    } catch (err) {
      console.error('Chat Query AI Error:', err);
      const fallbackAns = `Evaluating offline: Your current daily safe spend limit is $${dailySafeSpending.toFixed(2)}.`;
      
      // Save offline fallback in DB
      await this.prisma.aIConversation.create({
        data: {
          userId,
          prompt: message,
          response: fallbackAns
        }
      });

      return {
        answer: fallbackAns,
        isAffordable,
        dssImpact: dailySafeSpending - cost
      };
    }
  }
}
