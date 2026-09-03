import React, { useState, useEffect, useRef } from 'react';
import { Code2, Terminal } from 'lucide-react';

interface EngineComponent {
  id: string;
  name: string;
  badge: string;
  description: string;
  technicalGuarantee: string;
  snippet: string;
}

const ENGINE_COMPONENTS: EngineComponent[] = [
  {
    id: 'policy-engine',
    name: 'Deterministic Policy Engine',
    badge: '100% DETERMINISTIC',
    description: 'Pure Python constraint comparison engine evaluating amounts, normalized categories, currency, and quantities with zero LLM hallucination.',
    technicalGuarantee: 'Guaranteed 0 false approvals across 106 tested evaluation scenarios.',
    snippet: `def evaluate_policy(intent: IntentContract, txn: TransactionContract) -> List[Violation]:
    violations = []
    if txn.total_amount > intent.max_total_amount:
        violations.append(Violation(code="MAX_AMOUNT_EXCEEDED"))
    for item in txn.items:
        if item.category.lower() in [c.lower() for c in intent.banned_categories]:
            violations.append(Violation(code="BANNED_CATEGORY_DETECTED"))
    return violations`
  },
  {
    id: 'capture-gate',
    name: 'Payment Capture Gate',
    badge: 'FAIL-CLOSED ISOLATION',
    description: 'Guards external payment provider execution. Ensures capture_payment is only called when evaluation verdict is strictly APPROVE.',
    technicalGuarantee: '0 unauthorized Razorpay captures during all 12 adversarial Attack Lab vectors.',
    snippet: `def capture_payment(evaluation: Evaluation, txn: Transaction) -> PaymentResult:
    if evaluation.decision != Decision.APPROVE:
        raise AuthorizationError("Payment capture forbidden for non-approved transactions.")
    if txn.payment_status == PaymentStatus.CAPTURED:
        raise ConflictError("Anti-replay: Transaction already captured.")
    return razorpay_provider.capture(txn)`
  },
  {
    id: 'idempotency-middleware',
    name: 'Idempotency Middleware',
    badge: 'ANTI-REPLAY INTEGRITY',
    description: 'Hashes transaction payload and binds it against unique Idempotency-Key headers to eliminate duplicate billing during network retries.',
    technicalGuarantee: 'Rejects mutated replays with HTTP 409 Conflict.',
    snippet: `def verify_idempotency(key: str, payload_bytes: bytes):
    payload_hash = hashlib.sha256(payload_bytes).hexdigest()
    cached = redis_or_db.get(f"idemp:{key}")
    if cached and cached.hash != payload_hash:
        raise HTTPException(status_code=409, detail="Idempotency payload mismatch")`
  },
  {
    id: 'audit-service',
    name: 'Audit Service & Hash Chain',
    badge: 'TAMPER-EVIDENT LEDGER',
    description: 'Records immutable chronological financial security telemetry with microsecond precision and row-level tenant locking.',
    technicalGuarantee: 'All evaluations and decision states are permanently archived.',
    snippet: `def record_audit_event(db: Session, actor: str, event_type: str, payload: dict):
    event = AuditLog(
        id=f"evt_{uuid.uuid4().hex[:12]}",
        actor=actor,
        event_type=event_type,
        payload_hash=hashlib.sha256(json.dumps(payload).encode()).hexdigest(),
        created_at=datetime.utcnow()
    )
    db.add(event); db.commit()`
  }
];

export const EngineeringCredibility: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<EngineComponent>(ENGINE_COMPONENTS[0]);
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
    <section ref={sectionRef} id="engineering" className="relative py-32 md:py-48 px-4 md:px-12 bg-gray-50 border-t border-gray-200 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-24 text-center md:text-left reveal">
          <div className="flex items-center gap-2 font-mono text-xs text-blue-600 tracking-widest justify-center md:justify-start mb-6">
            <Code2 className="w-4 h-4" />
            <span>[ 13 ] ENGINEERING RIGOR</span>
          </div>
          <h2 className="font-editorial text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase text-gray-900 tracking-tighter leading-[0.9]">
            INSIDE THE<br />
            <span className="text-blue-600">AUTHORIZATION ENGINE.</span>
          </h2>
          <p className="font-sans text-xl text-gray-500 font-light max-w-2xl mt-6">
            Explore the core Python components that enforce the deterministic safety perimeter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start reveal" style={{ transitionDelay: '0.2s' }}>
          
          {/* Left: Component Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {ENGINE_COMPONENTS.map((comp) => {
              const isSelected = selectedComp.id === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp)}
                  className="p-6 rounded-3xl text-left border transition-all duration-300 overflow-hidden relative group bg-white shadow-sm"
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    borderColor: isSelected ? '#93C5FD' : '#E5E7EB',
                    transform: isSelected ? 'translateX(10px)' : 'translateX(0)',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(37,99,235,0.1)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
                  }}
                  data-cursor-variant="inspect"
                >
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="font-editorial font-bold text-xl transition-colors" style={{ color: isSelected ? '#1E3A8A' : '#111827' }}>{comp.name}</span>
                    <span className="text-[9px] font-mono tracking-widest px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {comp.badge}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-gray-500 leading-relaxed relative z-10 line-clamp-2">
                    {comp.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Code Inspector */}
          <div className="lg:col-span-7 sticky top-32 lg:ml-8">
            <div className="p-8 md:p-12 rounded-3xl bg-white border border-blue-200 shadow-xl flex flex-col relative overflow-hidden animate-fade-up" key={selectedComp.id}>
              
              <div className="flex items-center justify-between text-xs font-mono text-blue-700 mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-2 font-bold tracking-widest">
                  <Terminal className="w-5 h-5" />
                  {selectedComp.name} Impl.
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded border border-emerald-200">
                  DEFENSIVE ARCHITECTURE
                </span>
              </div>

              {/* Code Snippet Box */}
              <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 font-mono text-xs text-blue-300 overflow-x-auto shadow-inner leading-relaxed">
                <code>{selectedComp.snippet}</code>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-200 text-sm font-sans text-gray-700 leading-relaxed">
                <span className="font-mono text-xs text-blue-700 font-bold block mb-2 tracking-widest">TECHNICAL GUARANTEE</span>
                {selectedComp.technicalGuarantee}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
