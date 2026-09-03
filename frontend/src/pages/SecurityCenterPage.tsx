import React from 'react';
import { ShieldCheck, Crosshair, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SecurityCenterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-3xl font-editorial font-bold mb-1">Security Center</h1>
        <p className="text-app-textMuted font-mono text-sm">Command center for your AI-driven payment firewall.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attack Lab Card */}
        <div 
          onClick={() => navigate('/app/attack-lab')}
          className="group cursor-pointer bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.6)] rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crosshair size={120} className="text-app-red" />
          </div>
          
          <div className="flex items-start gap-4 mb-6 relative z-10">
            <div className="p-3 bg-[#FF2A4D] rounded-xl text-white shadow-[0_0_15px_rgba(255,42,77,0.4)]">
              <Crosshair size={28} />
            </div>
            <div>
              <h2 className="text-xl font-editorial font-bold text-app-textPrimary mb-1">Attack Lab</h2>
              <p className="text-app-textMuted font-mono text-xs">Simulate Adversarial Payloads</p>
            </div>
          </div>
          
          <p className="text-app-textMuted text-sm leading-relaxed mb-8 relative z-10 font-sans">
            Launch rogue transactions, hidden subscription injections, and budget bypass attempts to verify the deterministic defense of your AI Intent Rules.
          </p>
          
          <div className="flex items-center text-app-red font-mono text-xs font-bold tracking-wider relative z-10">
            ENTER LAB <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Audit Trail Card */}
        <div 
          onClick={() => navigate('/app/audit')}
          className="group cursor-pointer bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.6)] rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={120} className="text-app-green" />
          </div>
          
          <div className="flex items-start gap-4 mb-6 relative z-10">
            <div className="p-3 bg-[#00E599] rounded-xl text-[#121110] shadow-[0_0_15px_rgba(0,229,153,0.4)]">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-xl font-editorial font-bold text-app-textPrimary mb-1">Audit Trail</h2>
              <p className="text-app-textMuted font-mono text-xs">Immutable Ledger</p>
            </div>
          </div>
          
          <p className="text-app-textMuted text-sm leading-relaxed mb-8 relative z-10 font-sans">
            Review the cryptographically secure log of all system events, AI decisions, transaction attempts, and administrator manual overrides.
          </p>
          
          <div className="flex items-center text-app-green font-mono text-xs font-bold tracking-wider relative z-10">
            VIEW LEDGER <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
      </div>
    </div>
  );
};
