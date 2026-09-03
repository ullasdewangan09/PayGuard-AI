import pytest
from app.services.explanation import explanation_engine
from app.schemas.evaluation import DecisionType, Violation, ViolationCode, ViolationSeverity

def test_explanation_approve():
    explanation = explanation_engine.generate(DecisionType.APPROVE, [])
    assert "approved" in explanation.lower()
    assert "no constraints were violated" in explanation.lower()

def test_explanation_ask():
    violations = [
        Violation(
            code=ViolationCode.MERCHANT_BLOCKED,
            constraint="merchant_restrictions.allowlist",
            expected="In allowlist",
            actual="m_untrusted",
            severity=ViolationSeverity.SOFT
        )
    ]
    explanation = explanation_engine.generate(DecisionType.ASK, violations)
    assert "requires review" in explanation.lower()
    assert "not on the allowlist" in explanation.lower()

def test_explanation_block_max_amount():
    violations = [
        Violation(
            code=ViolationCode.MAX_AMOUNT_EXCEEDED,
            constraint="max_amount",
            expected="8000",
            actual="9000",
            severity=ViolationSeverity.HARD
        )
    ]
    explanation = explanation_engine.generate(DecisionType.BLOCK, violations)
    assert "blocked" in explanation.lower()
    assert "exceeds the user's 8000 budget" in explanation.lower()

def test_explanation_multiple_violations():
    violations = [
        Violation(
            code=ViolationCode.MAX_AMOUNT_EXCEEDED,
            constraint="max_amount",
            expected="8000",
            actual="9000",
            severity=ViolationSeverity.HARD
        ),
        Violation(
            code=ViolationCode.CURRENCY_MISMATCH,
            constraint="currency",
            expected="INR",
            actual="USD",
            severity=ViolationSeverity.HARD
        ),
        Violation(
            code=ViolationCode.BANNED_CATEGORY,
            constraint="banned_categories",
            expected="Not in ['weapons']",
            actual="weapons",
            severity=ViolationSeverity.HARD
        )
    ]
    explanation = explanation_engine.generate(DecisionType.BLOCK, violations)
    assert "blocked" in explanation.lower()
    assert "exceeds the user's 8000 budget" in explanation.lower()
    assert "currency usd does not match" in explanation.lower()
    assert "and it includes a banned" in explanation.lower()
