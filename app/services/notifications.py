from datetime import datetime, timezone
import logging
import smtplib
from email.message import EmailMessage
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification import Notification
from app.models.receipt import Receipt
from app.models.transaction import Transaction
from app.models.user import User

logger = logging.getLogger(__name__)


class ProviderResult:
    def __init__(self, provider_message_id: Optional[str] = None):
        self.provider_message_id = provider_message_id


class EmailProvider:
    def send(self, to: str, subject: str, body: str, attachment: bytes | None = None, filename: str | None = None, html_body: str | None = None) -> ProviderResult:
        raise NotImplementedError


class MockEmailProvider(EmailProvider):
    def send(self, to: str, subject: str, body: str, attachment: bytes | None = None, filename: str | None = None, html_body: str | None = None) -> ProviderResult:
        logger.info("mock_email_sent", extra={"to": to, "subject": subject})
        return ProviderResult("mock_email")


class SMTPEmailProvider(EmailProvider):
    def send(self, to: str, subject: str, body: str, attachment: bytes | None = None, filename: str | None = None, html_body: str | None = None) -> ProviderResult:
        message = EmailMessage()
        message["From"] = settings.EMAIL_FROM
        message["To"] = to
        message["Subject"] = subject
        message.set_content(body)
        
        if html_body:
            message.add_alternative(html_body, subtype='html')
            
        if attachment and filename:
            message.add_attachment(attachment, maintype="application", subtype="pdf", filename=filename)
            
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return ProviderResult("smtp")


import httpx

class MessageProvider:
    def send(self, to: str, body: str) -> ProviderResult:
        raise NotImplementedError


class MockMessageProvider(MessageProvider):
    def __init__(self, channel: str):
        self.channel = channel

    def send(self, to: str, body: str) -> ProviderResult:
        logger.info("mock_message_sent", extra={"channel": self.channel, "to": to})
        return ProviderResult(f"mock_{self.channel}")


class TelegramProvider(MessageProvider):
    def __init__(self, token: str):
        self.token = token

    def send(self, to: str, body: str) -> ProviderResult:
        if not self.token:
            logger.warning("Telegram skipped: TELEGRAM_BOT_TOKEN not configured")
            return ProviderResult("telegram_skipped")
            
        # Send message to Telegram API (sync mode via httpx.Client or just fire and forget)
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        try:
            with httpx.Client(timeout=10) as client:
                res = client.post(url, json={
                    "chat_id": to,
                    "text": body,
                    "parse_mode": "HTML"
                })
                res.raise_for_status()
                data = res.json()
                msg_id = data.get("result", {}).get("message_id")
                return ProviderResult(f"telegram_{msg_id}")
        except Exception as e:
            logger.error("Failed to send telegram message", extra={"error": str(e)})
            raise e


