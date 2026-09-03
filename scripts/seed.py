import asyncio
import uuid
import random
import os
from datetime import datetime, timezone, timedelta
from app.db.database import SessionLocal
from app.models.user import User
from app.models.intent import Intent
from app.models.transaction import Transaction
from app.models.receipt import Receipt
from app.models.evaluation import Evaluation
from app.models.audit import AuditEvent

db = SessionLocal()

def random_date(start_days_ago=30):
    start = datetime.now(timezone.utc) - timedelta(days=start_days_ago)
    return start + timedelta(seconds=random.randint(0, start_days_ago * 24 * 60 * 60))

# Create Mock User
users_data = [
    {"email": "dewangan.ullas119@gmail.com", "phone": "9285254866"}
]

db_users = []
for u in users_data:
    user = db.query(User).filter(User.email == u["email"]).first()
    if not user:
        user = User(
            id=str(uuid.uuid4())[:8],
            email=u["email"],
            phone_number=u["phone"],
            email_enabled=True,
            sms_enabled=True,
            whatsapp_enabled=True
        )
        db.add(user)
    db_users.append(user)

db.commit()
for u in db_users:
    db.refresh(u)

# Create Intents, Transactions, Evaluations, and Receipts
merchants = ["Amazon", "Flipkart", "Netflix", "Spotify", "Steam Games"]
reasons = [
    "High velocity of transactions from this IP.",
    "Unusual purchase pattern for this user account.",
    "Card details matched with known leaked database.",
    "Normal behavior, standard subscription renewal."
]

for user in db_users:
    # 15-20 transactions per user for a rich dashboard
    num_tx = random.randint(15, 20)
    for _ in range(num_tx):
        created_at = random_date()
        amount = round(random.uniform(10.0, 5000.0), 2)
        
        # Determine status
        risk_score = random.randint(0, 100)
        if risk_score > 85:
            status = "BLOCKED"
            action = "block"
            reason = reasons[2]
        elif risk_score > 60:
            status = "DECLINED"
            action = "decline"
            reason = reasons[0]
        else:
            status = "APPROVED"
            action = "allow"
            reason = "Transaction appears normal."

        intent = Intent(
            id=f"int_{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            status="ACTIVE",
            intent_jsonb={"merchant": random.choice(merchants), "device": "mobile", "ip": "192.168.1." + str(random.randint(1,255))},
            created_at=created_at - timedelta(minutes=2)
        )
        db.add(intent)
        db.flush()

        tx = Transaction(
            id=f"tx_{uuid.uuid4().hex[:8]}",
            intent_id=intent.id,
            agent_id=user.id,
            status=status,
            transaction_jsonb={"total_amount": amount, "currency": "INR", "description": "Purchase at " + intent.intent_jsonb["merchant"]},
            payment_status="CAPTURED" if status == "APPROVED" else "FAILED",
            payment_method=random.choice(["card", "upi", "netbanking"]),
            razorpay_order_id=f"order_{uuid.uuid4().hex[:8]}",
            razorpay_payment_id=f"pay_{uuid.uuid4().hex[:8]}" if status == "APPROVED" else None,
            created_at=created_at
        )
        db.add(tx)
        db.flush()

        eval_doc = Evaluation(
            id=f"eval_{uuid.uuid4().hex[:8]}",
            transaction_id=tx.id,
            decision="BLOCK" if status == "BLOCKED" else "APPROVE" if status == "APPROVED" else "ASK",
            explanation=reason,
            created_at=created_at + timedelta(seconds=10)
        )
        db.add(eval_doc)

        if status == "APPROVED":
            rcpt = Receipt(
                public_id=f"rcpt_{uuid.uuid4().hex[:8]}",
                transaction_id=tx.id,
                user_id=user.id,
                receipt_number=f"RCPT-{random.randint(1000, 9999)}",
                amount=amount,
                currency="INR",
                status="READY",
                receipt_jsonb={"items": [{"name": "Service/Product", "price": amount}]},
                created_at=created_at + timedelta(minutes=1)
            )
            db.add(rcpt)

        # Audit Log
        audit = AuditEvent(
            id=f"aud_{uuid.uuid4().hex}",
            event_type=f"TRANSACTION_{status}",
            entity_type="Transaction",
            entity_id=tx.id,
            payload={"amount": amount, "risk_score": risk_score},
            timestamp=created_at
        )
        db.add(audit)

db.commit()
print("Successfully generated fabricated dataset!")
db.close()
