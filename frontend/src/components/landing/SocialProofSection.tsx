import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Transactions Processed', value: '$10M+' },
  { label: 'Active Students', value: '50k+' },
  { label: 'Average Monthly Savings', value: '$250' },
  { label: 'Universities Supported', value: '1,200+' }
];

export default function SocialProofSection() {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col gap-2"
            >
              <div className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
