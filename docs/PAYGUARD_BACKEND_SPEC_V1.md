# PayGuard AI - Backend Specification V1

## 1. Objective
PayGuard is a payment authorization and control layer for AI-native commerce. This document specifies the backend architecture for evaluating proposed AI agent transactions against a user's natural-language derived constraints deterministically, before payment capture.

## 2. Scope
This specification covers the core backend system responsible for:
- Storing user purchasing intent (Intent Contract)
- Receiving AI agent proposed transactions (Transaction Contract)
- Deterministically evaluating transactions against policy constraints
- Generating violations and authorization decisions (APPROVE, ASK, BLOCK)
- Providing explanation and audit trails

## 3. Non-goals
- Generating fuzzy "intent drift scores". All policy evaluations are deterministic.
- Acting as an LLM evaluation/benchmarking tool.
- Replacing existing payment protocols (AP2, ACP, etc.).
- Frontend development or UI rendering.
- Actual payment capture (Razorpay integration is reserved for a future phase).

## 4. Architecture
The system will be a **Modular Monolith** built with:
- **Language**: Python 3.12+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0 with Pydantic for validation
- **Migrations**: Alembic
- **Testing**: pytest

## 5. Module Responsibilities
- **Authentication/User module**: Manages user identity and access boundaries.
- **Intent module**: Manages the storage and lifecycle of Intent Contracts.
- **Intent Parser**: (Boundary Interface) Converts natural language to Intent Contract (LLM-based, but outputs strict schema).
- **Transaction module**: Manages the storage and lifecycle of proposed Transaction Contracts.
- **Policy Engine / Constraint Evaluator**: Core deterministic logic evaluating constraints.
- **Violation Engine**: Standardizes and records constraint violations.
- **Decision Engine**: Resolves violations into a final APPROVE/ASK/BLOCK status.
- **Explanation Engine**: Generates human-readable explanations based solely on deterministic violations.
- **Audit Service**: Records immutable events (intents, evaluations, decisions) for traceability.
- **Payment Provider Abstraction**: Interface for future payment gateways (e.g., Razorpay).

## 6. Intent Contract
A structured representation of a user's purchase constraints.

```json
{
  "id": "int_01H...",
  "user_id": "usr_01H...",
  "status": "ACTIVE",
  "currency": "INR",
  "max_total_amount": 8000.00,
  "allowed_categories": ["electronics", "headphones"],
  "banned_categories": ["subscriptions", "warranties"],
  "max_quantity": 1,
  "recurring_payment_allowed": false,
  "merchant_restrictions": {
    "type": "NONE",
    "list": []
  },
  "created_at": "2026-08-24T18:00:00Z",
  "version": 1
}
```

## 7. Transaction Contract
A structured representation of the AI-proposed transaction to be evaluated.

```json
{
  "id": "txn_01H...",
  "intent_id": "int_01H...",
  "agent_id": "agt_01H...",
  "merchant": {
    "id": "mch_123",
    "name": "TechStore India"
  },
  "currency": "INR",
  "items": [
    {
      "name": "Wireless Headphones X1",
      "category": "headphones",
      "unit_price": 7499.00,
      "quantity": 1,
      "is_subscription": false
    },
    {
      "name": "Extended Warranty 1Yr",
      "category": "warranties",
      "unit_price": 1999.00,
      "quantity": 1,
      "is_subscription": false
    }
  ],
  "shipping_amount": 199.00,
  "tax_amount": 0.00,
  "total_amount": 9697.00,
  "has_recurring_payment": false
}
```

## 8. Constraint Model
The Evaluator checks specific constraints. Each constraint yields `PASS`, `FAIL`, or `NOT_APPLICABLE`.

Constraints:
- `MAX_AMOUNT`: Checks if `Transaction.total_amount <= Intent.max_total_amount`.
- `CURRENCY_MATCH`: Checks if currencies match exactly.
- `BANNED_CATEGORY`: Checks if any item category is in `Intent.banned_categories`.
- `RECURRING_PAYMENT`: Checks if `has_recurring_payment` matches `recurring_payment_allowed`.
- `MAX_QUANTITY`: Checks if total physical item quantity `<= Intent.max_quantity`.

## 9. Violation Model
Standardized violation schema produced by failing constraints.

```json
{
  "violation_id": "vio_01H...",
  "evaluation_id": "eval_01H...",
  "code": "MAX_AMOUNT_EXCEEDED",
  "constraint": "max_total_amount",
  "expected": "8000.00",
  "actual": "9697.00",
  "severity": "HARD"
}
```

