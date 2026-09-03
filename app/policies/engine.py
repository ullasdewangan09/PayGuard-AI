from typing import List
from app.schemas.intent import IntentContract, MerchantRestrictionType
from app.schemas.transaction import TransactionContract
from app.schemas.evaluation import Violation, ViolationCode, ViolationSeverity

class PolicyEngine:
    def evaluate(self, intent: IntentContract, transaction: TransactionContract) -> List[Violation]:
        violations = []

        # 1. MAX_AMOUNT
        if transaction.total_amount > intent.max_total_amount:
            violations.append(Violation(
                code=ViolationCode.MAX_AMOUNT_EXCEEDED,
                constraint="max_total_amount",
                expected=str(intent.max_total_amount),
                actual=str(transaction.total_amount),
                severity=ViolationSeverity.HARD
            ))
            
        # 2. CURRENCY_MATCH
        if transaction.currency != intent.currency:
            violations.append(Violation(
                code=ViolationCode.CURRENCY_MISMATCH,
                constraint="currency",
                expected=intent.currency,
                actual=transaction.currency,
                severity=ViolationSeverity.HARD
            ))

        # 3. BANNED_CATEGORY and ALLOWED_CATEGORY
        total_quantity = 0
        has_recurring = False

        for item in transaction.items:
            total_quantity += item.quantity
            if item.is_subscription:
                has_recurring = True
                
            if item.category.lower() in [c.lower() for c in intent.banned_categories]:
                violations.append(Violation(
                    code=ViolationCode.BANNED_CATEGORY,
                    constraint="banned_categories",
                    expected="Not in " + str(intent.banned_categories),
                    actual=item.category,
                    severity=ViolationSeverity.HARD
                ))
            
            # If allowed_categories is specified and not empty, check if category is in it
            if intent.allowed_categories and item.category.lower() not in [c.lower() for c in intent.allowed_categories]:
                 violations.append(Violation(
                    code=ViolationCode.BANNED_CATEGORY,
                    constraint="allowed_categories",
                    expected="In " + str(intent.allowed_categories),
                    actual=item.category,
                    severity=ViolationSeverity.HARD
                ))
                
        # 4. RECURRING_PAYMENT
        if has_recurring or transaction.has_recurring_payment:
            if not intent.recurring_payment_allowed:
                violations.append(Violation(
                    code=ViolationCode.RECURRING_PAYMENT_NOT_ALLOWED,
                    constraint="recurring_payment_allowed",
                    expected="False",
                    actual="True",
                    severity=ViolationSeverity.HARD
                ))

        # 5. MAX_QUANTITY
        if intent.max_quantity is not None and total_quantity > intent.max_quantity:
            violations.append(Violation(
                code=ViolationCode.MAX_QUANTITY_EXCEEDED,
                constraint="max_quantity",
                expected=str(intent.max_quantity),
                actual=str(total_quantity),
                severity=ViolationSeverity.HARD
            ))

        # 6. MERCHANT RESTRICTIONS
        if intent.merchant_restrictions.type == MerchantRestrictionType.BLOCKLIST:
            if transaction.merchant.id in intent.merchant_restrictions.list:
                violations.append(Violation(
                    code=ViolationCode.MERCHANT_BLOCKED,
                    constraint="merchant_restrictions.blocklist",
                    expected="Not in blocklist",
                    actual=transaction.merchant.id,
                    severity=ViolationSeverity.HARD
                ))
        elif intent.merchant_restrictions.type == MerchantRestrictionType.ALLOWLIST:
            if transaction.merchant.id not in intent.merchant_restrictions.list:
                # Treat allowlist failures as SOFT violations requiring ASK unless overriden
                violations.append(Violation(
                    code=ViolationCode.MERCHANT_BLOCKED,
                    constraint="merchant_restrictions.allowlist",
                    expected="In allowlist",
                    actual=transaction.merchant.id,
                    severity=ViolationSeverity.SOFT
                ))

        return violations

policy_engine = PolicyEngine()
