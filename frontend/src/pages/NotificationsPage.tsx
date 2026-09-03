import React from 'react';
import { Bell, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-3xl font-editorial font-bold mb-1">Notifications</h1>
        <p className="text-app-textMuted font-mono text-sm">System alerts and AI engine updates.</p>
      </div>

      <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden border-none">
        <div className="p-12 text-center flex flex-col items-center justify-center h-64">
          <Bell className="w-12 h-12 text-app-textPrimary/10 mb-4" />
          <p className="text-app-textPrimary font-mono text-lg mb-2">Inbox Zero</p>
          <p className="text-app-textMuted text-sm max-w-sm">
            You have no unread notifications. Critical security alerts and system events will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};
