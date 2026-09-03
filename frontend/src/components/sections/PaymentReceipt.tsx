import React from 'react';
import { motion } from 'framer-motion';

export const PaymentReceipt: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[110]">
      <section className="sticky top-0 h-screen w-full flex items-center pt-32 justify-center bg-app-primary px-6 overflow-hidden origin-top shadow-2xl">
        
        <div className="w-full max-w-5xl mx-auto text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            <h2 className="font-editorial text-5xl md:text-7xl font-extrabold uppercase text-app-textPrimary leading-[0.9] tracking-tighter">
              PAYMENT<br />
              <span className="text-app-red">CAPTURED.</span>
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-md mx-auto bg-app-card p-10 relative overflow-hidden text-left border border-[#F2EFE9]/10 shadow-2xl rounded-sm"
          >
            <div className="flex justify-between items-start mb-12 border-b border-[#F2EFE9]/10 pb-6">
              <div className="font-mono text-xs tracking-[0.2em] text-app-red uppercase font-bold">
                Final Receipt
              </div>
              <div className="font-mono text-[9px] tracking-widest text-app-red border border-[#FF2A4D]/30 px-2 py-1 uppercase font-bold bg-app-red/10">
                Verified
              </div>
            </div>

            <div className="font-editorial text-5xl text-app-textPrimary font-bold mb-8">
              ₹75,000
            </div>

            <div className="space-y-6 mb-12 font-mono text-[10px] text-app-textMuted tracking-widest">
              <div className="flex justify-between border-b border-[#F2EFE9]/5 pb-4">
                <span>ORDER</span>
                <span className="text-app-textPrimary">PG-8924A1</span>
              </div>
              <div className="flex justify-between border-b border-[#F2EFE9]/5 pb-4">
                <span>PAYMENT</span>
                <span className="text-app-textPrimary">pay_Mx194ZlaQ</span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs text-app-textMuted tracking-widest font-bold">
              <div className="flex items-center gap-3">
                <span className="text-app-red">✓</span>
                <span>RECEIPT GENERATED</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-app-red">✓</span>
                <span>EMAIL SENT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-app-red">✓</span>
                <span>SMS SENT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-app-red">✓</span>
                <span>WHATSAPP SENT</span>
              </div>
            </div>

          </motion.div>

        </div>
      </section>
    </div>
  );
};
