# AI Intent Extraction Engine

## Purpose
The AI Intent Extraction engine translates natural-language user requests into strictly structured `IntentContract` payloads. This allows users to articulate complex financial policies without writing JSON manually.

## Architecture & Trust Boundary
1. **User Request**: "Buy me a laptop under 80000 INR. No warranties."
2. **AI Provider (Untrusted)**: Interprets the text and attempts to generate a structured JSON output.
3. **Pydantic Validation (Gatekeeper)**: The raw AI output is strictly parsed into an `IntentContractCreate` schema. Any negative amounts, wrong data types, or hallucinated fields (e.g. attempting to override `decision: APPROVE`) are actively rejected, and the request fails closed.
4. **PayGuard Policy Engine (Authorizer)**: Only a structurally sound Intent is stored and later utilized by the deterministic deterministic Policy Engine to decide whether to authorize a given transaction.

### Crucial Distinction
**The AI interprets. PayGuard authorizes. Razorpay executes.**
At no point can the AI directly execute a payment or circumvent the server-side deterministic policy constraints.

## Validation & Failure Handling
- **Hallucinations**: Ignored or rejected depending on schema strictness.
- **Provider Timeout/Failure**: Handled gracefully. No Intent is created.
- **Security Validation**: `max_total_amount` must be `>= 0.0`. `max_quantity` must be `>= 0`.

## Endpoints
- `POST /api/v1/ai/extract`
  - Accepts `AIIntentRequest` (text)
  - Returns `AIIntentResponse` containing the valid `IntentContractCreate` payload or a safe validation error.
