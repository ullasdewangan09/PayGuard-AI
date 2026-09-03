import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const PolicyPlayground: React.FC = () => {
  const [amount, setAmount] = useState<number>(75000);
  const [category, setCategory] = useState<string>('Laptop');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  // Deterministic checks against Intent Contract
  const maxAmount = 80000;
  const isAmountValid = amount <= maxAmount;
  const isCategoryValid = category.toLowerCase() === 'laptop';
  const isRecurringValid = !isRecurring;

  const isApproved = isAmountValid && isCategoryValid && isRecurringValid;

  return (
    <div className="h-[150vh] relative w-full z-[60]">
      <section id="interactive-demo" className="sticky top-0 h-screen w-full py-32 pt-40 px-6 flex flex-col items-center justify-center bg-[#F2EFE9] text-[#121110] origin-top shadow-2xl">
        
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center pointer-events-auto relative z-10">
          
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-editorial text-5xl md:text-7xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-8">
                TEST THE<br />
                <span className="text-app-textMuted">BOUNDARY.</span>
              </h2>
              <p className="font-sans text-app-textMuted max-w-md mx-auto text-lg">
                Adjust the transaction parameters. Watch the PayGuard Core react deterministically.
              </p>
            </motion.div>
          </div>

          {/* The Control Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-2xl bg-[#FFFFFF] p-8 md:p-12 relative overflow-hidden shadow-xl border border-[#121110]/10 rounded-sm"
          >
            <div className="flex flex-col md:flex-row gap-12">
              
              {/* Left: Inputs */}
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between font-mono text-[10px] text-app-textMuted tracking-widest font-bold uppercase">
                    <span>Amount (₹)</span>
                    <span className={!isAmountValid ? 'text-[#FF3355]' : 'text-app-red'}>{amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="100000" 
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-1 bg-[#F2EFE9] rounded-none appearance-none cursor-pointer accent-[#121110]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-app-textMuted tracking-widest font-bold uppercase">
                    Category
                  </div>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#F2EFE9] text-[#121110] font-mono text-sm px-4 py-3 rounded-none outline-none focus:border-[#FF2A4D] transition-colors"
                  >
                    <option value="Laptop">Laptop (Allowed)</option>
                    <option value="Warranty">Warranty (Banned)</option>
                    <option value="Giftcard">Giftcard (Banned)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="font-mono text-[10px] text-app-textMuted tracking-widest font-bold uppercase">
                    Payment Type
                  </div>
                  <button 
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-full font-mono text-sm px-4 py-3 border transition-colors ${isRecurring ? 'bg-[#FF3355]/10 border-[#FF3355] text-[#FF3355]' : 'bg-[#FFFFFF] border-[#F2EFE9] text-[#121110]'}`}
                  >
                    {isRecurring ? 'RECURRING (VIOLATION)' : 'ONE-TIME'}
                  </button>
                </div>
              </div>

              {/* Right: The Output */}
              <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#F2EFE9]/30 border border-[#F2EFE9]">
                <div className="font-mono text-[10px] text-app-textMuted tracking-widest font-bold uppercase mb-8">
                  Evaluation Result
                </div>
                
                {isApproved ? (
                  <motion.div 
                    key="approve"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto border-4 border-[#FF2A4D] rounded-full flex items-center justify-center mb-6">
                      <div className="w-8 h-8 bg-app-red rounded-full" />
                    </div>
                    <div className="font-editorial text-4xl text-app-red font-bold">APPROVE</div>
                    <div className="font-mono text-[10px] text-app-red/60 tracking-widest mt-4 font-bold">100% COMPLIANT</div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="block"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto border-4 border-[#FF3355] rounded-full flex items-center justify-center mb-6 relative">
                      <div className="absolute w-1 h-12 bg-[#FF3355] rotate-45" />
                      <div className="absolute w-1 h-12 bg-[#FF3355] -rotate-45" />
                    </div>
                    <div className="font-editorial text-4xl text-[#FF3355] font-bold">BLOCK</div>
                    <div className="font-mono text-[10px] text-[#FF3355]/60 tracking-widest mt-4 flex flex-col gap-1 font-bold">
                      {!isAmountValid && <span>MAX AMOUNT EXCEEDED</span>}
                      {!isCategoryValid && <span>BANNED CATEGORY</span>}
                      {!isRecurringValid && <span>RECURRING PAYMENT</span>}
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