class NotificationService:
    def email_provider(self) -> EmailProvider:
        if settings.EMAIL_PROVIDER.lower() == "smtp" and settings.SMTP_HOST:
            return SMTPEmailProvider()
        return MockEmailProvider()

    def sms_provider(self) -> MessageProvider:
        if settings.TELEGRAM_BOT_TOKEN:
            return TelegramProvider(settings.TELEGRAM_BOT_TOKEN)
        return MockMessageProvider("sms")

    def whatsapp_provider(self) -> MessageProvider:
        if settings.TELEGRAM_BOT_TOKEN:
            return TelegramProvider(settings.TELEGRAM_BOT_TOKEN)
        return MockMessageProvider("whatsapp")

    def publish_payment_success(self, db: Session, user_id: str, transaction: Transaction, receipt: Receipt, receipt_pdf: bytes | None = None) -> None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, email=f"{user_id}@payguard.local")
            db.add(user)
            db.flush()
        channels = self._enabled_channels(user)
        for channel, target in channels.items():
            self._send_once(db, user, transaction, receipt, "PAYMENT_SUCCESS", channel, target, receipt_pdf)

    def _enabled_channels(self, user: User) -> Dict[str, str]:
        channels: Dict[str, str] = {}
        if user.email_enabled and user.email:
            channels["email"] = user.email
            
        if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID:
            # Overwrite SMS and WhatsApp to send to the master Telegram Chat ID
            channels["sms"] = settings.TELEGRAM_CHAT_ID
            channels["whatsapp"] = settings.TELEGRAM_CHAT_ID
        else:
            if user.sms_enabled and user.phone_number:
                channels["sms"] = user.phone_number
            if user.whatsapp_enabled and user.whatsapp_number:
                channels["whatsapp"] = user.whatsapp_number
        return channels

    def _send_once(self, db: Session, user: User, transaction: Transaction, receipt: Receipt, event_type: str, channel: str, target: str, receipt_pdf: bytes | None) -> Notification:
        key = f"{transaction.razorpay_payment_id}:{event_type}:{channel}"
        existing = db.query(Notification).filter(Notification.idempotency_key == key).first()
        if existing:
            return existing
        notification = Notification(
            user_id=user.id,
            transaction_id=transaction.id,
            receipt_id=receipt.public_id,
            event_type=event_type,
            channel=channel,
            idempotency_key=key,
        )
        db.add(notification)
        db.flush()

        try:
            result = self._deliver(user, transaction, receipt, channel, target, receipt_pdf)
            notification.status = "SENT"
            notification.provider_message_id = result.provider_message_id
            notification.delivered_at = datetime.now(timezone.utc)
        except Exception as exc:
            logger.warning("notification_failed", extra={"channel": channel, "notification_id": notification.id})
            notification.status = "FAILED"
            notification.failed_at = datetime.now(timezone.utc)
            notification.error_code = exc.__class__.__name__
        finally:
            notification.attempt_count += 1
            notification.last_attempt_at = datetime.now(timezone.utc)
            db.commit()
        return notification

    def _deliver(self, user: User, transaction: Transaction, receipt: Receipt, channel: str, target: str, receipt_pdf: bytes | None) -> ProviderResult:
        amount = transaction.transaction_jsonb.get("total_amount")
        currency = transaction.transaction_jsonb.get("currency")
        method = transaction.payment_method or "Razorpay Checkout"
        
        if channel == "email":
            subject = f"Payment successful - PayGuard Order {receipt.receipt_number}"
            
            body = (
                f"Hello {user.id},\n\n"
                "Your payment was successfully completed.\n\n"
                f"Order: {receipt.receipt_number}\n"
                f"Amount: {currency} {amount}\n"
                f"Payment method: {method}\n"
                f"Payment ID: {transaction.razorpay_payment_id}\n"
                "Your PayGuard authorization: APPROVED\n\n"
                f"Download receipt: /api/v1/receipts/{receipt.public_id}\n\n"
                "PayGuard AI"
            )
            
            html_body = f"""
            <html>
                <body style="background-color: #050505; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; margin: 0; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid rgba(0, 255, 157, 0.2); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 30px rgba(0, 255, 157, 0.1);">
                        <div style="background: rgba(0, 255, 157, 0.05); padding: 30px; text-align: center; border-bottom: 1px solid rgba(0, 255, 157, 0.1);">
                            <h1 style="color: #00ff9d; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">PayGuard AI</h1>
                            <p style="color: rgba(255, 255, 255, 0.7); margin: 10px 0 0 0; font-size: 15px;">Payment Successful</p>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 32px; font-weight: 500;">{currency} {amount}</h2>
                            
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">Order No.</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #fff;">{receipt.receipt_number}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">Payment ID</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #fff;">{transaction.razorpay_payment_id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">Method</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #fff;">{method}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">Authorization</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #00ff9d; font-weight: 600;">APPROVED</td>
                                </tr>
                            </table>
                            
                            <p style="color: rgba(255,255,255,0.5); font-size: 13px; text-align: center; margin-top: 40px;">
                                Your official receipt is attached to this email.<br>
                                Need help? Reply directly to this email.
                            </p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            return self.email_provider().send(target, subject, body, receipt_pdf, f"{receipt.receipt_number}.pdf", html_body=html_body)
            
        if channel == "sms":
            body = f"PayGuard: Payment of {currency} {amount} for Order {receipt.receipt_number} was successful. Payment ID: {transaction.razorpay_payment_id}. Receipt: /api/v1/receipts/{receipt.public_id}"
            return self.sms_provider().send(target, body)
            
        body = f"PayGuard AI\n\nPayment successful\n\nOrder: {receipt.receipt_number}\nAmount: {currency} {amount}\nPayment ID: {transaction.razorpay_payment_id}\n\nYour receipt is ready: /api/v1/receipts/{receipt.public_id}"
        return self.whatsapp_provider().send(target, body)


notification_service = NotificationService()
