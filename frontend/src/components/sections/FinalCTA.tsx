import React from 'react';
import { motion } from 'framer-motion';

export const FinalCTA: React.FC = () => {
  return (
    <footer className="relative min-h-screen w-full flex flex-col items-center justify-center bg-app-primary px-6 overflow-hidden origin-top shadow-2xl z-[120] border-t border-[#F2EFE9]/10">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center flex-grow justify-center">
        
        {/* Main CTA */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="font-mono text-xs text-app-textMuted tracking-[0.2em] uppercase mb-12 font-bold">
              PAYGUARD AI
            </div>
            
            <h2 className="font-editorial text-6xl md:text-8xl lg:text-[10rem] font-extrabold uppercase text-app-textPrimary leading-[0.85] tracking-tighter mix-blend-difference mb-16">
              <span className="block mb-2">LET AI ACT.</span>
              <span className="block text-app-textMuted">NOT OVERRIDE.</span>
            </h2>

            <a
              href="#hero"
              className="inline-block px-12 py-5 bg-[#F2EFE9] text-[#121110] font-mono font-bold text-sm tracking-wider hover:bg-[#A3A09A] transition-colors rounded-sm"
            >
              EXPLORE PAYGUARD
            </a>
          </motion.div>
        </div>

      </div>

      {/* Footer Links */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-t border-[#F2EFE9]/10 pt-8 pb-8 font-mono text-[10px] text-app-textMuted tracking-widest uppercase gap-8 font-bold">
        
        <div className="flex items-center gap-2">
          <span>© 2026 PAYGUARD AI</span>
          <span className="w-1 h-1 bg-[#6B6965] rounded-full mx-2" />
          <span>BUILD 01</span>
        </div>

        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-app-textPrimary transition-colors">Documentation</a>
          <a href="https://github.com/ullasdewangan09/PayGuard-AI" target="_blank" rel="noreferrer" className="hover:text-app-textPrimary transition-colors">GitHub</a>
          <a href="#security-proof" className="hover:text-app-textPrimary transition-colors">Security</a>
          <a href="#" className="hover:text-app-textPrimary transition-colors">Privacy</a>
        </div>

      </div>
    </footer>
  );
};
