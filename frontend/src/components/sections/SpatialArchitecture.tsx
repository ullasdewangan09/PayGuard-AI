import React from 'react';
import { motion } from 'framer-motion';

const TECH_TERMS = [
  { term: 'Intent Contract', def: 'Defines what the user allows.' },
  { term: 'Transaction Contract', def: 'Defines what AI proposes.' },
  { term: 'Policy Engine', def: 'Checks the proposal against the rules.' },
  { term: 'Decision Engine', def: 'Produces the authorization decision.' },
  { term: 'Capture Gate', def: 'Stops unauthorized payment execution.' }
];

const PIPELINE = [
  'Natural Language',
  'AI Intent Extraction',
  'User Rules',
  'AI Transaction',
  'PayGuard',
  'Deterministic Policy',
  'APPROVE / ASK / BLOCK',
  'Razorpay Gate',
  'Payment'
];

export const SpatialArchitecture: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[90]">
      <section id="architecture" className="sticky top-0 h-screen w-full flex flex-col pt-32 justify-center bg-app-primary px-6 overflow-hidden origin-top shadow-2xl">
        
        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col h-full justify-center py-4">
          
          <div className="mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-editorial text-5xl md:text-7xl font-extrabold uppercase text-app-textPrimary leading-[0.9] tracking-tighter mb-4"
            >
              UNDER THE<br />
              <span className="text-app-textMuted">HOOD.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            
            {/* Left: The Pipeline */}
            <div className="lg:col-span-5 relative">
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#232220] via-[#F2EFE9]/20 to-[#232220]" />
              
              <div className="flex flex-col space-y-4 py-2">
                {PIPELINE.map((step, idx) => (
                  <motion.div 
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="relative pl-8 flex items-center"
                  >
                    <div className="absolute left-[-2px] w-[5px] h-[5px] rounded-full bg-[#A3A09A]" />
                    <div className="font-mono text-[10px] md:text-xs text-app-textMuted tracking-widest uppercase font-bold">
                      {step}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: The Definitions */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-6">
              {TECH_TERMS.map((item, idx) => (
                <motion.div
                  key={item.term}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.15, duration: 0.6 }}
                  className="border-b border-[#232220] pb-4 lg:pb-6"
                >
                  <div className="font-editorial text-2xl lg:text-3xl font-bold text-app-textPrimary mb-2">
                    {item.term}
                  </div>
                  <div className="font-sans text-app-textMuted text-base lg:text-lg">
                    {item.def}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
