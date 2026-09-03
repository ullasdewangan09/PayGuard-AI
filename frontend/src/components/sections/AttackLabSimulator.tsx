import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ATTACKS = [
  { id: 'budget', name: 'BUDGET BYPASS', type: 'payload manipulation' },
  { id: 'hidden', name: 'HIDDEN COST', type: 'cart stuffing' },
  { id: 'recurring', name: 'RECURRING PAYMENT', type: 'subscription trap' },
  { id: 'injection', name: 'POLICY INJECTION', type: 'prompt engineering' },
  { id: 'currency', name: 'CURRENCY MANIPULATION', type: 'fx spoofing' }
];

export const AttackLabSimulator: React.FC = () => {
  const [activeAttack, setActiveAttack] = useState(0);

  return (
    <div className="h-[200vh] relative w-full z-[70]">
      <section id="attack-lab" className="sticky top-0 h-screen w-full flex items-center bg-app-primary px-6 overflow-hidden origin-top shadow-2xl">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          
          {/* Headline */}
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-editorial text-5xl md:text-7xl font-extrabold uppercase text-app-textPrimary leading-[0.9] tracking-tighter mb-4"
            >
              WE TRIED TO<br />
              <span className="text-[#FF3355]">BREAK IT.</span>
            </motion.h2>
          </div>

          {/* The Lab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            
            {/* Left: The Attacks */}
            <div className="flex flex-col justify-center space-y-4">
              {ATTACKS.map((attack, idx) => (
                <button
                  key={attack.id}
                  onClick={() => setActiveAttack(idx)}
                  className={`text-left p-6 border transition-all duration-300 ${
                    activeAttack === idx 
                      ? 'border-[#FF3355] bg-[#FF3355]/5 ml-4' 
                      : 'border-[#232220] bg-transparent hover:border-[#6B6965]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-editorial text-2xl font-bold ${activeAttack === idx ? 'text-app-textPrimary' : 'text-app-textMuted'}`}>
                      {attack.name}
                    </span>
                    {activeAttack === idx && (
                      <span className="font-mono text-[10px] text-[#FF3355] tracking-widest bg-[#FF3355]/10 px-2 py-1">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className={`font-mono text-xs mt-2 ${activeAttack === idx ? 'text-[#FF3355]/70' : 'text-app-textMuted/50'}`}>
                    {attack.type}
                  </div>
                </button>
              ))}
            </div>

            {/* Right: The Block Impact */}
            <div className="flex flex-col justify-center items-center">
              <div className="w-full max-w-sm aspect-square relative flex items-center justify-center">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAttack}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex flex-col items-center justify-center border border-[#FF3355]/20 bg-app-card"
                  >
                    <div className="font-mono text-xs text-[#FF3355] tracking-[0.2em] mb-8 font-bold">
                      ATTACK SIGNATURE
                    </div>
                    <div className="font-editorial text-3xl text-app-textPrimary text-center px-8 mb-12">
                      {ATTACKS[activeAttack].name}
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#FF3355] blur-xl opacity-20" />
                      <div className="relative font-editorial text-5xl font-extrabold text-[#FF3355] tracking-tight border-2 border-[#FF3355] px-8 py-2">
                        BLOCKED
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>

              {/* The Numbers Reveal */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-16 w-full flex justify-between border-t border-[#232220] pt-8"
              >
                <div>
                  <div className="font-editorial text-4xl font-bold text-app-textPrimary">12 <span className="text-app-textMuted">/ 12</span></div>
                  <div className="font-mono text-[10px] text-app-textMuted tracking-widest mt-2 font-bold">ATTACKS BLOCKED</div>
                </div>
                <div className="text-right">
                  <div className="font-editorial text-4xl font-bold text-app-red">0</div>
                  <div className="font-mono text-[10px] text-app-textMuted tracking-widest mt-2 font-bold">CRITICAL BYPASSES</div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
