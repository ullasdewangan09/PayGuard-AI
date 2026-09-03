import React, { useState, useEffect } from 'react';
import { FileCode2, Sparkles, Loader2, Trash2, Power, PowerOff } from 'lucide-react';
import { getIntents, deleteIntent, updateIntentStatus } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const IntentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      const data = await getIntents();
      setIntents(data);
    } catch (error) {
      console.error('Failed to fetch intents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (intentId: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deleteIntent(intentId);
      await fetchIntents();
    } catch (err) {
      console.error("Failed to delete intent", err);
      alert("Failed to delete intent.");
    }
  };

  const handleToggleStatus = async (intentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateIntentStatus(intentId, newStatus);
      await fetchIntents();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-editorial font-bold mb-2">Intent Rules</h1>
          <p className="text-app-textMuted font-mono text-sm">Manage your deployed AI payment constraints.</p>
        </div>
        <button 
          onClick={() => navigate('/app/ai-intent')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00E599] text-[#121110] rounded-lg font-mono text-sm tracking-wide hover:bg-[#00D08A] transition-colors font-bold shadow-[0_0_15px_rgba(0,229,153,0.4)]"
        >
          <Sparkles size={16} />
          CREATE NEW RULE
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-app-textMuted">
            <Loader2 className="w-8 h-8 animate-spin text-app-green mb-4" />
            <p className="font-mono text-sm">Loading deployment rules...</p>
          </div>
        ) : intents.length === 0 ? (
          <div className="text-center py-24 bg-app-card rounded-2xl flex flex-col items-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-app-card flex items-center justify-center mb-4">
              <FileCode2 size={32} className="text-app-textMuted" />
            </div>
            <h3 className="font-mono text-lg text-app-textPrimary mb-2">No Active Rules</h3>
            <p className="text-app-textMuted text-sm max-w-md mx-auto mb-6">
              You haven't deployed any AI Intent Contracts yet. Head over to the Chatbot to configure your first payment firewall rule.
            </p>
            <button 
              onClick={() => navigate('/app/ai-intent')}
              className="px-6 py-2 bg-app-card hover:bg-[#2A2928] rounded-lg text-app-textPrimary font-mono text-sm transition-colors shadow-lg"
            >
              Start Chatting
            </button>
          </div>
        ) : (
          intents.map((intent) => (
            <div 
              key={intent.id} 
              className={`bg-[#1A1918] rounded-2xl transition-all relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.6)] ${
                intent.status === 'ACTIVE' 
                  ? 'hover:-translate-y-1' 
                  : 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100 hover:-translate-y-1'
              }`}
            >
              {intent.status === 'ACTIVE' && (
                <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00E599] to-transparent animate-scanLine" />
                </div>
              )}
              
              {/* Card Header */}
              <div className="p-6 border-b border-[#2A2928] bg-[#121110]/40 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${intent.status === 'ACTIVE' ? 'bg-[#00E599]/10 border border-[#00E599]/20 shadow-[0_0_15px_rgba(0,229,153,0.1)]' : 'bg-[#2A2928] border border-[#3A3938]'}`}>
                    <FileCode2 className={`w-5 h-5 ${intent.status === 'ACTIVE' ? 'text-[#00E599]' : 'text-app-textMuted'}`} />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold tracking-wider text-app-textPrimary">INTENT CONTRACT</div>
                    <div className="text-xs font-mono text-app-textMuted mt-1">{intent.id}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono font-bold text-app-textMuted bg-[#121110] px-4 py-2 rounded-lg border border-[#2A2928]">
                    {new Date(intent.created_at).toLocaleDateString()}
                  </div>
                  
                  <button 
                    onClick={() => handleToggleStatus(intent.id, intent.status)}
                    title={intent.status === 'ACTIVE' ? 'Deactivate Rule' : 'Activate Rule'}
                    className={`p-2 rounded-lg transition-all shadow-lg ${
                      intent.status === 'ACTIVE' 
                        ? 'bg-[#121110] text-app-textMuted hover:text-white border border-[#2A2928] hover:border-white/20' 
                        : 'bg-[#00E599] text-[#121110] hover:bg-[#00D08A] font-bold'
                    }`}
                  >
                    {intent.status === 'ACTIVE' ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(intent.id)}
                    title="Delete Rule"
                    className="p-2 bg-[#121110] text-app-textMuted rounded-lg border border-[#2A2928] hover:bg-[#FF2A4D] hover:text-white hover:border-[#FF2A4D] hover:shadow-[0_0_15px_rgba(255,42,77,0.4)] transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#1A1918]">
                {/* Budget */}
                <div className="bg-[#121110]/50 p-4 rounded-xl border border-[#2A2928]/50">
                  <div className="text-[10px] text-app-textMuted uppercase tracking-widest mb-3 font-mono font-bold">Max Budget</div>
                  <div className="font-mono text-2xl font-bold text-app-textPrimary flex items-baseline gap-1">
                    <span className="text-sm text-app-textMuted">{intent.currency}</span>
                    {intent.max_total_amount.toLocaleString()}
                  </div>
                </div>
                
                {/* Recurring */}
                <div className="bg-[#121110]/50 p-4 rounded-xl border border-[#2A2928]/50 flex flex-col justify-between">
                  <div className="text-[10px] text-app-textMuted uppercase tracking-widest mb-3 font-mono font-bold">Recurring</div>
                  <div>
                    {intent.recurring_payment_allowed ? (
                      <span className="inline-block bg-[#00E599] text-[#121110] font-mono text-xs font-bold px-3 py-1.5 rounded-md shadow-[0_0_10px_rgba(0,229,153,0.3)]">
                        ALLOWED
                      </span>
                    ) : (
                      <span className="inline-block bg-[#2A2928] text-app-textMuted font-mono text-xs font-bold px-3 py-1.5 rounded-md">
                        NOT ALLOWED
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Restricted */}
                <div className="bg-[#121110]/50 p-4 rounded-xl border border-[#2A2928]/50 flex flex-col justify-between">
                  <div className="text-[10px] text-app-textMuted uppercase tracking-widest mb-3 font-mono font-bold">Restricted</div>
                  <div className="flex flex-wrap gap-2">
                    {intent.banned_categories?.length ? intent.banned_categories.map((cat: string) => (
                      <span key={cat} className="inline-block bg-[#FF2A4D] text-white font-mono text-xs font-bold px-2 py-1 rounded-md shadow-[0_0_10px_rgba(255,42,77,0.3)]">
                        {cat}
                      </span>
                    )) : (
                      <span className="inline-block text-app-textMuted font-mono text-xs font-bold">
                        NONE
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Allowed */}
                <div className="bg-[#121110]/50 p-4 rounded-xl border border-[#2A2928]/50 flex flex-col justify-between">
                  <div className="text-[10px] text-app-textMuted uppercase tracking-widest mb-3 font-mono font-bold">Allowed</div>
                  <div className="flex flex-wrap gap-2">
                    {intent.allowed_categories?.length ? intent.allowed_categories.map((cat: string) => (
                      <span key={cat} className="inline-block bg-[#00E599] text-[#121110] font-mono text-xs font-bold px-2 py-1 rounded-md shadow-[0_0_10px_rgba(0,229,153,0.3)]">
                        {cat}
                      </span>
                    )) : (
                      <span className="inline-block text-app-textPrimary/80 font-mono text-xs font-bold">
                        ANY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
