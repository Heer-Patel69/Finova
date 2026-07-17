import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GitHubCalendarProps {
  activities: { date: string; completed: boolean; xpEarned: number }[];
}

export default function GitHubCalendar({ activities }: GitHubCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Create a map for fast lookup of activity by local date string 'YYYY-MM-DD'
  const activityMap = new Map();
  activities.forEach(a => {
    const d = new Date(a.date);
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    activityMap.set(dateKey, a);
  });

  const squares = [];
  
  // Fill empty squares for the first week
  for (let i = 0; i < firstDay; i++) {
    squares.push(<div key={`empty-${i}`} className="w-4 h-4 rounded-sm bg-transparent"></div>);
  }

  let completedDaysThisMonth = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const activity = activityMap.get(dateKey);
    
    let colorClass = 'bg-[#2A2B3D] border border-white/5'; // Default inactive
    
    if (activity && activity.completed) {
        completedDaysThisMonth++;
        // Intensity based on XP earned
        if (activity.xpEarned >= 100) colorClass = 'bg-indigo-400 border border-indigo-400';
        else if (activity.xpEarned >= 50) colorClass = 'bg-indigo-500 border border-indigo-500';
        else if (activity.xpEarned >= 20) colorClass = 'bg-indigo-600 border border-indigo-600';
        else colorClass = 'bg-indigo-900 border border-indigo-900';
    }

    squares.push(
      <div 
        key={d} 
        title={`${monthNames[month]} ${d}, ${year}${activity ? ` - ${activity.xpEarned} XP` : ''}`}
        className={`w-4 h-4 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
      />
    );
  }

  const completionPercentage = Math.round((completedDaysThisMonth / daysInMonth) * 100);

  return (
    <div className="bg-[#1C1D2C] border border-white/5 rounded-2xl p-6 mb-8 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-xl font-bold text-white">{monthNames[month]} {year}</h3>
            <p className="text-sm text-gray-400">{completionPercentage}% Completion Rate this month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-4">
          <div className="flex flex-col gap-[7px] text-xs text-gray-500 pt-1 pr-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
          </div>
          
          <div className="grid grid-flow-col grid-rows-7 gap-2">
            {squares}
          </div>
      </div>

      <div className="flex items-center gap-2 mt-6 text-xs text-gray-400 justify-end">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[#2A2B3D]"></div>
          <div className="w-3 h-3 rounded-sm bg-indigo-900"></div>
          <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
          <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
          <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
          <span>More</span>
      </div>
    </div>
  );
}
