import React, { useState, useEffect } from 'react';
import { getIntents, createTransaction } from '../services/api';
import { ShieldAlert, Send, Cpu, CheckCircle2, XCircle, FileWarning, X, Loader2 } from 'lucide-react';

export const AttackLabPage: React.FC = () => {
  const [intents, setIntents] = useState<any[]>([]);
  const [selectedIntentId, setSelectedIntentId] = useState('');
  
  const [attackType, setAttackType] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchIntents = async () => {
      try {
        const data = await getIntents();
        setIntents(data);
        if (data.length > 0) {
          setSelectedIntentId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchIntents();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId) return;
    
    setLoading(true);
    setResult(null);

    const intent = intents.find(i => i.id === selectedIntentId);
    if (!intent) {
      setLoading(false);
      return;
    }

    // Determine payload based on attack type
    let total_amount = intent.max_total_amount;
    let category = "electronics";
    let is_subscription = false;

    if (attackType === 'ROGUE_BUDGET') {
      total_amount = intent.max_total_amount + 5000;
    } else if (attackType === 'ROGUE_SUBSCRIPTION') {
      is_subscription = true;
    } else if (attackType === 'ROGUE_CATEGORY') {
      category = intent.banned_categories && intent.banned_categories.length > 0 
        ? intent.banned_categories[0] 
        : "warranties";
    }

    const payload = {
      intent_id: selectedIntentId,
      merchant: { id: "m_rogue", name: "Rogue Merchant" },
      currency: intent.currency || "INR",
      items: [
        {
          name: "Test Item",
          category: category,
          unit_price: total_amount,
          quantity: 1,
          is_subscription: is_subscription
        }
      ],
      total_amount: total_amount
    };

    try {
      await new Promise(r => setTimeout(r, 1000));
      const res = await createTransaction(payload);
      setResult(res);
    } catch (error) {
      setResult({ error: 'Simulation failed to connect to backend.' });
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return <CheckCircle2 className="text-app-green" size={48} />;
      case 'BLOCK': return <XCircle className="text-app-red" size={48} />;
      case 'ASK': return <FileWarning className="text-[#F59E0B]" size={48} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 animate-in fade-in duration-500">
      
      {/* Left Column: Attack Input */}
      <div className="space-y-6">
        <div>
          <h1 className="font-editorial text-3xl font-bold mb-1">Security Center</h1>
          <p className="text-app-textMuted font-mono text-sm">Simulate rogue AI behaviors and verify PayGuard's deterministic defense.</p>
        </div>

        <div className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl relative overflow-hidden bg-[#1A1918]">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert size={150} className="text-app-red" />
          </div>
          
          <form onSubmit={handleSimulate} className="relative z-10 space-y-6">
            <div>
              <label className="block font-mono text-xs text-app-textMuted uppercase tracking-wider mb-2">Target Intent Rule</label>
              <select 
                value={selectedIntentId}
                onChange={(e) => setSelectedIntentId(e.target.value)}
                className="w-full bg-[#121110] rounded-xl p-3 text-app-textPrimary focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50 font-mono text-sm"
              >
                {intents.length === 0 && <option value="">No Rules Available - Create one first!</option>}
                {intents.map(i => (
                  <option key={i.id} value={i.id}>INTENT: {i.id.split('_')[1]} (Limit: {i.currency} {i.max_total_amount})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-app-textMuted uppercase tracking-wider mb-3">Select Attack Vector</label>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${attackType === 'NORMAL' ? 'bg-[#00E599]/10 shadow-[0_0_15px_rgba(0,229,153,0.1)]' : 'bg-[#121110] hover:bg-[#1f1e1d]'}`}>
                  <input type="radio" name="attack" checked={attackType === 'NORMAL'} onChange={() => setAttackType('NORMAL')} className="hidden" />
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${attackType === 'NORMAL' ? 'bg-[#00E599]' : 'bg-[#2A2928]'}`}>
                  </div>
                  <span className="font-mono text-sm text-app-textPrimary">Normal Compliance Transaction</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${attackType === 'ROGUE_BUDGET' ? 'bg-[#FF2A4D]/10 shadow-[0_0_15px_rgba(255,42,77,0.1)]' : 'bg-[#121110] hover:bg-[#1f1e1d]'}`}>
                  <input type="radio" name="attack" checked={attackType === 'ROGUE_BUDGET'} onChange={() => setAttackType('ROGUE_BUDGET')} className="hidden" />
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${attackType === 'ROGUE_BUDGET' ? 'bg-[#FF2A4D]' : 'bg-[#2A2928]'}`}>
                  </div>
                  <span className="font-mono text-sm text-app-textPrimary">Rogue: Budget Bypass Attempt</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${attackType === 'ROGUE_SUBSCRIPTION' ? 'bg-[#FF2A4D]/10 shadow-[0_0_15px_rgba(255,42,77,0.1)]' : 'bg-[#121110] hover:bg-[#1f1e1d]'}`}>
                  <input type="radio" name="attack" checked={attackType === 'ROGUE_SUBSCRIPTION'} onChange={() => setAttackType('ROGUE_SUBSCRIPTION')} className="hidden" />
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${attackType === 'ROGUE_SUBSCRIPTION' ? 'bg-[#FF2A4D]' : 'bg-[#2A2928]'}`}>
                  </div>
                  <span className="font-mono text-sm text-app-textPrimary">Rogue: Hidden Subscription Injection</span>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || intents.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#FF2A4D] text-white font-mono font-bold text-sm tracking-widest rounded-lg hover:bg-[#ff3b5c] transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,42,77,0.4)] mt-4"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> SIMULATING...</> : <><Send size={16} /> LAUNCH ATTACK</>}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Execution Output */}
      <div>
        <div className="h-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl flex flex-col bg-[#1A1918]">
          <div className="p-4 flex items-center gap-3 bg-[#121110] rounded-t-2xl shadow-md">
            <Cpu size={18} className="text-app-textMuted" />
            <span className="font-mono text-xs text-app-textMuted uppercase tracking-wider">Policy Engine Runtime</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {!result ? (
              <div className="text-center text-app-textMuted">
                <Cpu size={48} className="mx-auto mb-4 opacity-50 text-app-textPrimary" />
                <p className="font-mono text-sm">System Ready.</p>
                <p className="text-xs font-sans mt-2">Waiting for adversarial payload...</p>
              </div>
            ) : result.error ? (
              <div className="text-center text-app-red">
                <ShieldAlert size={48} className="mx-auto mb-4" />
                <p className="font-mono">{result.error}</p>
              </div>
            ) : (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <div className={`p-4 rounded-full ${
                      result.decision === 'APPROVE' ? 'bg-app-green/10 shadow-[0_0_30px_rgba(0,229,153,0.2)]' :
                      result.decision === 'BLOCK' ? 'bg-app-red/10 shadow-[0_0_30px_rgba(255,42,77,0.2)]' :
                      'bg-[#F59E0B]/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                    }`}>
                      {getDecisionIcon(result.decision)}
                    </div>
                  </div>
                  <h2 className="font-editorial text-3xl font-bold text-app-textPrimary mb-3">
                    {result.decision}
                  </h2>
                  <p className="text-app-textMuted text-sm max-w-sm font-mono border-t border-[#2A2928] pt-4">
                    {result.explanation}
                  </p>
                </div>
                
                {result.violations && result.violations.length > 0 && (
                  <div className="w-full">
                    <h3 className="font-mono text-xs text-app-textMuted uppercase tracking-wider mb-4">Security Enforcement</h3>
                    {result.violations.map((v: any, idx: number) => (
                      <div key={idx} className="bg-[#121110] border border-[#FF2A4D]/30 rounded-xl p-4 mb-3 flex items-start gap-4 shadow-inner">
                        <X className="text-app-red shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="font-mono text-sm text-app-textPrimary mb-2">{v.constraint}</div>
                          <div className="text-xs font-mono text-app-textMuted">
                            Attempted: <span className="text-app-red">{v.actual}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.decision === 'BLOCK' && (
                   <div className="bg-[#121110] rounded-xl p-6 text-center shadow-inner">
                     <ShieldAlert className="text-app-textMuted mx-auto mb-3" size={28} />
                     <p className="font-mono text-sm text-app-textPrimary mb-1">CAPTURE GATE CLOSED</p>
                     <p className="text-xs font-mono text-app-textMuted">Razorpay API was never called.</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
