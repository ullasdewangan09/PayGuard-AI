from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.intent import Intent
from app.models.receipt import Receipt
from app.models.transaction import Transaction


class ReceiptService:
    def receipt_number_for(self, transaction_id: str) -> str:
        return f"PG-{transaction_id.replace('txn_', '')[:10].upper()}"

    def get_or_create_for_transaction(self, db: Session, transaction: Transaction, user_id: str) -> Receipt:
        existing = db.query(Receipt).filter(Receipt.transaction_id == transaction.id).first()
        if existing:
            return existing

        data = self._receipt_payload(db, transaction, user_id)
        receipt = Receipt(
            receipt_number=self.receipt_number_for(transaction.id),
            user_id=user_id,
            transaction_id=transaction.id,
            amount=str(data["amount"]),
            currency=data["currency"],
            payment_method=data.get("payment_method"),
            receipt_jsonb=data,
        )
        db.add(receipt)
        db.flush()
        return receipt

    def _receipt_payload(self, db: Session, transaction: Transaction, user_id: str) -> Dict[str, Any]:
        intent = db.query(Intent).filter(Intent.id == transaction.intent_id).first()
        tx = transaction.transaction_jsonb
        items: List[Dict[str, Any]] = []
        for item in tx.get("items", []):
            qty = item.get("quantity", 0)
            unit_price = item.get("unit_price", 0)
            items.append({
                "name": item.get("name"),
                "category": item.get("category"),
                "quantity": qty,
                "unit_price": unit_price,
                "total": qty * unit_price,
            })
        return {
            "brand": "PAYGUARD AI",
            "title": "Payment Receipt",
            "receipt_number": self.receipt_number_for(transaction.id),
            "order_id": transaction.razorpay_order_id,
            "transaction_id": transaction.id,
            "payment_id": transaction.razorpay_payment_id,
            "date_time": (transaction.captured_at or datetime.now(timezone.utc)).isoformat(),
            "customer": user_id,
            "customer_intent_id": intent.id if intent else transaction.intent_id,
            "amount": tx.get("total_amount"),
            "currency": tx.get("currency"),
            "payment_method": transaction.payment_method or "Razorpay Checkout",
            "merchant": tx.get("merchant", {}),
            "items": items,
            "payment_status": "PAID",
            "payguard_authorization": transaction.status,
            "razorpay_payment": transaction.payment_status,
            "security_verification": [
                "User authorization verified",
                "Payment amount verified",
                "Transaction matched",
                "Payment captured successfully",
            ],
        }

    def render_pdf(self, receipt: Receipt) -> bytes:
        lines = self._pdf_lines(receipt.receipt_jsonb)
        stream = BytesIO()
        offsets = []

        def write(value: str) -> None:
            stream.write(value.encode("latin-1", errors="replace"))

        write("%PDF-1.4\n")
        objects = []
        content = self._content_stream(lines)
        objects.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
        objects.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
        objects.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj\n")
        objects.append("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n")
        objects.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n")
        objects.append(f"6 0 obj << /Length {len(content)} >> stream\n{content}\nendstream endobj\n")
        for obj in objects:
            offsets.append(stream.tell())
            write(obj)
        xref = stream.tell()
        write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n")
        for offset in offsets:
            write(f"{offset:010d} 00000 n \n")
        write(f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF")
        return stream.getvalue()

    def _pdf_lines(self, data: Dict[str, Any]) -> List[str]:
        lines = [
            "PAYGUARD AI",
            "Payment Receipt",
            f"Receipt Number: {data.get('receipt_number')}",
            f"Order ID: {data.get('order_id')}",
            f"Payment ID: {data.get('payment_id')}",
            f"Date & Time: {data.get('date_time')}",
            f"Customer: {data.get('customer')}",
            f"Amount: {data.get('currency')} {data.get('amount')}",
            f"Payment Method: {data.get('payment_method')}",
            "",
            "PURCHASE",
        ]
        for item in data.get("items", []):
            lines.append(f"{item.get('name')}  Qty {item.get('quantity')}  Unit {item.get('unit_price')}  Total {item.get('total')}")
        lines.extend([
            "",
            f"Payment Status: {data.get('payment_status')}",
            f"PayGuard Authorization: {data.get('payguard_authorization')}",
            f"Razorpay Payment: {data.get('razorpay_payment')}",
            "",
            "Security Verification",
        ])
        lines.extend([f"- {line}" for line in data.get("security_verification", [])])
        lines.append("Thank you.")
        return lines

    def _content_stream(self, lines: List[str]) -> str:
        y = 740
        chunks = ["BT"]
        for idx, line in enumerate(lines):
            font = "/F2 18 Tf" if idx == 0 else ("/F2 14 Tf" if line in {"Payment Receipt", "PURCHASE", "Security Verification"} else "/F1 10 Tf")
            safe = str(line).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            chunks.append(f"{font} 1 0 0 1 54 {y} Tm ({safe}) Tj")
            y -= 24 if idx == 0 else 16
        chunks.append("ET")
        return "\n".join(chunks)


receipt_service = ReceiptService()
