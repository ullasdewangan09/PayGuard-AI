import React, { useEffect, useRef } from 'react';
import { Shield, Lock } from 'lucide-react';

export const SurrealRules: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('.reveal');
      reveals.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-4 md:px-12 bg-white overflow-hidden border-t border-gray-100">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-16 items-center">
        
        {/* Left Typography */}
        <div className="flex-1 space-y-8 reveal">
          <div className="font-mono text-xs text-blue-600 tracking-widest">
            [ 04 ] INTENT TRANSLATION
          </div>
          <h2 className="font-editorial text-5xl md:text-7xl font-extrabold uppercase text-gray-900 tracking-tighter leading-[0.9]">
            YOUR WORDS BECOME <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">PHYSICAL LAWS.</span>
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-lg leading-relaxed">
            PayGuard takes your plain English intent and crystallizes it into unbreakable mathematical constraints. The AI cannot negotiate with math.
          </p>
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 backdrop-blur-md relative overflow-hidden shadow-sm">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
             <p className="font-mono text-sm text-gray-700 leading-relaxed italic">
               "Allow the AI agent to buy me a developer laptop up to ₹80,000, but do not allow any recurring subscriptions or extended warranties."
             </p>
          </div>
        </div>

        {/* Right Visualizer: The Physical Constraints */}
        <div className="flex-1 w-full flex justify-center relative perspective-1000 reveal" style={{ transitionDelay: '0.2s' }}>
          
          <div className="relative w-full max-w-md h-[450px] transform-style-3d rotate-x-12 rotate-y-[-10deg]">
            
            {/* The Budget Ceiling */}
            <div className="absolute top-10 w-full h-32 rounded-xl backdrop-blur-xl bg-gradient-to-b from-blue-50/80 to-transparent border-t border-x border-blue-200 flex items-start justify-center pt-4 transform-style-preserve-3d translate-z-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
               <div className="font-mono text-xs font-bold text-blue-700 tracking-widest bg-white/80 border border-blue-100 px-3 py-1 rounded shadow-sm">MAX_BUDGET: 80000 INR</div>
            </div>

            {/* The Permitted Category Filter */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-dashed border-emerald-200 flex items-center justify-center translate-z-30 bg-white/40 backdrop-blur-sm shadow-[0_0_40px_rgba(16,185,129,0.05)]">
               <div className="absolute inset-0 bg-emerald-50/30 rounded-full animate-pulse" />
               <div className="flex flex-col items-center gap-2">
                 <Shield className="w-6 h-6 text-emerald-600" />
                 <div className="font-mono text-[10px] font-bold text-emerald-700 tracking-widest uppercase">CATEGORY_ALLOWLIST</div>
                 <div className="font-mono text-[9px] text-emerald-600/70">[ELECTRONICS_COMPUTERS]</div>
               </div>
            </div>

            {/* The Forbidden Blockers */}
            <div className="absolute bottom-10 left-4 w-40 h-24 rounded-lg bg-rose-50 border border-rose-100 flex flex-col items-center justify-center translate-z-40 shadow-sm">
               <Lock className="w-4 h-4 text-rose-600 mb-1" />
               <div className="font-mono text-[9px] font-bold text-rose-700 tracking-widest">FORBIDDEN_TERMS</div>
               <div className="font-mono text-[8px] text-rose-600/70 mt-1">"subscription", "recurring"</div>
            </div>

            <div className="absolute bottom-16 right-4 w-40 h-24 rounded-lg bg-rose-50 border border-rose-100 flex flex-col items-center justify-center translate-z-50 shadow-sm">
               <Lock className="w-4 h-4 text-rose-600 mb-1" />
               <div className="font-mono text-[9px] font-bold text-rose-700 tracking-widest">BANNED_CATEGORIES</div>
               <div className="font-mono text-[8px] text-rose-600/70 mt-1">[WARRANTY_EXTENSIONS]</div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
