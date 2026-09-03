# PayGuard Payment Lifecycle Report

Date: 2026-08-30

## Payment Gateway

Razorpay remains the only payment gateway. PayGuard creates Razorpay Orders and uses Razorpay payment IDs for server-side payment verification and capture.

## Payment Methods

The backend does not collect raw card, UPI, bank, wallet, or credential details. Razorpay Checkout owns method availability based on merchant-account configuration. Optional `RAZORPAY_CHECKOUT_METHODS` can provide Checkout hints without hardcoding unsupported account methods.

## Lifecycle

PayGuard keeps authorization state separate from payment state:

- Authorization: `PENDING`, `APPROVE`, `ASK`, `BLOCK`
- Payment: `CREATED`, `CHECKOUT_STARTED`, `AUTHORIZED`, `CAPTURE_PENDING`, `CAPTURED`, `FAILED`, `CANCELLED`, `REFUNDED`

Capture is allowed only when the persisted PayGuard decision is `APPROVE`. The client cannot send a capture amount; amount and currency are read from the stored transaction contract.

## Server Verification

Capture verifies:

- Razorpay order/payment association
- Razorpay checkout signature when supplied
- expected amount when returned by Razorpay
- expected currency when returned by Razorpay
- payment status is authorized/captured
- user owns the transaction intent
- PayGuard decision is `APPROVE`

## Webhooks

Razorpay webhooks require `x-razorpay-signature` and fail closed when unsigned or invalid. Webhooks are deduplicated by Razorpay event ID or a SHA-256 payload fingerprint. Webhooks update payment lifecycle fields only and never rewrite PayGuard authorization decisions.

## Receipts

Captured payments create one idempotent receipt per transaction. Receipt public IDs are opaque, ownership is enforced, and `GET /api/v1/receipts/{receipt_id}` returns a server-generated PDF.

## Notifications

Notifications are delivered through provider abstractions:

- Email: mock or SMTP provider
- SMS: mock provider abstraction
- WhatsApp: mock provider abstraction

Delivery rows track channel, event type, status, provider message ID, attempt count, timing, and idempotency key. Notification failure is independent from payment state.

## Status API

`GET /api/v1/orders/{order_id}` returns safe order/payment/receipt/notification status for the owning user. It accepts the internal transaction ID or Razorpay order ID.

## Security Notes

- BLOCK and unapproved ASK cannot capture.
- Duplicate capture returns conflict.
- Webhook replay does not duplicate receipts or notifications.
- Receipt access is owner-filtered.
- Provider secrets are environment-configured and not committed.
- Sensitive credentials such as card numbers, CVV, UPI PINs, banking passwords, API secrets, and webhook secrets are not stored or logged.

## Known Limitations

- SMS and WhatsApp real-provider integrations are intentionally replaceable abstractions with mock implementations until a provider is selected.
- Rate limiting remains a future hardening step; no rate-limit library was introduced in this pass.
- Refund initiation remains future work; webhook refund state tracking is supported.
