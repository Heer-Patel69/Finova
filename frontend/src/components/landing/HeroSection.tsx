import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Aurora */}
      <div className="aurora-bg">
        <div className="aurora-blob-1"></div>
        <div className="aurora-blob-2"></div>
        <div className="aurora-blob-3"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center mt-10 md:mt-0">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(162,155,254,0.3)] bg-[rgba(15,17,35,0.4)] backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-200">Meet the AI Financial OS</span>
        </motion.div>
        
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-center tracking-tight text-white mb-6 leading-tight landing-text-glow"
        >
          Money, managed <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">intelligently.</span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-10"
        >
          Stop tracking expenses. Start building wealth. Finova combines AI coaching, smart analytics, and automated splitting into one beautiful operating system.
        </motion.p>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link href="/app" className="btn-primary px-8 py-4 rounded-full text-lg flex items-center gap-2 group">
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-sm text-gray-500">No credit card required</span>
        </motion.div>
        
        {/* Interactive Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl -z-10 rounded-full" />
          <div className="glass-panel rounded-2xl md:rounded-[32px] p-2 md:p-4 shadow-2xl border border-indigo-500/20">
            <div className="bg-[#0F1123] rounded-xl md:rounded-[24px] overflow-hidden border border-white/5 shadow-inner relative flex flex-col h-[500px] md:h-[700px] w-full">
              
              {/* Mockup Top Bar */}
              <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-sm text-gray-400 font-medium">finova.app</div>
                <div className="w-16" />
              </div>
              
              {/* Mockup Content */}
              <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                {/* Left Side: Balance & Chart */}
                <div className="flex-1 flex flex-col gap-6">
                  <div>
                    <h3 className="text-gray-400 font-medium mb-2">Total Balance</h3>
                    <div className="text-5xl font-bold text-white tracking-tight">$4,250.00</div>
                  </div>
                  
                  {/* Mock Chart Area */}
                  <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 p-6 flex flex-col justify-end relative">
                    <div className="absolute top-6 left-6 text-sm text-green-400 flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-md">
                      +12% this month
                    </div>
                    {/* Simulated chart bars */}
                    <div className="flex items-end justify-between h-40 gap-2">
                      {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                          className="w-full bg-indigo-500/40 hover:bg-indigo-500/60 transition-colors rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Side: AI Coach & Transactions */}
                <div className="w-full md:w-80 flex flex-col gap-6">
                  {/* AI Coach Popover */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-md relative"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-white">AI Coach</span>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                      You're spending 20% less on food this week! Great job. If you keep this up, you'll reach your MacBook savings goal 2 weeks early.
                    </p>
                  </motion.div>
                  
                  {/* Recent Transactions */}
                  <div className="flex-1 rounded-2xl bg-white/5 border border-white/5 p-5 flex flex-col">
                    <h4 className="text-white font-medium mb-4">Recent</h4>
                    <div className="flex flex-col gap-4">
                      {[
                        { name: "Netflix", amount: "-$15.99", icon: "🎬", color: "bg-red-500/20 text-red-400" },
                        { name: "Coffee", amount: "-$4.50", icon: "☕", color: "bg-orange-500/20 text-orange-400" },
                        { name: "Venmo (Roommate)", amount: "+$45.00", icon: "💸", color: "bg-green-500/20 text-green-400" }
                      ].map((t, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 1.8 + i * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.color}`}>
                              {t.icon}
                            </div>
                            <span className="text-gray-300 text-sm font-medium">{t.name}</span>
                          </div>
                          <span className="text-white font-medium">{t.amount}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
