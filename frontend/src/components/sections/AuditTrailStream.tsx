import React, { useState, useEffect, useRef } from 'react';
import { History, Key } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  status: 'SUCCESS' | 'BLOCK' | 'PROCESSED';
  details: {
    resourceId: string;
    hash: string;
    payloadSnippet: string;
    securityCheck: string;
  };
}

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt_001',
    timestamp: '14:32:01.104',
    eventType: 'INTENT_CREATED',
    actor: 'user_dev_94',
    status: 'SUCCESS',
    details: {
      resourceId: 'int_80k_laptop',
      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      payloadSnippet: '{"max_total_amount": 80000, "banned_categories": ["warranty"], "recurring_allowed": false}',
      securityCheck: 'Pydantic non-negative validation passed. Tenant row-level lock created.'
    }
  },
  {
    id: 'evt_002',
    timestamp: '14:32:04.281',
    eventType: 'TRANSACTION_PROPOSED',
    actor: 'agent_shopping_v2',
    status: 'PROCESSED',
    details: {
      resourceId: 'txn_croma_998',
      hash: 'sha256:1a84f329910e9f1a0f622e96e74b3d1620a2f4ff4f2a74c2049e29f3d9b4b029',
      payloadSnippet: '{"intent_id": "int_80k_laptop", "merchant_id": "m_croma_01", "total_amount": 80999}',
      securityCheck: 'Idempotency key verified. Hash matched cache index.'
    }
  },
  {
    id: 'evt_003',
    timestamp: '14:32:04.289',
    eventType: 'POLICY_EVALUATION',
    actor: 'engine_policy_core',
    status: 'PROCESSED',
    details: {
      resourceId: 'eval_8892',
      hash: 'sha256:9c9b0e11894d3f284b1239fa840921dc8f78119028a471a2b719460298bb4d91',
      payloadSnippet: '{"rules_evaluated": 8, "violations_found": ["BANNED_CATEGORY", "RECURRING_PAYMENT"]}',
      securityCheck: 'Deterministic comparisons against trusted Intent Contract concluded.'
    }
  },
  {
    id: 'evt_004',
    timestamp: '14:32:04.292',
    eventType: 'DECISION_GENERATED',
    actor: 'engine_decision_core',
    status: 'BLOCK',
    details: {
      resourceId: 'dec_block_442',
      hash: 'sha256:4d82f7182903bb47d01827982f10928bb8a27192801827b399281a8c90192881',
      payloadSnippet: '{"decision": "BLOCK", "explanation": "Transaction contains banned items: warranty"}',
      securityCheck: 'State immutable. Dispatched to tamper-evident audit ledger.'
    }
  },
  {
    id: 'evt_005',
    timestamp: '14:32:04.295',
    eventType: 'RAZORPAY_CAPTURE',
    actor: 'gate_capture_controller',
    status: 'BLOCK',
    details: {
      resourceId: 'rzp_gate_00',
      hash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      payloadSnippet: '{"razorpay_api_invoked": false, "calls_made": 0, "status": "GATE_LOCKED"}',
      securityCheck: 'Capture gate prevented external network call. Zero funds moved.'
    }
  }
];

export const AuditTrailStream: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent>(AUDIT_EVENTS[3]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    if (sectionRef.current) {
      const reveals = sectionRef.current.querySelectorAll('.reveal');
      reveals.forEach((el) => observer.observe(el));
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="audit-trail" className="relative py-32 md:py-48 px-4 md:px-12 overflow-hidden bg-white border-t border-gray-200">
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-24 text-center md:text-left reveal">
          <div className="flex items-center gap-2 font-mono text-xs text-blue-600 tracking-widest justify-center md:justify-start mb-6">
            <History className="w-4 h-4" />
            <span>[ 12 ] CRYPTOGRAPHIC AUDIT SERVICE</span>
          </div>
          <h2 className="font-editorial text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase text-gray-900 tracking-tighter leading-[0.9]">
            EVERY ACTION IS<br />
            <span className="text-blue-600">MATHEMATICALLY PROVED.</span>
          </h2>
          <p className="font-sans text-xl text-gray-500 font-light max-w-2xl mt-6">
            PayGuard doesn't just log strings. It emits a tamper-evident, cryptographically hashed event stream.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start reveal" style={{ transitionDelay: '0.2s' }}>
          
          {/* Left: Stream List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono text-gray-500 mb-4 tracking-widest">MICROSECOND RESOLUTION PIPELINE</div>

            {AUDIT_EVENTS.map((evt) => {
              const isSelected = selectedEvent.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-5 rounded-2xl border transition-all duration-300 cursor-pointer"
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    borderColor: isSelected ? '#93C5FD' : '#E5E7EB',
                    transform: isSelected ? 'translateX(10px)' : 'translateX(0)',
                    boxShadow: isSelected ? '0 4px 6px -1px rgba(37,99,235,0.1)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
                  }}
                  data-cursor-variant="inspect"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-xs text-gray-500 w-24">{evt.timestamp}</div>
                      <div className="w-2 h-2 rounded-full" style={{
                        color: evt.status === 'SUCCESS' ? '#10B981' : evt.status === 'BLOCK' ? '#EF4444' : '#3B82F6',
                        backgroundColor: 'currentColor',
                        boxShadow: `0 0 5px currentColor`
                      }} />
                      <div className="font-mono text-[10px] md:text-xs font-bold text-gray-900 tracking-widest" style={{ color: isSelected ? '#1E3A8A' : '#111827' }}>
                        {evt.eventType}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Cryptographic Inspector */}
          <div className="lg:col-span-7 sticky top-32 lg:ml-8">
            <div className="p-8 md:p-12 rounded-3xl bg-white border border-blue-200 shadow-xl relative overflow-hidden animate-fade-up" key={selectedEvent.id}>
              
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                 <div className="flex items-center gap-3">
                   <Key className="w-5 h-5 text-blue-600" />
                   <span className="font-mono text-xs tracking-widest text-blue-600 font-bold">
                     LEDGER RECORD
                   </span>
                 </div>
                 <span className="font-mono text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded border border-gray-200">
                   {selectedEvent.timestamp}
                 </span>
              </div>
              
              <div className="flex flex-col gap-6">
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                     <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">PRINCIPAL ACTOR</div>
                     <p className="font-mono text-sm text-blue-700 font-bold">{selectedEvent.actor}</p>
                   </div>
                   <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                     <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">RESOURCE ID</div>
                     <p className="font-mono text-sm text-gray-900 font-bold">{selectedEvent.details.resourceId}</p>
                   </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                   <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">PAYLOAD SHA-256 HASH</div>
                   <p className="font-mono text-[10px] text-gray-600 break-all">{selectedEvent.details.hash}</p>
                 </div>

                 <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-inner">
                   <div className="font-mono text-[10px] text-blue-400 tracking-widest mb-2">PAYLOAD SNIPPET</div>
                   <pre className="font-mono text-[11px] text-blue-300 whitespace-pre-wrap">{selectedEvent.details.payloadSnippet}</pre>
                 </div>

                 <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                   <div className="font-mono text-[10px] text-emerald-700 tracking-widest mb-2">SECURITY ASSURANCE</div>
                   <p className="font-sans text-sm text-emerald-800 leading-relaxed">{selectedEvent.details.securityCheck}</p>
                 </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
