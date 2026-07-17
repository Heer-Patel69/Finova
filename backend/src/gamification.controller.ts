import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('api/gamification')
export class GamificationController {
  constructor(private prisma: PrismaService) {}

  @Post('activity')
  async logActivity(@Body() body: { userId: string; xp: number }) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Midnight UTC for the day

    // Upsert daily activity
    const activity = await this.prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId: body.userId,
          date: today,
        },
      },
      update: {
        xpEarned: { increment: body.xp },
      },
      create: {
        userId: body.userId,
        date: today,
        completed: true,
        xpEarned: body.xp,
      },
    });

    // Update Streak Logic
    let profile = await this.prisma.profile.findUnique({
      where: { userId: body.userId }
    });

    if (!profile) {
       profile = await this.prisma.profile.create({
           data: { userId: body.userId }
       });
    }

    let newCurrentStreak = profile.currentStreak;
    let newHighestStreak = profile.highestStreak;
    let newXp = profile.xp + body.xp;

    const lastActive = profile.lastActiveDate;

    if (!lastActive) {
      newCurrentStreak = 1;
      newHighestStreak = Math.max(1, newHighestStreak);
    } else {
      const lastDate = new Date(lastActive);
      lastDate.setUTCHours(0,0,0,0);
      
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Continuous streak
        newCurrentStreak += 1;
        newHighestStreak = Math.max(newHighestStreak, newCurrentStreak);
      } else if (diffDays > 1) {
        // Streak broken
        newCurrentStreak = 1;
      }
      // if diffDays === 0, they already logged activity today, streak remains same
    }

    await this.prisma.profile.update({
      where: { userId: body.userId },
      data: {
        currentStreak: newCurrentStreak,
        highestStreak: newHighestStreak,
        lastActiveDate: today,
        xp: newXp
      }
    });

    // Check achievements
    await this.prisma.checkAndAwardTrophies(body.userId);

    return { success: true, newCurrentStreak, newXp, activity };
  }

  @Get('streaks')
  async getStreaks(@Query('userId') userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId }
    });

    const activities = await this.prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    return {
      currentStreak: profile?.currentStreak || 0,
      highestStreak: profile?.highestStreak || 0,
      totalActiveDays: activities.length,
      activities
    };
  }

  @Get('trophies')
  async getTrophies(@Query('userId') userId: string) {
    await this.prisma.checkAndAwardTrophies(userId);
    
    const profile = await this.prisma.profile.findUnique({
      where: { userId }
    });
    const badges = await this.prisma.userBadge.findMany({
      where: { userId }
    });

    return {
      profile: {
        xp: profile?.xp || 0,
        currentStreak: profile?.currentStreak || 0,
        highestStreak: profile?.highestStreak || 0
      },
      badges
    };
  }

  @Post('trophies/check')
  async checkTrophies(@Body() body: { userId: string, badgeId: string }) {
    try {
      const badge = await this.prisma.userBadge.create({
        data: {
          userId: body.userId,
          badgeId: body.badgeId,
        }
      });
      return { success: true, badge };
    } catch (err) {
      return { success: false, message: 'Badge already unlocked' };
    }
  }
}