# PAYGUARD AI — ATTACK LAB REPORT

## 1. Purpose
The Attack Lab is an external adversarial testing harness built to simulate a rogue AI agent trying to bypass PayGuard's authorization boundaries. It verifies that the deterministic PayGuard engine enforces constraints regardless of agent behavior or payload injection.

## 2. Threat Model
- **Actors**: Malicious AI agents, compromised frontends, external actors with API access.
- **Objective**: Authorize transactions that violate user intents, hijack payments, or bypass capture constraints.
- **Surface**: `POST /api/v1/transactions/`, `POST /api/v1/transactions/{id}/capture`, `POST /api/v1/webhooks/razorpay`, `POST /api/v1/ai/extract`

## 3. Attack Categories Tested
1. **AG-A01**: Financial Limit Bypass (Amount > Max)
2. **AG-B01**: Hidden Cost Injection (Banned category in items)
3. **AG-C01**: Recurring Payment Injection 
4. **AG-D01**: Policy Injection in Transaction
5. **AG-E01**: Currency Manipulation
6. **AG-F01**: Quantity Manipulation
7. **AG-G01**: Banned Category Bypass (Casing)
8. **AG-L01**: Cross-User IDOR (Transaction on foreign intent)
9. **AG-M01**: Idempotency Abuse (Mismatched payload)
10. **AG-O01**: Webhook Forgery (Invalid Signature)
11. **AG-Q01**: Negative Amount Validation
12. **AG-S01**: AI Output Abuse (Injecting APPROVE)

## 4. Results
Total Attacks: 12
Passed (Blocked by PayGuard): 12
Failed (Bypassed PayGuard): 0
Critical Bypasses: 0

## 5. Critical Findings & Vulnerabilities Discovered
During the initial execution, two vulnerabilities were discovered:
1. **Case-Sensitive Category Evasion (AG-G01)**: The policy engine was previously checking banned and allowed categories case-sensitively, allowing `"games"` to bypass a ban on `"GAMES"`. 
2. **Webhook Verification Bypass (AG-O01)**: The Razorpay provider was configured to assume a signature was valid if no `WEBHOOK_SECRET` was set in the environment, which fails open locally.

## 6. Fixes Implemented
1. **Category Normalization**: Modified `app/policies/engine.py` to compare categories using `.lower()`.
2. **Fail-Closed Webhooks**: Modified `app/providers/razorpay_provider.py` to return `False` when the `WEBHOOK_SECRET` is unset, enforcing a safe fail-closed path.

## 7. Razorpay Capture Safety
In all 12 rejected attacks (whether blocked by the policy engine, validation, IDOR, or signature mismatch), the Razorpay capture API was called exactly **0** times. This proves the capture gate functions flawlessly.

## 8. Remaining Limitations
None discovered in the tested scope. Rate limiting remains an unaddressed vector for denial of service, but financial policy is intact.
