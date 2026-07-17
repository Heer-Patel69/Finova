import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Trophy } from 'lucide-react';

const features = [
  {
    title: "Your Personal AI Financial Coach",
    description: "Our AI doesn't just track. It analyzes your spending patterns, identifies subscriptions you don't use, and suggests ways to save for your goals faster.",
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    mockup: (
      <div className="w-full h-full bg-[#0F1123] rounded-2xl border border-white/10 p-6 flex flex-col justify-end gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="self-end bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
          Should I buy this $4.50 coffee?
        </div>
        <div className="self-start bg-white/5 border border-white/10 text-gray-300 p-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
          You've spent $35 on coffee this week already. If you skip this, you'll stay under your $40 budget!
        </div>
      </div>
    )
  },
  {
    title: "Split Expenses Without the Awkwardness",
    description: "Built-in roommate and group splitting. Finova automatically calculates who owes who and simplifies debts so you make one single transfer instead of five.",
    icon: <Users className="w-6 h-6 text-cyan-400" />,
    reversed: true,
    mockup: (
      <div className="w-full h-full bg-[#0F1123] rounded-2xl border border-white/10 p-6 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute bottom-0 left-0 p-32 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">J</div>
              <div>
                <div className="text-white text-sm font-medium">Javi owes you</div>
                <div className="text-xs text-gray-400">For Utilities</div>
              </div>
            </div>
            <div className="text-green-400 font-bold">+$45.00</div>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">A</div>
              <div>
                <div className="text-white text-sm font-medium">You owe Alex</div>
                <div className="text-xs text-gray-400">For Groceries</div>
              </div>
            </div>
            <div className="text-red-400 font-bold">-$12.50</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Gamified Habits & Streaks",
    description: "Finance should be fun. Earn XP for staying under budget, level up your profile, and maintain daily streaks by checking your finances.",
    icon: <Trophy className="w-6 h-6 text-orange-400" />,
    mockup: (
      <div className="w-full h-full bg-[#0F1123] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-32 bg-orange-500/20 blur-3xl rounded-full" />
        <div className="w-32 h-32 rounded-full border-4 border-orange-500/30 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-l-transparent border-b-transparent transform rotate-45" />
          <span className="text-3xl text-white font-bold">Lvl 5</span>
          <span className="text-xs text-orange-400 font-medium">2400 XP</span>
        </div>
        <div className="mt-8 flex gap-2">
          {[1,2,3,4,5,6,7].map(day => (
            <div key={day} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day <= 4 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
              {['M','T','W','T','F','S','S'][day-1]}
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function FeatureShowcase() {
  return (
    <section className="py-24 relative z-10" id="features">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-32">
        {features.map((feature, idx) => (
          <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${feature.reversed ? 'md:flex-row-reverse' : ''}`}>
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: feature.reversed ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 leading-tight">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
            
            {/* Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full h-[400px] glass-panel rounded-[32px] p-2"
            >
              {feature.mockup}
            </motion.div>
            
          </div>
        ))}
      </div>
    </section>
  );
}
