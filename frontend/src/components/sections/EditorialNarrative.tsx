import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const EditorialNarrative: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const leftX = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <div ref={containerRef} className="h-[200vh] relative w-full z-[20]">
      <section className="sticky top-0 h-screen w-full flex items-center pt-32 bg-[#F2EFE9] text-[#121110] px-6 overflow-hidden origin-top shadow-2xl">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
          
          {/* Left: The Story (Slides from Left) */}
          <motion.div 
            style={{ x: leftX, opacity }}
            className="flex flex-col justify-center"
          >
            <h2 className="font-editorial text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-12">
              IT STARTS<br />
              <span className="text-app-textMuted">WITH A RULE.</span>
            </h2>
            
            <div className="space-y-6 font-editorial text-2xl md:text-4xl text-app-textMuted leading-tight">
              <p className="text-[#121110]">"Buy me a laptop under ₹80,000.</p>
              <p>No warranty.</p>
              <p>No subscription."</p>
            </div>
            
            <p className="mt-12 max-w-md font-sans text-app-textMuted leading-relaxed text-lg">
              You give your AI an instruction. In standard systems, the AI has direct access to your card. In PayGuard, your instruction becomes an immutable physical specification.
            </p>
          </motion.div>

          {/* Right: The Physical Specification (Slides from Right) */}
          <motion.div 
            style={{ x: rightX, opacity }}
            className="flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-md p-10 relative overflow-hidden bg-[#FFFFFF] shadow-2xl border border-[#121110]/5">
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12 border-b border-[#121110]/10 pb-6">
                  <div className="font-mono text-xs tracking-[0.2em] text-app-textMuted uppercase font-bold">
                    Specification
                  </div>
                  <div className="font-mono text-[9px] tracking-widest text-app-textMuted border border-[#6B6965]/30 px-2 py-1 uppercase bg-app-primary/5">
                    Intent Contract
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-end justify-between border-b border-[#121110]/5 pb-4">
                    <div className="font-mono text-[10px] text-app-textMuted tracking-widest mb-1 font-bold">MAXIMUM</div>
                    <div className="font-editorial text-4xl text-[#121110] font-bold">₹80,000</div>
                  </div>

                  <div className="flex items-end justify-between border-b border-[#121110]/5 pb-4">
                    <div className="font-mono text-[10px] text-app-textMuted tracking-widest mb-1 font-bold">RECURRING</div>
                    <div className="font-editorial text-2xl text-[#FF3355] font-bold tracking-tight">OFF</div>
                  </div>

                  <div className="flex items-end justify-between border-b border-[#121110]/5 pb-4">
                    <div className="font-mono text-[10px] text-app-textMuted tracking-widest mb-1 font-bold">CATEGORY</div>
                    <div className="font-editorial text-2xl text-[#121110] font-bold tracking-tight uppercase">Laptop</div>
                  </div>
                </div>
                
                <div className="mt-12 flex items-center justify-between opacity-50">
                  <div className="font-mono text-[8px] text-app-textMuted tracking-widest font-bold">UID: 8F92-A1B3</div>
                  <div className="w-2 h-2 rounded-full bg-app-red animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
