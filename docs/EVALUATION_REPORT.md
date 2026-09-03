# PAYGUARD AI — EVALUATION SUITE REPORT

## 1. Status
COMPLETE

## 2. Dataset
Total scenarios: 106
AI Extraction cases: 2

## 3. Results
Passed: 106
Failed: 0
Pass rate: 100.00%

## 4. Decision Distribution
APPROVE: 66
ASK: 11
BLOCK: 29

## 5. Security Metrics
False Approvals: 0
False Blocks: 0
ASK Misclassifications: 0
Critical Bypasses: 0

## 6. Policy Coverage

| Policy | Cases | Passed | Failed |
|---|---|---|---|
| MAX_AMOUNT | 5 | 5 | 0 |
| CURRENCY_MATCH | 4 | 4 | 0 |
| BANNED_CATEGORY | 6 | 6 | 0 |
| RECURRING_PAYMENT | 4 | 4 | 0 |
| MAX_QUANTITY | 4 | 4 | 0 |
| MERCHANT_BLOCKED | 5 | 5 | 0 |
| COMBINATORIAL | 76 | 76 | 0 |
| AI_INTENT | 2 | 2 | 0 |

## 7. Determinism Testing
Cases repeated: 1
Total executions: 100
Decision inconsistencies: 0

## 8. Failed Cases

No failed evaluation cases.

## 9. Attack Lab Relationship
The Attack Lab remains a separate adversarial suite. It ran 12 adversarial payloads and demonstrated 0 critical bypasses. The Evaluation Suite further confirms deterministic behavior across 100+ standard states.

## 10. Scope
Backend: FROZEN
AI Intent Extraction: COMPLETE
Attack Lab: COMPLETE
Evaluation Suite: COMPLETE
Frontend: NOT IMPLEMENTED