## 10. Decision Model
Determines the final transaction outcome based on violations.
- **APPROVE**: Zero violations.
- **BLOCK**: One or more `HARD` severity violations (e.g., max amount exceeded, banned category).
- **ASK**: Only `SOFT` severity violations (e.g., amount exceeded by < 2%, merchant not on preferred list). Requires user confirmation.

## 11. Explanation Model
Generates user-friendly text from violations.
* Input: List of Violation objects.
* Rule: MUST NOT invent new violations. MUST map deterministic violation codes to template or constrained-LLM explanations.

## 12. Database Schema (PostgreSQL)
- `users`: id, email, created_at
- `intents`: id, user_id, intent_jsonb, status, created_at
- `transactions`: id, intent_id, transaction_jsonb, status, created_at
- `evaluations`: id, transaction_id, decision (APPROVE/ASK/BLOCK), created_at
- `violations`: id, evaluation_id, code, severity, expected, actual
- `audit_events`: id, entity_type, entity_id, event_type, payload, created_at

## 13. API Specification (REST)
- `POST /api/v1/intents` - Create a new Intent Contract.
- `POST /api/v1/transactions` - Submit a Transaction Contract for evaluation.
- `GET /api/v1/evaluations/{id}` - Retrieve the decision, violations, and explanation.
- `POST /api/v1/evaluations/{id}/approve` - User explicitly approves an ASK decision.

## 14. Authentication
- Bearer Token (JWT) based authentication for users.
- API Key authentication for authorized AI agents submitting transactions.

## 15. Authorization
- Users can only view/manage their own intents and transactions.
- Agents can only submit transactions against intents they are delegated to.

## 16. Security Model
- **Untrusted data**: All transaction data from the AI agent is considered untrusted.
- PayGuard Policy is the source of truth and CANNOT be modified by the agent.
- Strong input validation via Pydantic to prevent malformed transactions or injection attacks.

## 17. Threat Model
- **Agent Manipulation**: AI agents might try to bundle hidden costs. Mitigated by strict itemized checks and total amount checks.
- **Policy Bypass**: Agent sends string values instead of ints. Mitigated by strict schema typing.
- **Replay Attacks**: Duplicate transaction submissions. Mitigated by idempotency keys.

## 18. Idempotency
- All `POST` endpoints must accept an `Idempotency-Key` header.
- Cached in PostgreSQL (or simple memory store for V1) against the user/agent ID.
- Repeat requests with the same key return the original response without re-processing.

## 19. Error Handling
Consistent JSON error structure:
```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "code": "INVALID_CURRENCY",
    "message": "Currency USD is not supported.",
    "details": []
  }
}
```

## 20. Logging & Observability
- Structured JSON logging.
- Every log entry includes: `request_id`, `user_id` (if available), `intent_id`, and `transaction_id`.
- Audit table acts as a permanent, queryable log for business events.

## 21. Testing Strategy
- **Unit Tests**: Full coverage of the Policy Engine, Constraint Evaluator, and Decision Engine using pytest.
- **Integration Tests**: API flow from Intent creation -> Transaction submission -> Evaluation response. Test database interactions.
- **Business Scenarios**: Explicit test cases for valid transactions, budget exceeded, subscription violations, and ASK scenarios.

## 22. Evaluation Requirements
- System must log Expected vs Actual decisions for offline benchmarking.
- Database schema supports querying evaluation accuracy (precision/recall of the LLM vs the Deterministic engine).

## 23. Future Razorpay Boundary
- An abstract `PaymentProvider` class will be defined.
- `RazorpayProvider` will implement this interface in Phase 4.
- The Decision Engine will trigger the `PaymentProvider.capture()` method only if the decision is `APPROVE`.

## 24. Backend V1 Scope
- Project scaffolding (FastAPI, SQLAlchemy, Alembic).
- User and Intent basic models.
- Core Policy Engine and Decision Engine.
- Endpoints for Intent creation and Transaction submission.
- Complete unit and integration tests for deterministic rules.

## 25. Backend V2 Scope
- Audit Service implementation.
- Explanation Engine (converting violations to human text).
- Idempotency implementation.
- Security hardening and advanced input validation.
- Enhanced evaluation and metrics logging.

## 26. Open Questions
- What is the exact TTL for an unfulfilled Intent Contract?
- Should we support dynamic soft-constraint thresholds (e.g., amount exceeded by X%)?
- How do we handle multi-currency conversions if the intent and transaction currencies differ?
