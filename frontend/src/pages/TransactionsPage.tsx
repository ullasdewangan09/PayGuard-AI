import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ShieldAlert, FileWarning, ChevronRight, Lock, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getTransactions, createTransaction, getIntents } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BeamSearch } from '../components/ui/beam-components';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Transaction State
  const [isCreating, setIsCreating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  
  // Expanded Rows State
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };
  
  // Form State
  const [selectedIntentId, setSelectedIntentId] = useState('');
  const [amount, setAmount] = useState(500); // Lowered default amount to bypass sandbox limits
  const [itemName, setItemName] = useState('Premium Subscription');
  const [isSubscription, setIsSubscription] = useState(false);
  const [category, setCategory] = useState('electronics');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txData, intentsData] = await Promise.all([
        getTransactions(),
        getIntents()
      ]);
      setTransactions(txData);
      setIntents(intentsData);
      if (intentsData.length > 0) {
        setSelectedIntentId(intentsData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId) return;

    setIsEvaluating(true);
    setEvalResult(null);
    
    const selectedIntent = intents.find(i => i.id === selectedIntentId);
    const txCurrency = selectedIntent ? selectedIntent.currency : "INR";

    const payload = {
      intent_id: selectedIntentId,
      merchant: {
        id: "m_test_123",
        name: "Test Merchant"
      },
      currency: txCurrency, // Use the currency of the intent to prevent mismatches
      items: [
        {
          name: itemName,
          category: category,
          unit_price: amount,
          quantity: 1,
          is_subscription: isSubscription
        }
      ],
      total_amount: amount
    };

    try {
      // Simulate slight delay for dramatic effect as requested by product flow
      await new Promise(r => setTimeout(r, 1000));
      const res = await createTransaction(payload);
      setEvalResult(res);
      await fetchData(); // refresh list
    } catch (error) {
      console.error('Evaluation failed', error);
      alert('Failed to evaluate transaction.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePayment = async () => {
    if (!evalResult || !evalResult.razorpay_order_id) return;
    
    const selectedIntent = intents.find(i => i.id === selectedIntentId);
    const txCurrency = selectedIntent ? selectedIntent.currency : "INR";
    
    const options = {
      key: "rzp_test_TWUs2GFkMbKY32", // Real Razorpay test key
      amount: amount * 100, // paise/cents
      currency: txCurrency, // Must match order currency
      name: "PayGuard AI",
      description: "Secure AI Transaction",
      order_id: evalResult.razorpay_order_id,
      handler: async function (response: any) {
        setIsEvaluating(true);
        try {
          // Import capturePayment dynamically or use the one from api.ts
          const { capturePayment } = await import('../services/api');
          await capturePayment(evalResult.transaction_id, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          alert("Payment Captured Successfully!");
          setIsCreating(false);
          setEvalResult(null);
          await fetchData();
        } catch (error: any) {
          console.error("Capture Failed", error);
          alert(`Capture Failed: ${error.response?.data?.detail || error.message}`);
        } finally {
          setIsEvaluating(false);
        }
      },
      prefill: {
        name: "Demo User",
        email: "demo@payguard.ai",
        contact: "9999999999"
      },
      theme: {
        color: "#FF2A4D"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      alert(`Payment Failed: ${response.error.description}`);
    });
    rzp.open();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-editorial font-bold mb-1">Transactions</h1>
          <p className="text-app-textMuted font-mono text-sm">Monitor and evaluate AI payment proposals.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A4D] text-white rounded-lg font-mono text-sm tracking-wide hover:bg-[#ff3b5c] transition-colors shadow-[0_0_15px_rgba(255,42,77,0.4)] font-bold"
          >
            <Activity size={16} />
            SIMULATE TRANSACTION
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12"
          >
            <div className="bg-[#1A1918] rounded-2xl p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-mono text-app-textPrimary mb-2">Simulate AI Transaction Request</h2>
                  <p className="text-app-textMuted text-sm font-sans">
                    This represents what a checkout flow attempts to execute against your AI Intent Contracts.
                  </p>
                </div>
                <button onClick={() => { setIsCreating(false); setEvalResult(null); }} className="text-app-textMuted hover:text-app-textPrimary p-2">
                  <X size={20} />
                </button>
              </div>

              {!evalResult ? (
                <form onSubmit={handleProposeTransaction} className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Target Intent Rule</label>
                      <select 
                        value={selectedIntentId}
                        onChange={(e) => setSelectedIntentId(e.target.value)}
                        className="w-full bg-[#121110] rounded-xl p-3 text-app-textPrimary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50"
                      >
                        {intents.map(i => (
                          <option key={i.id} value={i.id}>INTENT: {i.id.split('_')[1]} ({i.currency} {i.max_total_amount}) - {i.status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Item Name</label>
                      <input 
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full bg-[#121110] rounded-xl p-3 text-app-textPrimary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Amount (INR)</label>
                        <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full bg-[#121110] rounded-xl p-3 text-app-textPrimary font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Category</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#121110] rounded-xl p-3 text-app-textPrimary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A4D]/50 h-[52px]"
                        >
                          <option value="electronics">Electronics</option>
                          <option value="software">Software</option>
                          <option value="marketing">Marketing</option>
                          <option value="warranties">Warranties</option>
                          <option value="groceries">Groceries</option>
                          <option value="crypto">Crypto</option>
                          <option value="gambling">Gambling</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#121110] hover:bg-[#2A2928] transition-colors">
                        <input 
                          type="checkbox"
                          checked={isSubscription}
                          onChange={(e) => setIsSubscription(e.target.checked)}
                          className="w-4 h-4 accent-[#FF2A4D]"
                        />
                        <span className="text-sm font-mono text-app-textPrimary">This is a recurring subscription</span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end mt-4 pt-6 border-t border-[#1f1e1d]">
                    <button 
                      type="submit"
                      disabled={isEvaluating || !selectedIntentId}
                      className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-mono text-sm font-bold tracking-wide hover:bg-[#A3A09A] transition-colors disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          EVALUATING...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          SUBMIT TO AI ENGINE
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    {evalResult.decision === 'APPROVE' && (
                      <div className="inline-flex items-center justify-center p-4 bg-app-green/10 rounded-full text-app-green mb-4 border border-[#00E599]/20 shadow-[0_0_25px_rgba(0,229,153,0.2)]">
                        <ShieldCheck size={48} />
                      </div>
                    )}
                    {evalResult.decision === 'BLOCK' && (
                      <div className="inline-flex items-center justify-center p-4 bg-app-red/10 rounded-full text-app-red mb-4 border border-[#FF2A4D]/20 shadow-[0_0_25px_rgba(255,42,77,0.2)]">
                        <ShieldAlert size={48} />
                      </div>
                    )}
                    
                    <h2 className="text-3xl font-editorial font-bold text-app-textPrimary mb-2">
                      PAYMENT {evalResult.decision}
                    </h2>
                    <p className="text-app-textMuted max-w-xl mx-auto font-mono text-sm border-t border-[#2A2928] pt-4 mt-4">
                      {evalResult.explanation}
                    </p>
                  </div>

                  {evalResult.violations && evalResult.violations.length > 0 && (
                    <div className="mb-8 space-y-3">
                      <h3 className="text-sm font-mono text-app-textMuted uppercase tracking-wider mb-4">Rule Violations</h3>
                      {evalResult.violations.map((v: any, idx: number) => (
                         <div key={idx} className="bg-app-card border border-[#FF2A4D]/30 rounded-xl p-4 flex items-start gap-4">
                          <X className="text-app-red shrink-0 mt-0.5" size={18} />
                          <div>
                            <div className="font-mono text-sm text-app-textPrimary mb-1">{v.constraint}</div>
                            <div className="text-xs font-mono text-app-textMuted">
                              Expected: <span className="text-app-green">{v.expected}</span> | 
                              Actual: <span className="text-app-red">{v.actual}</span>
                            </div>
                          </div>
                          <div className="ml-auto text-[10px] uppercase tracking-widest text-app-red px-2 py-1 bg-app-red/10 rounded">
                            {v.severity}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center gap-4 border-t border-[#2A2928] pt-8">
                    <button 
                      onClick={() => setEvalResult(null)}
                      className="px-6 py-3 bg-[#121110] rounded-lg text-app-textMuted hover:text-app-textPrimary font-mono text-sm tracking-wide transition-colors"
                    >
                      NEW SIMULATION
                    </button>
                    
                    {evalResult.decision === 'APPROVE' && (
                      <button 
                        onClick={handlePayment}
                        disabled={isEvaluating}
                        className="flex items-center gap-2 px-8 py-3 bg-app-green text-black rounded-lg font-mono text-sm font-bold tracking-wide hover:bg-[#00D08A] transition-colors shadow-[0_0_15px_rgba(0,229,153,0.3)] disabled:opacity-50"
                      >
                        {isEvaluating ? 'PROCESSING...' : 'PAY SECURELY'}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1A1918] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="p-4 flex items-center justify-between bg-[#121110] shadow-md">
          <BeamSearch
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-app-textMuted font-mono flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-app-green mb-4" />
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-app-textMuted font-mono">No transactions found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#121110] shadow-md z-10">
              <tr className="border-b border-[#1f1e1d]">
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider w-8"></th>
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">ID</th>
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">AMOUNT</th>
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">DECISION</th>
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">STATUS</th>
                <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">DATE</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter(tx =>
                  !searchQuery ||
                  tx.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tx.decision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(tx.total_amount).includes(searchQuery)
                )
                .map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr 
                    onClick={() => toggleRow(tx.id)}
                    className={`border-b border-[#1f1e1d] hover:bg-[#1f1e1d] transition-colors cursor-pointer ${expandedRows.has(tx.id) ? 'bg-[#1f1e1d]' : ''}`}
                  >
                    <td className="p-4">
                      {expandedRows.has(tx.id) ? <ChevronUp size={16} className="text-app-textMuted" /> : <ChevronDown size={16} className="text-app-textMuted" />}
                    </td>
                    <td className="p-4 font-mono text-sm text-app-textPrimary">{tx.id.split('_')[1]}</td>
                    <td className="p-4 font-mono text-sm text-app-textPrimary">
                      {tx.currency} {tx.total_amount?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono tracking-wider font-bold ${
                        tx.decision === 'APPROVE' ? 'bg-[#00E599] text-[#121110] shadow-[0_0_10px_rgba(0,229,153,0.3)]' :
                        tx.decision === 'BLOCK' ? 'bg-[#FF2A4D] text-white shadow-[0_0_10px_rgba(255,42,77,0.4)]' :
                        'bg-[#F59E0B] text-[#121110] shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      }`}>
                        {tx.decision}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-app-textMuted uppercase tracking-wider">{tx.payment_status}</td>
                    <td className="p-4 font-mono text-xs text-app-textMuted">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  
                  {expandedRows.has(tx.id) && (
                    <tr className="border-b border-[#1f1e1d] bg-[#121110]">
                      <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Evaluation Reasoning</h4>
                            <p className="text-sm font-mono text-app-textPrimary/90 p-4 bg-[#121110] rounded-xl">
                              {tx.reasoning}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-mono text-app-textMuted uppercase tracking-wider mb-2">Transaction Payload</h4>
                            <pre className="text-xs font-mono text-app-textPrimary/70 p-4 bg-[#121110] rounded-xl overflow-x-auto">
                              {JSON.stringify(tx.items, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
