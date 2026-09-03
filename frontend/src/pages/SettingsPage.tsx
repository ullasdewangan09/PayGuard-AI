import React from 'react';
import { Settings, User, Bell, Key, Globe, CreditCard } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-3xl font-editorial font-bold mb-1">System Settings</h1>
        <p className="text-app-textMuted font-mono text-sm">Configure your PayGuard AI workspace and preferences.</p>
      </div>

      <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden border-none">
        <div className="divide-y divide-[#2A2928]">
          
          <div className="p-6 flex items-start gap-4 hover:bg-[#1f1e1d] transition-colors cursor-pointer group">
            <div className="mt-1 p-2 bg-[#121110] rounded-xl shadow-inner group-hover:shadow-[inset_0_0_10px_rgba(0,229,153,0.2)] transition-colors">
              <Globe size={20} className="text-app-textMuted group-hover:text-app-green transition-colors" />
            </div>
            <div>
              <h3 className="font-mono text-sm text-app-textPrimary mb-1">Workspace Configuration</h3>
              <p className="text-xs font-sans text-app-textMuted max-w-lg">Manage your organization details, timezone, and base currency for AI Intent processing.</p>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4 hover:bg-[#1f1e1d] transition-colors cursor-pointer group">
            <div className="mt-1 p-2 bg-[#121110] rounded-xl shadow-inner group-hover:shadow-[inset_0_0_10px_rgba(0,229,153,0.2)] transition-colors">
              <Key size={20} className="text-app-textMuted group-hover:text-app-green transition-colors" />
            </div>
            <div>
              <h3 className="font-mono text-sm text-app-textPrimary mb-1">API Keys & Webhooks</h3>
              <p className="text-xs font-sans text-app-textMuted max-w-lg">Generate authentication tokens and configure webhook endpoints for automated transaction listening.</p>
            </div>
          </div>

          <div className="p-6 flex items-start gap-4 hover:bg-[#1f1e1d] transition-colors cursor-pointer group">
            <div className="mt-1 p-2 bg-[#121110] rounded-xl shadow-inner group-hover:shadow-[inset_0_0_10px_rgba(0,229,153,0.2)] transition-colors">
              <CreditCard size={20} className="text-app-textMuted group-hover:text-app-green transition-colors" />
            </div>
            <div>
              <h3 className="font-mono text-sm text-app-textPrimary mb-1">Payment Gateways</h3>
              <p className="text-xs font-sans text-app-textMuted max-w-lg">Connect external payment processors (Razorpay, Stripe) to securely capture funds after AI authorization.</p>
            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-8 text-center text-app-textMuted font-mono text-xs opacity-50">
        Settings modules are currently in read-only mode during the beta period.
      </div>
    </div>
  );
};
