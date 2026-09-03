from typing import List, Optional
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class DecisionType(str, Enum):
    APPROVE = "APPROVE"
    ASK = "ASK"
    BLOCK = "BLOCK"

class ViolationSeverity(str, Enum):
    HARD = "HARD"
    SOFT = "SOFT"

class ViolationCode(str, Enum):
    MAX_AMOUNT_EXCEEDED = "MAX_AMOUNT_EXCEEDED"
    CURRENCY_MISMATCH = "CURRENCY_MISMATCH"
    BANNED_CATEGORY = "BANNED_CATEGORY"
    RECURRING_PAYMENT_NOT_ALLOWED = "RECURRING_PAYMENT_NOT_ALLOWED"
    MAX_QUANTITY_EXCEEDED = "MAX_QUANTITY_EXCEEDED"
    MERCHANT_BLOCKED = "MERCHANT_BLOCKED"

class Violation(BaseModel):
    code: ViolationCode
    constraint: str
    expected: str
    actual: str
    severity: ViolationSeverity

class EvaluationResult(BaseModel):
    id: Optional[str] = None
    transaction_id: str
    decision: DecisionType
    violations: List[Violation]
    created_at: Optional[datetime] = None
    explanation: Optional[str] = None
    expected_decision: Optional[DecisionType] = None
    razorpay_order_id: Optional[str] = None

    class Config:
        from_attributes = True
