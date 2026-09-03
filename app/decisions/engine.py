from typing import List
from app.schemas.evaluation import Violation, DecisionType, ViolationSeverity

class DecisionEngine:
    def decide(self, violations: List[Violation]) -> DecisionType:
        if not violations:
            return DecisionType.APPROVE
            
        has_hard_violation = any(v.severity == ViolationSeverity.HARD for v in violations)
        if has_hard_violation:
            return DecisionType.BLOCK
            
        return DecisionType.ASK

decision_engine = DecisionEngine()
