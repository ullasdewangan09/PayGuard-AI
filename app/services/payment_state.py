from datetime import datetime
from typing import Iterable


PAYMENT_CREATED = "CREATED"
PAYMENT_CHECKOUT_STARTED = "CHECKOUT_STARTED"
PAYMENT_AUTHORIZED = "AUTHORIZED"
PAYMENT_CAPTURE_PENDING = "CAPTURE_PENDING"
PAYMENT_CAPTURED = "CAPTURED"
PAYMENT_FAILED = "FAILED"
PAYMENT_CANCELLED = "CANCELLED"
PAYMENT_REFUNDED = "REFUNDED"

TERMINAL_PAYMENT_STATES = {PAYMENT_CAPTURED, PAYMENT_CANCELLED, PAYMENT_REFUNDED}

ALLOWED_PAYMENT_TRANSITIONS = {
    PAYMENT_CREATED: {PAYMENT_CHECKOUT_STARTED, PAYMENT_AUTHORIZED, PAYMENT_FAILED, PAYMENT_CANCELLED, PAYMENT_CAPTURED},
    PAYMENT_CHECKOUT_STARTED: {PAYMENT_AUTHORIZED, PAYMENT_FAILED, PAYMENT_CANCELLED},
    PAYMENT_AUTHORIZED: {PAYMENT_CAPTURE_PENDING, PAYMENT_CAPTURED, PAYMENT_FAILED},
    PAYMENT_CAPTURE_PENDING: {PAYMENT_CAPTURED, PAYMENT_FAILED},
    PAYMENT_FAILED: {PAYMENT_AUTHORIZED, PAYMENT_CAPTURE_PENDING, PAYMENT_CAPTURED},
    PAYMENT_CANCELLED: set(),
    PAYMENT_CAPTURED: {PAYMENT_REFUNDED},
    PAYMENT_REFUNDED: set(),
}


def can_transition(current: str, target: str) -> bool:
    if current == target:
        return True
    return target in ALLOWED_PAYMENT_TRANSITIONS.get(current, set())


def transition_payment(transaction, target: str, allowed_from: Iterable[str] | None = None) -> None:
    current = transaction.payment_status or PAYMENT_CREATED
    if allowed_from is not None and current not in allowed_from:
        raise ValueError(f"Cannot transition payment from {current} to {target}")
    if not can_transition(current, target):
        raise ValueError(f"Cannot transition payment from {current} to {target}")
    transaction.payment_status = target
    transaction.updated_at = datetime.utcnow()
    if target == PAYMENT_AUTHORIZED:
        transaction.authorized_at = transaction.authorized_at or datetime.utcnow()
    if target == PAYMENT_CAPTURED:
        transaction.captured_at = transaction.captured_at or datetime.utcnow()
