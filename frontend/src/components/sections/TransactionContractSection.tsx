import React, { useState } from 'react';
import { Send, FileText, ArrowRight, ShieldCheck, ShieldAlert, Cpu, CheckCircle2, XCircle } from 'lucide-react';

export const TransactionContractSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid');

  return (
    <section id="transaction" className="relative py-24 px-4 md:px-8 bg-[#07080c] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2A2928] pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold mb-2">
              <FileText className="w-4 h-4" />
              <span>[03 // TRANSACTION PROPOSAL]</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold uppercase text-app-textPrimary tracking-tight">
              THE AGENT PROPOSES. PAYGUARD EVALUATES.
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 bg-[#121110] text-gray-300 rounded-full shadow-inner">
              UNTRUSTED AGENT PAYLOAD
            </span>
          </div>
        </div>

        {/* Interactive Comparison Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeTab === 'valid'
                  ? 'bg-[#00E599]/20 text-[#00E599] shadow-[inset_0_0_15px_rgba(0,229,153,0.3)]'
                  : 'bg-[#121110] text-gray-400 hover:text-app-textPrimary shadow-inner'
              }`}
            >
              PROPOSAL A: CONSTRAINTS RESPECTED (₹75,000)
            </button>
            <button
              onClick={() => setActiveTab('invalid')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeTab === 'invalid'
                  ? 'bg-[#FF2A4D]/20 text-[#FF2A4D] shadow-[inset_0_0_15px_rgba(255,42,77,0.3)]'
                  : 'bg-[#121110] text-gray-400 hover:text-app-textPrimary shadow-inner'
              }`}
            >
              PROPOSAL B: ADVERSARIAL SMUGGLING (₹80,999)
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>TARGET INTENT ID:</span>
            <span className="text-cyan-400 font-mono">int_80k_laptop</span>
          </div>
        </div>

        {/* Transaction Flow Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Transaction Contract JSON */}
          <div className="lg:col-span-5 bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3 pb-2 border-b border-[#2A2928]">
              <span className="flex items-center gap-2 text-app-textPrimary">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>POST /api/v1/transactions/</span>
              </span>
              <span className="text-cyan-400 font-mono">AGENT_PROPOSAL</span>
            </div>

            <pre className="p-4 rounded-xl bg-[#121110] font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed shadow-inner">
              <code>{JSON.stringify(
                activeTab === 'valid'
                  ? {
                      intent_id: "int_80k_laptop",
                      merchant: { id: "m_croma_01", name: "Croma Electronics" },
                      currency: "INR",
                      items: [
                        { name: "Pro Laptop 16GB", category: "electronics", unit_price: 75000, quantity: 1 }
                      ],
                      total_amount: 75000
                    }
                  : {
                      intent_id: "int_80k_laptop",
                      merchant: { id: "m_croma_01", name: "Croma Electronics" },
                      currency: "INR",
                      items: [
                        { name: "Pro Laptop 16GB", category: "electronics", unit_price: 75000, quantity: 1 },
                        { name: "Accidental Damage Care", category: "warranty", unit_price: 5000, quantity: 1 },
                        { name: "Cloud Backup Tier", category: "saas", unit_price: 999, quantity: 1, is_subscription: true }
                      ],
                      total_amount: 80999
                    },
                null,
                2
              )}</code>
            </pre>
          </div>

          {/* Center: In-Transit Payment Packet */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 py-6">
            <div className="relative p-4 rounded-xl bg-[#111624] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col items-center text-center animate-packet-float">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute -top-1 -right-1" />
              <Cpu className="w-6 h-6 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-gray-400">PAYMENT PACKET</span>
              <span className="text-xs font-mono font-bold text-app-textPrimary mt-0.5">
                {activeTab === 'valid' ? '₹75,000' : '₹80,999'}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

          {/* Right: Policy Engine Analysis */}
          <div className="lg:col-span-5 bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3 pb-2 border-b border-[#2A2928]">
              <span className="flex items-center gap-2 text-app-textPrimary">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>POLICY ENGINE EVALUATION</span>
              </span>
              <span className="text-emerald-400 font-mono">DETERMINISTIC</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121110] shadow-inner">
                <span className="text-gray-300">Amount &lt;= ₹80,000</span>
                <span className={activeTab === 'valid' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {activeTab === 'valid' ? 'PASS (₹75k)' : 'FAIL (₹80.9k)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121110] shadow-inner">
                <span className="text-gray-300">Banned: ['warranty']</span>
                <span className={activeTab === 'valid' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {activeTab === 'valid' ? 'PASS (None)' : 'FAIL (Matched 1)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121110] shadow-inner">
                <span className="text-gray-300">Recurring Allowed: False</span>
                <span className={activeTab === 'valid' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {activeTab === 'valid' ? 'PASS' : 'FAIL (Subscription detected)'}
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-xl shadow-inner flex items-center justify-between font-mono text-xs font-bold ${
              activeTab === 'valid'
                ? 'bg-[#00E599]/10 text-[#00E599]'
                : 'bg-[#FF2A4D]/10 text-[#FF2A4D]'
            }`}>
              <span>DECISION:</span>
              <span>{activeTab === 'valid' ? 'APPROVE → CAPTURE READY' : 'BLOCK → GATE LOCKED'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
