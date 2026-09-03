import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="h-[200vh] relative w-full z-[10]">
      <section id="hero" className="sticky top-0 h-screen w-full flex items-center justify-center px-6 overflow-hidden bg-app-primary origin-top">
        
        {/* Background Video (Only in Hero) */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover filter saturate-150 contrast-110 opacity-70"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/15185251.mp4" type="video/mp4" />
          </video>
          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#121110]/90" />
        </div>

        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative z-10 pt-10">
          
          {/* Microcopy Top */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center justify-center gap-6 mb-16 text-xs font-mono tracking-[0.2em] text-app-textMuted uppercase"
          >
            <span>PAYGUARD AI</span>
            <span className="w-1 h-1 rounded-full bg-app-red" />
            <span>AI PAYMENT AUTHORIZATION</span>
            <span className="w-1 h-1 rounded-full bg-app-red" />
            <span>BUILD 01</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-editorial font-extrabold uppercase leading-[1.1] tracking-tight text-app-textPrimary mb-8 mix-blend-difference text-4xl md:text-6xl lg:text-7xl max-w-5xl">
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block mb-2"
            >
              LET AI ACT.
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F2EFE9] via-[#A3A09A] to-[#6B6965]"
            >
              NOT OVERRIDE.
            </motion.span>
          </h1>

          {/* Supporting Copy */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl text-lg md:text-xl lg:text-2xl font-sans font-light leading-relaxed text-app-textMuted mb-12"
          >
            Give AI the freedom to buy, book and pay — without giving it unlimited access to your money.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link
              to="/app"
              className="relative inline-flex items-center justify-between px-2 py-2 pl-8 rounded-full bg-app-borderMedium hover:bg-white/20 border border-app-borderStrong backdrop-blur-2xl transition-all duration-300 text-app-textPrimary font-sans text-lg tracking-wide shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden group gap-6"
              style={{
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 30px rgba(0,0,0,0.1)',
              }}
            >
              <span className="relative z-10 font-bold tracking-wider font-mono text-base uppercase">Enter Dashboard</span>
              
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:scale-95 transition-all duration-300 relative overflow-hidden shadow-md">
                 <ArrowRight className="w-5 h-5 text-[#121110] group-hover:translate-x-[2px] transition-transform duration-300 z-10 relative" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-app-textPrimary/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-app-textMuted font-mono text-[10px] tracking-widest uppercase z-10"
        >
          <motion.div 
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-16 bg-[#F2EFE9] origin-top"
          />
          <span>SCROLL TO EXPLORE</span>
        </motion.div>
      </section>
    </div>
  );
};
