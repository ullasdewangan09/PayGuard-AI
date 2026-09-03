from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class IntentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    FULFILLED = "FULFILLED"

class MerchantRestrictionType(str, Enum):
    NONE = "NONE"
    ALLOWLIST = "ALLOWLIST"
    BLOCKLIST = "BLOCKLIST"

class MerchantRestrictions(BaseModel):
    type: MerchantRestrictionType = Field(default=MerchantRestrictionType.NONE)
    list: List[str] = Field(default_factory=list)

class IntentContractBase(BaseModel):
    currency: str = Field(..., max_length=3)
    max_total_amount: float = Field(..., ge=0.0)
    allowed_categories: List[str] = Field(default_factory=list)
    banned_categories: List[str] = Field(default_factory=list)
    max_quantity: Optional[int] = Field(None, ge=0)
    recurring_payment_allowed: bool = False
    merchant_restrictions: MerchantRestrictions = Field(default_factory=MerchantRestrictions)

class IntentContractCreate(IntentContractBase):
    pass

class IntentContract(IntentContractBase):
    id: str
    user_id: str
    status: IntentStatus
    created_at: datetime
    version: int

    class Config:
        from_attributes = True
