export interface TrophyConfig {
  id: string;
  name: string;
  description: string;
  xp: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
}

export const TROPHIES: TrophyConfig[] = [
  {
    id: 'budget-master',
    name: 'Budget Master',
    description: 'Stay within your monthly budget for the first time.',
    xp: 200,
    rarity: 'Rare',
    icon: 'Target',
  },
  {
    id: 'saving-streak',
    name: 'Saving Streaks',
    description: 'Log activity for 7 consecutive days.',
    xp: 150,
    rarity: 'Common',
    icon: 'Flame',
  },
  {
    id: 'first-100-tx',
    name: 'First 100 Transactions',
    description: 'Log 100 total transactions in Finova.',
    xp: 500,
    rarity: 'Epic',
    icon: 'Award',
  },
  {
    id: 'expense-control',
    name: 'Expense Control',
    description: 'Have a week with zero unnecessary expenses.',
    xp: 300,
    rarity: 'Rare',
    icon: 'ShieldCheck',
  },
  {
    id: 'consistent-tracker',
    name: 'Consistent Tracker',
    description: 'Maintain a 30-day streak.',
    xp: 1000,
    rarity: 'Legendary',
    icon: 'Calendar',
  },
  {
    id: 'monthly-goal',
    name: 'Monthly Goal Completed',
    description: 'Successfully complete a saving goal ahead of time.',
    xp: 400,
    rarity: 'Epic',
    icon: 'TrendingUp',
  },
  {
    id: 'challenge-winner',
    name: 'Challenge Winners',
    description: 'Win your first weekly financial challenge.',
    xp: 250,
    rarity: 'Rare',
    icon: 'Trophy',
  },
  {
    id: 'early-adopter',
    name: 'Special Event Badges',
    description: 'Joined Finova during the beta launch phase.',
    xp: 100,
    rarity: 'Legendary',
    icon: 'Star',
  },
];
