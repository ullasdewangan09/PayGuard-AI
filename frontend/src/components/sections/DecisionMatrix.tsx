import React from 'react';
import { motion } from 'framer-motion';

export const DecisionMatrix: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[40]">
      <section className="sticky top-0 h-screen w-full py-10 px-6 flex flex-col items-center justify-center bg-[#F2EFE9] text-[#121110] origin-top shadow-2xl">
        
        {/* Top: PAYGUARD CHECKS */}
        <div className="w-full max-w-5xl mx-auto mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-8"
          >
            PAYGUARD<br />
            <span className="text-app-red">CHECKS.</span>
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-mono text-sm md:text-base font-bold text-app-textMuted tracking-[0.2em] uppercase">
            {['Amount', 'Currency', 'Category', 'Recurring', 'Merchant'].map((check, i) => (
              <motion.div 
                key={check}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1, color: '#FF2A4D' }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                className="flex items-center gap-2"
              >
                <span>{check}</span>
                <span className="text-app-red">✓</span>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 1.0, type: "spring" }}
            className="mt-8 inline-block font-editorial text-4xl md:text-5xl text-app-red font-bold tracking-tight border-2 border-[#FF2A4D] px-12 py-4 rounded-sm"
          >
            APPROVED
          </motion.div>
        </div>

        {/* Bottom: The Three Outcomes */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          
          {/* APPROVE */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="p-10 border border-[#121110]/10 bg-[#FFFFFF] group hover:border-[#FF2A4D]/50 transition-colors rounded-sm shadow-xl"
          >
            <div className="font-editorial text-3xl font-bold mb-4">APPROVE</div>
            <div className="font-sans text-app-textMuted text-lg mb-12">Safe to go.</div>
            <div className="font-mono text-[10px] text-app-red tracking-widest uppercase mt-auto font-bold">
              STATE: OPEN
            </div>
          </motion.div>

          {/* ASK */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-10 border border-[#121110]/10 bg-[#FFFFFF] group hover:border-[#FF5500]/50 transition-colors rounded-sm shadow-xl"
          >
            <div className="font-editorial text-3xl font-bold mb-4">ASK</div>
            <div className="font-sans text-app-textMuted text-lg mb-12">Needs your approval.</div>
            <div className="font-mono text-[10px] text-[#FF5500] tracking-widest uppercase mt-auto font-bold">
              STATE: PAUSED
            </div>
          </motion.div>

          {/* BLOCK */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-10 border border-[#121110]/10 bg-[#FFFFFF] group hover:border-[#FF3355]/50 transition-colors rounded-sm shadow-xl"
          >
            <div className="font-editorial text-3xl font-bold mb-4">BLOCK</div>
            <div className="font-sans text-app-textMuted text-lg mb-12">Doesn't match your rules.</div>
            <div className="font-mono text-[10px] text-[#FF3355] tracking-widest uppercase mt-auto font-bold">
              STATE: CLOSED
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
