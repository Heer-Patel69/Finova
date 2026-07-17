import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Connect Securely', desc: 'Link your bank or add your student allowance manually. We use bank-grade encryption to keep data safe.' },
  { num: '02', title: 'AI Analyzes Patterns', desc: 'Our AI looks at your spending, identifies recurring subscriptions, and categorizes everything instantly.' },
  { num: '03', title: 'Get Smart Advice', desc: 'Receive real-time notifications on how to save, when to skip a purchase, and how close you are to your goals.' }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 relative z-10 bg-black/20" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            From setup to savings in under 3 minutes.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-[#0F1123] border border-white/5 p-8 rounded-3xl relative z-10 text-center flex flex-col items-center hover:border-indigo-500/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl mb-6 shadow-[0_0_30px_rgba(108,92,231,0.3)]">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
