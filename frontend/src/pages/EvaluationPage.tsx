import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, FileWarning, Search, X, Loader2, CheckCircle, ChevronRight, Activity } from 'lucide-react';
import { getTransactions, getEvaluation, approveEvaluation } from '../services/api';
import { BeamSearch } from '../components/ui/beam-components';
import { AnimatePresence, motion } from 'framer-motion';

export const EvaluationPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ASK' | 'APPROVE' | 'BLOCK'>('ALL');
  
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [evaluationDetails, setEvaluationDetails] = useState<any | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const txData = await getTransactions();
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = async (tx: any) => {
    if (!tx.evaluation_id) return;
    
    setSelectedEvaluation(tx);
    setIsDetailsLoading(true);
    setEvaluationDetails(null);
    
    try {
      const details = await getEvaluation(tx.evaluation_id);
      setEvaluationDetails(details);
    } catch (error) {
      console.error('Failed to fetch evaluation details:', error);
      alert('Could not load detailed evaluation. Check console for details.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluationDetails || evaluationDetails.decision !== 'ASK') return;
    
    setIsApproving(true);
    try {
      await approveEvaluation(evaluationDetails.id);
      alert('Transaction Approved!');
      
      // Close details and refresh table
      setSelectedEvaluation(null);
      await fetchData();
    } catch (error: any) {
      console.error('Approval failed:', error);
      alert(`Approval Failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'ALL' || tx.decision === filter;
    const matchesSearch = !searchQuery || 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.decision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(tx.total_amount).includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-editorial font-bold mb-1">Evaluation Center</h1>
          <p className="text-app-textMuted font-mono text-sm">Manually review transactions flagged by the AI engine.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main Table Panel */}
        <div className={`flex flex-col flex-1 bg-[#1A1918] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 ${selectedEvaluation ? 'w-1/2' : 'w-full'}`}>
          <div className="p-4 flex items-center justify-between bg-[#121110] shadow-md">
            <div className="flex-1 max-w-sm">
              <BeamSearch
                placeholder="Search evaluated transactions..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            
            <div className="flex gap-2 ml-4">
              {['ALL', 'ASK', 'APPROVE', 'BLOCK'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-colors ${
                    filter === f 
                      ? 'bg-[#2A2928] text-white shadow-inner' 
                      : 'bg-transparent text-app-textMuted hover:bg-[#1f1e1d]'
                  }`}
                >
                  {f === 'ASK' ? 'REQUIRES REVIEW' : f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-12 text-center text-app-textMuted font-mono flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-app-green mb-4" />
                Loading evaluations...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <Activity className="w-12 h-12 text-app-textPrimary/10 mb-4" />
                <p className="text-app-textPrimary font-mono text-lg mb-2">No Transactions Found</p>
                <p className="text-app-textMuted text-sm max-w-md mx-auto">
                  There are no evaluated transactions matching your current filters.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#121110] shadow-md z-10">
                  <tr className="border-b border-[#1f1e1d]">
                    <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">ID</th>
                    <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">AMOUNT</th>
                    <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">DECISION</th>
                    <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      onClick={() => handleSelectTransaction(tx)}
                      className={`border-b border-[#1f1e1d] transition-colors cursor-pointer ${
                        selectedEvaluation?.id === tx.id ? 'bg-[#2A2928]' : 'hover:bg-[#1f1e1d]'
                      }`}
                    >
                      <td className="p-4 font-mono text-sm text-app-textPrimary">{tx.id.split('_')[1]}</td>
                      <td className="p-4 font-mono text-sm text-app-textPrimary">
                        {tx.currency} {tx.total_amount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono tracking-wider font-bold ${
                          tx.decision === 'APPROVE' ? 'bg-[#00E599] text-[#121110] shadow-[0_0_10px_rgba(0,229,153,0.3)]' :
                          tx.decision === 'BLOCK' ? 'bg-[#FF2A4D] text-white shadow-[0_0_10px_rgba(255,42,77,0.4)]' :
                          'bg-[#F59E0B] text-[#121110] shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse'
                        }`}>
                          {tx.decision === 'APPROVE' && <ShieldCheck size={12} />}
                          {tx.decision === 'BLOCK' && <ShieldAlert size={12} />}
                          {tx.decision === 'ASK' && <FileWarning size={12} />}
                          {tx.decision === 'ASK' ? 'REVIEW' : tx.decision}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-app-textMuted">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Slide-out Side Panel for details */}
        <AnimatePresence>
          {selectedEvaluation && (
            <motion.div 
              initial={{ opacity: 0, width: 0, x: 50 }}
              animate={{ opacity: 1, width: '50%', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 50 }}
              className="flex flex-col bg-[#1A1918] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.6)] relative shrink-0"
            >
              <div className="p-6 flex justify-between items-start bg-[#121110] shadow-md">
                <div>
                  <h2 className="text-xl font-editorial text-app-textPrimary mb-2">Evaluation Details</h2>
                  <div className="font-mono text-xs text-app-textMuted">
                    TX: {selectedEvaluation.id} | INTENT: {selectedEvaluation.intent_id}
                  </div>
                </div>
                <button onClick={() => setSelectedEvaluation(null)} className="text-app-textMuted hover:text-app-textPrimary p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {isDetailsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-app-textMuted">
                    <Loader2 className="w-8 h-8 animate-spin text-app-green mb-4" />
                    <p className="font-mono text-sm">Fetching detailed reasoning...</p>
                  </div>
                ) : evaluationDetails ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Status Header */}
                    <div className={`p-6 rounded-2xl border ${
                      evaluationDetails.decision === 'APPROVE' ? 'bg-app-green/5 border-[#00E599]/20' :
                      evaluationDetails.decision === 'BLOCK' ? 'bg-app-red/5 border-[#FF2A4D]/20' :
                      'bg-[#F59E0B]/5 border-[#F59E0B]/20'
                    }`}>
                      <div className="flex items-center gap-4 mb-4">
                        {evaluationDetails.decision === 'APPROVE' && (
                          <div className="p-3 bg-app-green/10 rounded-xl text-app-green shadow-[0_0_15px_rgba(0,229,153,0.2)]">
                            <ShieldCheck size={28} />
                          </div>
                        )}
                        {evaluationDetails.decision === 'BLOCK' && (
                          <div className="p-3 bg-app-red/10 rounded-xl text-app-red shadow-[0_0_15px_rgba(255,42,77,0.2)]">
                            <ShieldAlert size={28} />
                          </div>
                        )}
                        {evaluationDetails.decision === 'ASK' && (
                          <div className="p-3 bg-[#F59E0B]/10 rounded-xl text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <FileWarning size={28} />
                          </div>
                        )}
                        <div>
                          <div className="font-mono text-xs text-app-textMuted uppercase tracking-wider mb-1">AI Decision</div>
                          <div className={`font-mono text-xl font-bold ${
                            evaluationDetails.decision === 'APPROVE' ? 'text-app-green' :
                            evaluationDetails.decision === 'BLOCK' ? 'text-app-red' :
                            'text-[#F59E0B]'
                          }`}>
                            {evaluationDetails.decision === 'ASK' ? 'REQUIRES REVIEW' : evaluationDetails.decision}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-app-textPrimary/80 font-mono text-sm leading-relaxed border-t border-[#2A2928] pt-4">
                        {evaluationDetails.explanation}
                      </div>
                    </div>

                    {/* Violations List */}
                    {evaluationDetails.violations && evaluationDetails.violations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono text-app-textPrimary uppercase tracking-wider mb-4 border-b border-[#2A2928] pb-2">
                          Violations & Flags
                        </h3>
                        <div className="space-y-3">
                          {evaluationDetails.violations.map((v: any, idx: number) => (
                            <div key={idx} className="bg-[#121110] border border-[#FF2A4D]/30 rounded-xl p-4 flex items-start gap-4">
                              <X className="text-app-red shrink-0 mt-0.5" size={18} />
                              <div>
                                <div className="font-mono text-sm text-app-textPrimary mb-2">{v.constraint}</div>
                                <div className="text-xs font-mono text-app-textMuted grid grid-cols-2 gap-x-8 gap-y-2">
                                  <div>Rule: <span className="text-app-green">{v.expected}</span></div>
                                  <div>Detected: <span className="text-app-red">{v.actual}</span></div>
                                </div>
                              </div>
                              <div className="ml-auto text-[10px] uppercase tracking-widest text-app-red px-2 py-1 bg-app-red/10 rounded">
                                {v.severity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Raw Payload */}
                    <div>
                        <h3 className="text-sm font-mono text-app-textMuted uppercase tracking-wider mb-4 border-b border-[#2A2928] pb-2">
                          Transaction Data
                        </h3>
                        <pre className="text-xs font-mono text-app-textPrimary/60 p-4 bg-[#121110] rounded-xl border border-[#2A2928] overflow-x-auto">
                          {JSON.stringify(selectedEvaluation.items, null, 2)}
                        </pre>
                    </div>

                  </div>
                ) : (
                  <div className="text-center text-app-red font-mono">Failed to load data.</div>
                )}
              </div>
              
              {/* Action Bar for ASK status */}
              {evaluationDetails?.decision === 'ASK' && (
                <div className="p-6 bg-[#121110] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-10">
                  <p className="text-xs text-app-textMuted font-sans mb-4 text-center">
                    This transaction was flagged due to borderline rules. As an admin, you can manually override the AI and approve it.
                  </p>
                  <button 
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#F59E0B] text-black rounded-xl font-mono text-sm font-bold tracking-wide hover:bg-[#d97706] transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        APPROVING...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        MANUALLY APPROVE TRANSACTION
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
