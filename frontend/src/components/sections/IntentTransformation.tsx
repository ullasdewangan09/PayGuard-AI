import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, Code, CheckCircle, RefreshCw, Cpu, Database } from 'lucide-react';

interface PromptPreset {
  id: string;
  label: string;
  rawText: string;
  intentData: {
    currency: string;
    max_total_amount: number;
    banned_categories: string[];
    allowed_categories: string[];
    max_quantity: number;
    recurring_payment_allowed: boolean;
  };
}

const PRESETS: PromptPreset[] = [
  {
    id: 'laptop-strict',
    label: 'Developer Laptop (No Warranty / No Sub)',
    rawText: 'Buy me a programming laptop under ₹80,000. No extended warranty and no subscription.',
    intentData: {
      currency: 'INR',
      max_total_amount: 80000.0,
      banned_categories: ['warranty', 'extended_warranty'],
      allowed_categories: ['electronics', 'computers'],
      max_quantity: 1,
      recurring_payment_allowed: false
    }
  },
  {
    id: 'office-supplies',
    label: 'Office Ergonomics (Budget Cap)',
    rawText: 'Order 2 ergonomic chairs for the studio under ₹25,000 total. Single charge only.',
    intentData: {
      currency: 'INR',
      max_total_amount: 25000.0,
      banned_categories: ['games', 'services'],
      allowed_categories: ['furniture', 'office'],
      max_quantity: 2,
      recurring_payment_allowed: false
    }
  },
  {
    id: 'cloud-server',
    label: 'Server Compute Tier (Recurring Allowed)',
    rawText: 'Setup staging VPS cluster in Mumbai region up to ₹12,000. Monthly billing permitted.',
    intentData: {
      currency: 'INR',
      max_total_amount: 12000.0,
      banned_categories: ['crypto', 'gaming'],
      allowed_categories: ['cloud', 'infrastructure'],
      max_quantity: 5,
      recurring_payment_allowed: true
    }
  }
];

export const IntentTransformation: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PromptPreset>(PRESETS[0]);
  const [isTransforming, setIsTransforming] = useState(false);

  const handleSelectPreset = (preset: PromptPreset) => {
    setIsTransforming(true);
    setSelectedPreset(preset);
    setTimeout(() => {
      setIsTransforming(false);
    }, 400);
  };

  return (
    <section id="intent" className="relative py-28 px-4 md:px-8 overflow-hidden" style={{ background: '#090b10', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2A2928] pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,240,255,0.5)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>07 // UNDER THE HOOD — HOW YOUR RULES ARE STORED</span>
            </div>
            <h2 className="font-editorial font-extrabold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: '#F4F6FC', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              YOUR WORDS<br /><span style={{ color: 'rgba(0,240,255,0.8)' }}>BECOME UNBREAKABLE RULES.</span>
            </h2>
            <p className="font-sans text-base mt-3" style={{ color: '#6a7888', maxWidth: 480 }}>
              When you give AI a task, PayGuard captures your exact rules before any money moves.
              <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>INTENT CONTRACT</span>
            </p>
          </div>
        </div>

        {/* Prompt Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 border ${
                selectedPreset.id === preset.id
                  ? 'bg-[#00E599]/20 text-[#00E599] font-semibold shadow-[inset_0_0_15px_rgba(0,229,153,0.3)]'
                  : 'bg-[#121110] text-gray-400 hover:text-app-textPrimary shadow-inner'
              }`}
              data-cursor-variant="action"
              data-cursor-badge="LOAD_PROMPT"
            >
              <Cpu className="w-3.5 h-3.5 opacity-70" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Interactive Transformation Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Raw Natural Language Prompt */}
          <div className="lg:col-span-5 bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-4 pb-2 border-b border-[#2A2928]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  UNTRUSTED USER INPUT
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  RAW STRING
                </span>
              </div>

              <div className="relative p-5 rounded-xl bg-[#121110] shadow-inner min-h-[140px] flex items-center">
                <p className="text-lg font-sans text-app-textPrimary font-medium italic leading-relaxed">
                  "{selectedPreset.rawText}"
                </p>
              </div>

              {/* Extraction Token Tags */}
              <div className="mt-6">
                <div className="text-[11px] font-mono text-gray-400 mb-2">SYNTACTIC CONSTRAINT EXTRACTION:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    max: ₹{selectedPreset.intentData.max_total_amount.toLocaleString()}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    banned: {selectedPreset.intentData.banned_categories.join(', ')}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    recurring: {selectedPreset.intentData.recurring_payment_allowed ? 'ALLOWED' : 'FORBIDDEN'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2A2928] flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>SOURCE: USER CLIENT</span>
              <span>PARSED BY: AI INTENT PARSER</span>
            </div>
          </div>

          {/* Center Pipeline Arrow */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider text-center">
              PYDANTIC GATEWAY<br />
              VALIDATION
            </span>
          </div>

          {/* Right: Structured Immutable Intent Contract */}
          <div className="lg:col-span-5 bg-[#1A1918] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between border-t-2 border-[#00E599]/30">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-4 pb-2 border-b border-[#2A2928]">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="text-app-textPrimary font-semibold">INTENT CONTRACT (DB STORED)</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  TRUSTED & IMMUTABLE
                </span>
              </div>

              {/* JSON Code View */}
              <pre className="p-4 rounded-xl bg-[#121110] font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed shadow-inner">
                <code>{JSON.stringify({
                  intent_id: "int_" + selectedPreset.id.slice(0, 8),
                  currency: selectedPreset.intentData.currency,
                  max_total_amount: selectedPreset.intentData.max_total_amount,
                  banned_categories: selectedPreset.intentData.banned_categories,
                  allowed_categories: selectedPreset.intentData.allowed_categories,
                  max_quantity: selectedPreset.intentData.max_quantity,
                  recurring_payment_allowed: selectedPreset.intentData.recurring_payment_allowed,
                  status: "ACTIVE"
                }, null, 2)}</code>
              </pre>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2A2928] flex items-center justify-between text-[11px] font-mono text-[#00E599]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                CRYPTOGRAPHIC TENANT ISOLATION
              </span>
              <span className="text-gray-400">FAILS CLOSED</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
