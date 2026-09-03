import pytest
from app.decisions.engine import decision_engine
from app.schemas.evaluation import Violation, ViolationCode, ViolationSeverity, DecisionType

def test_decision_engine_approve():
    decision = decision_engine.decide([])
    assert decision == DecisionType.APPROVE

def test_decision_engine_block_single_hard():
    violations = [
        Violation(
            code=ViolationCode.MAX_AMOUNT_EXCEEDED,
            constraint="max_amount",
            expected="100",
            actual="200",
            severity=ViolationSeverity.HARD
        )
    ]
    decision = decision_engine.decide(violations)
    assert decision == DecisionType.BLOCK

def test_decision_engine_ask_single_soft():
    violations = [
        Violation(
            code=ViolationCode.MERCHANT_BLOCKED,
            constraint="allowlist",
            expected="true",
            actual="false",
            severity=ViolationSeverity.SOFT
        )
    ]
    decision = decision_engine.decide(violations)
    assert decision == DecisionType.ASK

def test_decision_engine_precedence_hard_and_soft():
    violations = [
        Violation(
            code=ViolationCode.MERCHANT_BLOCKED,
            constraint="allowlist",
            expected="true",
            actual="false",
            severity=ViolationSeverity.SOFT
        ),
        Violation(
            code=ViolationCode.MAX_AMOUNT_EXCEEDED,
            constraint="max_amount",
            expected="100",
            actual="200",
            severity=ViolationSeverity.HARD
        )
    ]
    decision = decision_engine.decide(violations)
    assert decision == DecisionType.BLOCK

def test_decision_engine_multiple_hard():
    violations = [
        Violation(
            code=ViolationCode.MAX_AMOUNT_EXCEEDED,
            constraint="max_amount",
            expected="100",
            actual="200",
            severity=ViolationSeverity.HARD
        ),
        Violation(
            code=ViolationCode.CURRENCY_MISMATCH,
            constraint="currency",
            expected="INR",
            actual="USD",
            severity=ViolationSeverity.HARD
        )
    ]
    decision = decision_engine.decide(violations)
    assert decision == DecisionType.BLOCK

def test_decision_engine_multiple_soft():
    violations = [
        Violation(
            code=ViolationCode.MERCHANT_BLOCKED,
            constraint="allowlist",
            expected="true",
            actual="false",
            severity=ViolationSeverity.SOFT
        ),
        Violation(
            code=ViolationCode.MERCHANT_BLOCKED,
            constraint="another_soft",
            expected="true",
            actual="false",
            severity=ViolationSeverity.SOFT
        )
    ]
    decision = decision_engine.decide(violations)
    assert decision == DecisionType.ASK
