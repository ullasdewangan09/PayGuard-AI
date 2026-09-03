import React, { useState, useEffect } from 'react';
import { Activity, ServerCrash, Shield, Key, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/api';

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await apiClient.get('/audit/');
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch audit events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const getIcon = (type: string) => {
    if (type.includes('CREATED')) return <FileText size={16} className="text-app-green" />;
    if (type.includes('DECISION') || type.includes('APPROVED')) return <Shield size={16} className="text-[#F59E0B]" />;
    if (type.includes('FAILED') || type.includes('REJECTED')) return <ServerCrash size={16} className="text-app-red" />;
    if (type.includes('CAPTURED')) return <CheckCircle2 size={16} className="text-app-green" />;
    return <Activity size={16} className="text-app-textMuted" />;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-editorial font-bold mb-1">Audit Trail</h1>
        <p className="text-app-textMuted font-mono text-sm">Immutable log of all authorization and security events.</p>
      </div>

      <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-app-textMuted font-mono">Loading audit logs...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-app-textMuted font-mono">No audit events found.</div>
        ) : (
          <div className="divide-y divide-[#2A2928]">
            {events.map((ev) => (
              <div key={ev.id} className="p-6 flex items-start gap-4 hover:bg-[#1f1e1d] transition-colors group">
                <div className="mt-1 shrink-0 p-2 bg-[#121110] rounded-xl shadow-inner transition-colors">
                  {getIcon(ev.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm tracking-wider font-bold text-app-textPrimary">
                      {ev.event_type}
                    </span>
                    <span className="text-xs font-mono text-app-textMuted">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-app-textMuted mb-3 uppercase tracking-wider">
                    Entity: <span className="text-app-textPrimary">{ev.entity_type.toUpperCase()}</span> | ID: <span className="text-app-textPrimary">{ev.entity_id}</span>
                  </div>
                  <div className="bg-[#121110] rounded-xl p-4 text-xs font-mono text-app-textPrimary/70 overflow-x-auto shadow-inner">
                    <pre>{JSON.stringify(ev.payload, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
