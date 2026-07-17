import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="py-24 relative z-10 bg-black/40 border-y border-white/5" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Expense trackers are dead.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Looking at a pie chart of your past spending doesn't change your future habits. You need intelligence, not just data.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10"
          >
            <h3 className="text-xl font-bold text-gray-300 mb-6 flex items-center gap-3">
              <span className="text-red-400">Old Apps</span>
            </h3>
            <ul className="flex flex-col gap-4">
              {[
                "Dumb pie charts that tell you what you already know",
                "Manual entry that feels like a part-time job",
                "No actionable advice on how to improve",
                "Awkward Venmo requests to split bills",
                "Boring and feels like a chore"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <XCircle className="w-5 h-5 text-red-400/70 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* New Way */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Finova OS</span>
            </h3>
            <ul className="flex flex-col gap-4 relative z-10">
              {[
                "AI Coach that predicts and guides your spending",
                "Smart insights that actually help you save",
                "Built-in, automated bill splitting with friends",
                "Gamified habits, XP, and streaks",
                "Beautiful interface you actually want to use"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-200">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
