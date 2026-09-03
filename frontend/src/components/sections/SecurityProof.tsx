import React from 'react';
import { motion } from 'framer-motion';

export const SecurityProof: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[80]">
      <section id="security-proof" className="sticky top-0 h-screen w-full py-32 pt-40 px-6 flex flex-col justify-center bg-[#F2EFE9] text-[#121110] origin-top shadow-2xl">
        
        <div className="w-full max-w-6xl mx-auto relative z-10">
          
          <div className="text-center mb-32">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-editorial text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-4"
            >
              THEN WE TESTED IT<br />
              <span className="text-app-textMuted">AGAIN.</span>
            </motion.h2>
          </div>

          {/* The Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex flex-col items-center text-center border-t border-[#121110]/10 pt-8"
            >
              <div className="font-editorial text-6xl md:text-7xl font-bold text-[#121110] mb-4">
                106 <span className="text-app-textMuted text-4xl">/ 106</span>
              </div>
              <div className="font-mono text-[10px] text-app-textMuted tracking-widest uppercase font-bold">
                SCENARIOS PASSED
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center text-center border-t border-[#121110]/10 pt-8"
            >
              <div className="font-editorial text-6xl md:text-7xl font-bold text-app-red mb-4">
                0
              </div>
              <div className="font-mono text-[10px] text-app-textMuted tracking-widest uppercase font-bold">
                FALSE APPROVALS
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center text-center border-t border-[#121110]/10 pt-8"
            >
              <div className="font-editorial text-6xl md:text-7xl font-bold text-app-red mb-4">
                0
              </div>
              <div className="font-mono text-[10px] text-app-textMuted tracking-widest uppercase font-bold">
                FALSE BLOCKS
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col items-center text-center border-t border-[#121110]/10 pt-8 lg:col-start-1"
            >
              <div className="font-editorial text-6xl md:text-7xl font-bold text-app-red mb-4">
                0
              </div>
              <div className="font-mono text-[10px] text-app-textMuted tracking-widest uppercase font-bold">
                CRITICAL BYPASSES
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col items-center text-center border-t border-[#121110]/10 pt-8 lg:col-start-2 lg:col-span-2"
            >
              <div className="font-editorial text-6xl md:text-7xl font-bold text-[#121110] mb-4">
                100%
              </div>
              <div className="font-mono text-[10px] text-app-textMuted tracking-widest uppercase font-bold">
                DETERMINISTIC DECISIONS
              </div>
            </motion.div>

          </div>

        </div>
      </section>
    </div>
  );
};
