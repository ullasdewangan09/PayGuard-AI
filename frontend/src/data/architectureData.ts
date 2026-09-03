export interface ArchitectureNode {
  id: string;
  step: string;
  name: string;
  category: 'CLIENT' | 'INTENT' | 'AGENT' | 'POLICY' | 'DECISION' | 'EXECUTION';
  trustLevel: 'UNTRUSTED' | 'TRUSTED_GATEWAY' | 'DETERMINISTIC_CORE' | 'PAYMENT_RAIL';
  purpose: string;
  securityResponsibility: string;
  role: string;
  telemetryMetric: string;
}

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'user-nl',
    step: '01',
    name: 'Natural Language Request',
    category: 'CLIENT',
    trustLevel: 'UNTRUSTED',
    purpose: 'Accepts raw natural language instructions from the user articulating purchase intent and boundary conditions.',
    securityResponsibility: 'Represents raw intent before mathematical boundary synthesis.',
    role: 'User articulates what they want to purchase and their explicit constraints (e.g., budget ceiling, no warranties).',
    telemetryMetric: 'NLP Ingestion'
  },
  {
    id: 'ai-extraction',
    step: '02',
    name: 'AI Intent Extraction',
    category: 'INTENT',
    trustLevel: 'UNTRUSTED',
    purpose: 'Parses unstructured text into candidate JSON schema fields without granting authorization privilege.',
    securityResponsibility: 'Fails closed if the LLM output is malformed or injects invalid fields.',
    role: 'Transforms "Buy laptop under 80k without warranty" into structured parameter candidates.',
    telemetryMetric: 'Pydantic Strict Gate'
  },
  {
    id: 'intent-contract',
    step: '03',
    name: 'Trusted Intent Contract',
    category: 'INTENT',
    trustLevel: 'TRUSTED_GATEWAY',
    purpose: 'Stores validated, user-owned immutable constraints in PostgreSQL with cryptographic tenant isolation.',
    securityResponsibility: 'The definitive Ground Truth. Cannot be mutated by the AI agent or subsequent requests.',
    role: 'Establishes the inviolable financial perimeter (Max Total, Banned Categories, Currency, Recurring Flags).',
    telemetryMetric: 'Row-Level Isolation'
  },
  {
    id: 'ai-agent',
    step: '04',
    name: 'Autonomous AI Agent',
    category: 'AGENT',
    trustLevel: 'UNTRUSTED',
    purpose: 'Explores merchant APIs, aggregates items, and negotiates cart state on behalf of the user.',
    securityResponsibility: 'Operates in an untrusted sandbox with ZERO payment execution privileges.',
    role: 'Selects the specific products, merchant, and pricing to propose back to PayGuard.',
    telemetryMetric: 'Zero Direct Capture'
  },
  {
    id: 'txn-contract',
    step: '05',
    name: 'Transaction Contract',
    category: 'AGENT',
    trustLevel: 'UNTRUSTED',
    purpose: 'The formal JSON proposal submitted by the AI agent referencing the target Intent Contract ID.',
    securityResponsibility: 'Subjected to strict Pydantic non-negative validation (`ge=0.0`) and idempotency verification.',
    role: 'Carries itemized SKU arrays, quantities, merchant metadata, and proposed totals.',
    telemetryMetric: 'Payload Hashing'
  },
  {
    id: 'policy-engine',
    step: '06',
    name: 'Deterministic Policy Engine',
    category: 'POLICY',
    trustLevel: 'DETERMINISTIC_CORE',
    purpose: 'Performs mathematical constraint comparisons between the Intent Contract and Transaction Contract in pure Python.',
    securityResponsibility: 'Evaluates amount limits, category case-normalization, currency match, quantity ceilings, and recurring status with zero LLM hallucination risk.',
    role: 'Generates structured, auditable `Violation` items for every failed constraint.',
    telemetryMetric: '100% Deterministic'
  },
  {
    id: 'decision-engine',
    step: '07',
    name: 'Decision & Violation Engine',
    category: 'DECISION',
    trustLevel: 'DETERMINISTIC_CORE',
    purpose: 'Calculates the definitive authorization verdict (`APPROVE`, `ASK`, `BLOCK`) and human-readable explanation.',
    securityResponsibility: 'Ensures only unviolated transactions receive `APPROVE`. Dispatches immutable audit events.',
    role: 'Gates progression toward payment execution or halts unauthorized requests.',
    telemetryMetric: 'Immutable Audit Log'
  },
  {
    id: 'capture-gate',
    step: '08',
    name: 'Payment Capture Gate',
    category: 'EXECUTION',
    trustLevel: 'TRUSTED_GATEWAY',
    purpose: 'Security barrier verifying that the evaluation status is `APPROVE` before invoking the payment provider.',
    securityResponsibility: 'Enforces anti-replay (`payment_status != CAPTURED`), cross-user IDOR protection, and server-side amount extraction.',
    role: 'Guarantees the external payment gateway is NEVER contacted on `BLOCK` or unapproved `ASK`.',
    telemetryMetric: '0 Unauthorized Calls'
  },
  {
    id: 'razorpay-rail',
    step: '09',
    name: 'Razorpay Execution Rail',
    category: 'EXECUTION',
    trustLevel: 'PAYMENT_RAIL',
    purpose: 'Decoupled banking and card settlement gateway executing the authorized fund movement.',
    securityResponsibility: 'Verifies HMAC-SHA256 webhook signatures and completes capture strictly upon gate clearance.',
    role: 'Executes the financial transaction once deterministic authorization is secured.',
    telemetryMetric: 'HMAC SHA-256 Auth'
  }
];
