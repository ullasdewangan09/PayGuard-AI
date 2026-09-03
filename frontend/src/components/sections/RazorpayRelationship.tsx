import React from 'react';
import { motion } from 'framer-motion';

export const RazorpayRelationship: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[100]">
      <section id="razorpay" className="sticky top-0 h-screen w-full flex items-center bg-[#F2EFE9] text-[#121110] px-6 overflow-hidden origin-top shadow-2xl">
        
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 relative z-10">
          
          {/* Left: The Headline */}
          <div className="flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-12"
            >
              PAYGUARD<br />
              <span className="text-app-textMuted">DECIDES.</span><br />
              RAZORPAY<br />
              <span className="text-[#2563EB]">EXECUTES.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-md font-sans text-app-textMuted leading-relaxed text-xl font-light mb-6"
            >
              Two systems. A hard boundary. PayGuard controls whether the AI is authorized to make the payment. Razorpay handles the payment execution.
            </motion.p>
          </div>

          {/* Right: The Handoff */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* PayGuard Block */}
            <div className="p-10 border border-[#121110]/10 bg-[#FFFFFF] shadow-xl">
              <div className="font-editorial text-3xl font-bold mb-2">PayGuard</div>
              <div className="font-mono text-[10px] tracking-widest text-app-textMuted uppercase mb-8 font-bold">
                Authorization Layer
              </div>
              <div className="font-sans text-app-textMuted">
                Generates the deterministic DECISION based on user rules.
              </div>
            </div>

            {/* Connection Line */}
            <div className="w-px h-16 bg-gradient-to-b from-[#121110]/20 to-[#2563EB]/50 mx-auto relative">
               <motion.div 
                 animate={{ y: [0, 64] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-[-2px] w-[5px] h-[5px] rounded-full bg-[#2563EB]"
               />
            </div>

            {/* Razorpay Block */}
            <div className="p-10 border border-[#2563EB]/20 bg-[#2563EB]/5 shadow-xl">
              <div className="font-editorial text-3xl font-bold text-[#2563EB] mb-2">Razorpay</div>
              <div className="font-mono text-[10px] tracking-widest text-[#2563EB] uppercase mb-8 font-bold">
                Payment Layer
              </div>
              <div className="font-sans text-app-textMuted">
                Only invoked if the Capture Gate receives a valid APPROVE token. Processes the actual transaction.
              </div>
            </div>
            
            <div className="text-center font-mono text-[9px] text-app-textMuted tracking-widest uppercase mt-4 font-bold">
              PayGuard is an independent authorization layer. Not an official Razorpay product.
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};
