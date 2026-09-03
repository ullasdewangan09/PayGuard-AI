import pytest
from app.schemas.intent import IntentContract, MerchantRestrictions, MerchantRestrictionType
from app.schemas.transaction import TransactionContract, MerchantInfo, TransactionItem
from app.policies.engine import policy_engine
from app.schemas.evaluation import ViolationCode

@pytest.fixture
def base_intent():
    return IntentContract(
        id="int_123",
        user_id="usr_123",
        status="ACTIVE",
        created_at="2026-08-24T18:00:00Z",
        version=1,
        currency="INR",
        max_total_amount=8000.0,
        banned_categories=["warranties"],
        recurring_payment_allowed=False,
        merchant_restrictions=MerchantRestrictions()
    )

@pytest.fixture
def base_transaction():
    return TransactionContract(
        id="txn_123",
        agent_id="agt_123",
        status="PENDING",
        created_at="2026-08-24T18:00:00Z",
        intent_id="int_123",
        merchant=MerchantInfo(id="mch_123", name="Store"),
        currency="INR",
        items=[
            TransactionItem(name="Headphones", category="electronics", unit_price=7500.0, quantity=1)
        ],
        total_amount=7500.0
    )

def test_policy_engine_pass(base_intent, base_transaction):
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

# --- MAX_AMOUNT TESTS ---
def test_policy_engine_max_amount_exact_boundary(base_intent, base_transaction):
    base_transaction.total_amount = 8000.0
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

def test_policy_engine_max_amount_just_above_boundary(base_intent, base_transaction):
    base_transaction.total_amount = 8000.01
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MAX_AMOUNT_EXCEEDED

def test_policy_engine_max_amount_exceeded(base_intent, base_transaction):
    base_transaction.total_amount = 8500.0
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MAX_AMOUNT_EXCEEDED

# Negative amounts are handled by Pydantic validation on the API layer, but if passed down:
def test_policy_engine_amount_zero(base_intent, base_transaction):
    base_transaction.total_amount = 0.0
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

# --- CURRENCY TESTS ---
def test_policy_engine_currency_mismatch(base_intent, base_transaction):
    base_transaction.currency = "USD"
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.CURRENCY_MISMATCH

def test_policy_engine_currency_case_sensitive(base_intent, base_transaction):
    base_transaction.currency = "inr" # lowercase
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.CURRENCY_MISMATCH

# --- CATEGORY TESTS ---
def test_policy_engine_banned_category(base_intent, base_transaction):
    base_transaction.items.append(
        TransactionItem(name="Warranty", category="warranties", unit_price=100.0, quantity=1)
    )
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.BANNED_CATEGORY

def test_policy_engine_allowed_category(base_intent, base_transaction):
    base_intent.allowed_categories = ["electronics"]
    # Transaction already has "electronics"
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

def test_policy_engine_not_in_allowed_category(base_intent, base_transaction):
    base_intent.allowed_categories = ["books"]
    # Transaction has "electronics"
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.BANNED_CATEGORY

# --- RECURRING PAYMENT TESTS ---
def test_policy_engine_recurring_payment(base_intent, base_transaction):
    base_transaction.has_recurring_payment = True
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.RECURRING_PAYMENT_NOT_ALLOWED

def test_policy_engine_item_subscription(base_intent, base_transaction):
    base_transaction.items[0].is_subscription = True
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.RECURRING_PAYMENT_NOT_ALLOWED

# --- QUANTITY TESTS ---
def test_policy_engine_max_quantity_exact(base_intent, base_transaction):
    base_intent.max_quantity = 2
    base_transaction.items[0].quantity = 2
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

def test_policy_engine_max_quantity_exceeded(base_intent, base_transaction):
    base_intent.max_quantity = 1
    base_transaction.items[0].quantity = 2
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MAX_QUANTITY_EXCEEDED

def test_policy_engine_max_quantity_aggregated(base_intent, base_transaction):
    base_intent.max_quantity = 2
    base_transaction.items.append(
        TransactionItem(name="Cable", category="electronics", unit_price=10.0, quantity=2)
    ) # total = 1 + 2 = 3
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MAX_QUANTITY_EXCEEDED

def test_policy_engine_quantity_zero(base_intent, base_transaction):
    base_intent.max_quantity = 1
    base_transaction.items[0].quantity = 0
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

# --- MERCHANT TESTS ---
def test_policy_engine_merchant_blocklist_hit(base_intent, base_transaction):
    base_intent.merchant_restrictions = MerchantRestrictions(
        type=MerchantRestrictionType.BLOCKLIST,
        list=["mch_123"]
    )
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MERCHANT_BLOCKED

def test_policy_engine_merchant_blocklist_miss(base_intent, base_transaction):
    base_intent.merchant_restrictions = MerchantRestrictions(
        type=MerchantRestrictionType.BLOCKLIST,
        list=["mch_456"]
    )
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

def test_policy_engine_merchant_allowlist_hit(base_intent, base_transaction):
    base_intent.merchant_restrictions = MerchantRestrictions(
        type=MerchantRestrictionType.ALLOWLIST,
        list=["mch_123"]
    )
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 0

def test_policy_engine_merchant_allowlist_miss(base_intent, base_transaction):
    base_intent.merchant_restrictions = MerchantRestrictions(
        type=MerchantRestrictionType.ALLOWLIST,
        list=["mch_456"]
    )
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 1
    assert violations[0].code == ViolationCode.MERCHANT_BLOCKED

# --- MULTIPLE VIOLATIONS ---
def test_policy_engine_multiple_violations(base_intent, base_transaction):
    base_transaction.total_amount = 9000.0 # Violation 1
    base_transaction.currency = "USD"      # Violation 2
    base_transaction.has_recurring_payment = True # Violation 3
    
    violations = policy_engine.evaluate(base_intent, base_transaction)
    assert len(violations) == 3
    codes = [v.code for v in violations]
    assert ViolationCode.MAX_AMOUNT_EXCEEDED in codes
    assert ViolationCode.CURRENCY_MISMATCH in codes
    assert ViolationCode.RECURRING_PAYMENT_NOT_ALLOWED in codes
