from typing import List
from app.schemas.evaluation import Violation, DecisionType, ViolationCode

class ExplanationEngine:
    @staticmethod
    def generate(decision: DecisionType, violations: List[Violation]) -> str:
        if decision == DecisionType.APPROVE:
            return "Payment approved because no constraints were violated."
            
        parts = []
        for v in violations:
            if v.code == ViolationCode.MAX_AMOUNT_EXCEEDED:
                parts.append(f"the transaction exceeds the user's {v.expected} budget")
            elif v.code == ViolationCode.CURRENCY_MISMATCH:
                parts.append(f"the currency {v.actual} does not match the allowed {v.expected}")
            elif v.code == ViolationCode.BANNED_CATEGORY:
                parts.append(f"it includes a banned or not allowed category ({v.actual})")
            elif v.code == ViolationCode.RECURRING_PAYMENT_NOT_ALLOWED:
                parts.append("it contains an unapproved recurring payment")
            elif v.code == ViolationCode.MAX_QUANTITY_EXCEEDED:
                parts.append(f"the quantity exceeds the allowed limit of {v.expected}")
            elif v.code == ViolationCode.MERCHANT_BLOCKED:
                if v.constraint.endswith("blocklist"):
                    parts.append("the merchant is blocked")
                else:
                    parts.append("the merchant is not on the allowlist")
            else:
                parts.append(f"it violated the {v.code} constraint")
                
        if not parts:
            if decision == DecisionType.ASK:
                return "Payment requires manual review."
            return "Payment blocked due to unknown policy violations."
            
        action = "blocked" if decision == DecisionType.BLOCK else "requires review"
        
        if len(parts) == 1:
            reasons = parts[0]
        elif len(parts) == 2:
            reasons = f"{parts[0]} and {parts[1]}"
        else:
            reasons = ", ".join(parts[:-1]) + f", and {parts[-1]}"
            
        return f"Payment {action} because {reasons}."

explanation_engine = ExplanationEngine()
