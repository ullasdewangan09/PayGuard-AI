import razorpay
import hmac
import hashlib
import logging
from app.core.config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RazorpayProvider:
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        
        self.client = None
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))

    def _amount_to_smallest_unit(self, amount: float) -> int:
        """Convert float amount to smallest currency unit (e.g., paise)"""
        return int(round(amount * 100))

    def create_order(self, amount: float, currency: str, receipt: str) -> str:
        """Creates a Razorpay order and returns the order_id"""
        if not self.client:
            logger.warning("Razorpay credentials not set, returning mock order_id")
            return f"order_mock_{receipt}"
            
        data = {
            "amount": self._amount_to_smallest_unit(amount),
            "currency": currency,
            "receipt": receipt,
        }
        
        order = self.client.order.create(data=data)
        return order["id"]

    def checkout_options(self) -> Dict[str, Any]:
        """Return safe Razorpay Checkout config for the frontend."""
        options: Dict[str, Any] = {"key": self.key_id}
        if settings.RAZORPAY_CHECKOUT_METHODS:
            options["method"] = {
                method.strip(): True
                for method in settings.RAZORPAY_CHECKOUT_METHODS.split(",")
                if method.strip()
            }
        return options

    def verify_checkout_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        if not self.key_secret:
            logger.warning("Razorpay key secret not set, failing closed on checkout signature check")
            return False
        message = f"{order_id}|{payment_id}"
        expected_sig = hmac.new(
            bytes(self.key_secret, "utf-8"),
            msg=bytes(message, "utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature)

    def capture_payment(self, payment_id: str, amount: float, currency: str) -> Dict[str, Any]:
        """Captures a Razorpay payment"""
        if not self.client:
            logger.warning("Razorpay credentials not set, returning mock capture success")
            return {"id": payment_id, "status": "captured"}
            
        capture_amount = self._amount_to_smallest_unit(amount)
        return self.client.payment.capture(payment_id, capture_amount, {"currency": currency})

    def fetch_payment(self, payment_id: str) -> Dict[str, Any]:
        """Fetches a payment by ID"""
        if not self.client:
            logger.warning("Razorpay credentials not set, returning mock payment data")
            return {"id": payment_id, "status": "authorized", "order_id": "mock_order"}
            
        return self.client.payment.fetch(payment_id)

    def verify_webhook_signature(self, body: str, signature: str) -> bool:
        """Verifies the Razorpay webhook signature"""
        if not self.webhook_secret:
            logger.warning("Razorpay webhook secret not set, failing closed on signature check")
            return False
            
        expected_sig = hmac.new(
            bytes(self.webhook_secret, 'latin-1'),
            msg=bytes(body, 'latin-1'),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_sig, signature)

razorpay_provider = RazorpayProvider()
