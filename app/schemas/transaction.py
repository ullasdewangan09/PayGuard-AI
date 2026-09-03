from typing import List, Optional
from pydantic import BaseModel, Field

class MerchantInfo(BaseModel):
    id: str
    name: str

class TransactionItem(BaseModel):
    name: str
    category: str
    unit_price: float = Field(..., ge=0.0)
    quantity: int = Field(..., ge=0)
    is_subscription: bool = False

class TransactionContractBase(BaseModel):
    intent_id: str
    merchant: MerchantInfo
    currency: str = Field(..., max_length=3)
    items: List[TransactionItem]
    shipping_amount: float = Field(default=0.0, ge=0.0)
    tax_amount: float = Field(default=0.0, ge=0.0)
    total_amount: float = Field(..., ge=0.0)
    has_recurring_payment: bool = False

class TransactionContractCreate(TransactionContractBase):
    expected_decision: Optional[str] = None

class TransactionContract(TransactionContractBase):
    id: str
    agent_id: str
    status: str = "PENDING"
    created_at: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    payment_status: str = "CREATED"

    class Config:
        from_attributes = True
