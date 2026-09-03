import React from 'react';
import { motion } from 'framer-motion';

export const RogueAgentBreakdown: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[50]">
      <section className="sticky top-0 h-screen w-full flex items-center pt-32 bg-app-primary px-6 overflow-hidden origin-top shadow-2xl">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 relative z-10">
          
          {/* Left: The Headline */}
          <div className="flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase text-app-textPrimary leading-[0.9] tracking-tighter mb-12"
            >
              BUT AI CAN<br />
              <span className="text-[#FF3355]">GO OFF SCRIPT.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-md font-sans text-app-textPrimary leading-relaxed text-xl font-light mb-6"
            >
              AI agents optimize for task completion. Sometimes, that means adding a warranty, upselling a subscription, or overspending the budget to finish the job.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
              className="max-w-md font-sans text-app-textMuted leading-relaxed text-lg"
            >
              The transaction no longer fits the user's rules. The PayGuard Core recognizes the violation instantly.
            </motion.p>
          </div>

          {/* Right: The Rogue Proposal & Block */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-md p-10 relative overflow-hidden bg-app-card border border-[#FF3355]/20 rounded-sm shadow-2xl">
              
              <div className="relative z-10 text-app-textPrimary">
                <div className="flex justify-between items-start mb-12 border-b border-[#F2EFE9]/10 pb-6">
                  <div className="font-mono text-xs tracking-[0.2em] text-[#FF3355] uppercase font-bold">
                    Rogue Proposal
                  </div>
                  <div className="font-mono text-[9px] tracking-widest text-[#FF3355] border border-[#FF3355]/30 px-2 py-1 uppercase font-bold bg-[#FF3355]/10">
                    AI Transaction
                  </div>
                </div>

                <div className="space-y-6 mb-12 opacity-50">
                  <div className="flex items-end justify-between border-b border-[#F2EFE9]/5 pb-4">
                    <div className="font-mono text-[10px] text-app-textMuted tracking-widest mb-1">ITEM 1</div>
                    <div className="font-editorial text-xl text-app-textPrimary">Laptop: ₹75,000</div>
                  </div>
                </div>

                {/* The Violations */}
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex items-end justify-between border-b border-[#FF3355]/30 pb-4 relative"
                  >
                    <div className="font-mono text-[10px] text-[#FF3355] tracking-widest mb-1 font-bold">ITEM 2</div>
                    <div className="font-editorial text-2xl text-[#FF3355] font-bold tracking-tight">Warranty: ₹5,000</div>
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-full bg-[#FF3355]" />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="flex items-end justify-between border-b border-[#FF3355]/30 pb-4 relative"
                  >
                    <div className="font-mono text-[10px] text-[#FF3355] tracking-widest mb-1 font-bold">ITEM 3</div>
                    <div className="font-editorial text-2xl text-[#FF3355] font-bold tracking-tight">Subscription: ₹999 / MO</div>
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-full bg-[#FF3355]" />
                  </motion.div>
                </div>
                
                {/* The Block Result */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, type: "spring" }}
                  className="mt-12 bg-[#FF3355] text-[#121110] p-6 rounded-sm text-center"
                >
                  <div className="font-editorial text-3xl font-extrabold tracking-tight mb-4">BLOCKED</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase font-bold flex flex-col gap-1 opacity-80">
                    <span>MAXIMUM EXCEEDED</span>
                    <span>RECURRING PAYMENT DETECTED</span>
                    <span>BANNED CATEGORY DETECTED</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
